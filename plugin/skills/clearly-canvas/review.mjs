#!/usr/bin/env node
/** Save review pixels outside the model context. No shell interpolation, no workspace mutations. */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function rpc(action, payload) {
  const stdout = execFileSync('beehaven', ['call', action, '-'], {
    input: JSON.stringify(payload), encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe'], timeout: 120_000,
  });
  const result = JSON.parse(stdout);
  if (result.ok === false || result.error || result.results?.some((r) => r.ok === false)) {
    throw new Error(result.error || result.results.find((r) => !r.ok)?.error || 'Canvas request failed');
  }
  return result;
}

export function saveReview(report, prefix) {
  const preview = report.preview;
  if (!preview?.dataUrl?.startsWith('data:image/png;base64,')) {
    throw new Error(report.previewError || 'No PNG returned. Visual verification is incomplete.');
  }
  const bytes = Buffer.from(preview.dataUrl.slice('data:image/png;base64,'.length), 'base64');
  if (!bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) throw new Error('Invalid PNG response');
  const base = resolve(prefix);
  mkdirSync(dirname(base), { recursive: true });
  const { dataUrl, url, ...metadata } = preview;
  const saved = { ...report, preview: { ...metadata, path: `${base}.png` } };
  writeFileSync(`${base}.png`, bytes);
  writeFileSync(`${base}.json`, JSON.stringify(saved, null, 2) + '\n');
  const craft = report.craft?.findings ?? [];
  return { png: `${base}.png`, report: `${base}.json`,
    // `fix` = a probable defect remains: fix it, or pass its check/id in `ignore` with a reason.
    // `look` = only things worth a second look. `clean` = nothing mechanical found — NOT "good".
    verdict: report.verdict ?? 'unknown', blocking: report.blocking,
    craft: craft.map((f) => `${f.severity} ${f.check}: ${f.detail}`),
    nodes: report.scope?.nodeCount, findings: report.audit?.total, textChecked: report.typography?.checked,
    textOmitted: report.typography?.omitted, visualReviewRequired: true,
    note: report.verdict === 'fix'
      ? 'Fix every warn (or justify it with ignore), then review again. Then open the PNG and critique it.'
      : 'Open the PNG with your image-viewing tool, critique it against the studio bar, revise and render again.' };
}

export function main(argv = process.argv.slice(2)) {
  const legacy = argv.includes('--perceive');
  const args = argv.filter((a) => a !== '--perceive');
  if (args.length !== 3) throw new Error('Usage: node review.mjs <compositionId> <frame-id-or-name> <output-prefix> [--perceive]\n--perceive: older workers, preview only; pass a frame ID.');
  const [compositionId, id, prefix] = args;
  let report;
  if (legacy) {
    const response = rpc('canvas-perceive', { compositionId, includePixels: true, fitNodeIds: [id], pixelScale: 1 });
    const objects = response.room?.contents?.objects || [];
    if (!objects.some((n) => n.id === id)) throw new Error('Frame ID absent from perception; refusing an unverified crop.');
    report = { preview: response.room?.pixels, visualReviewRequired: true,
      limitations: ['Preview-only compatibility mode. Text metrics and scoped audit were not run.'] };
  } else {
    const response = rpc('canvas-act', { compositionId, action: 'canvas.review', args: { ids: [id], pixelScale: 1 } });
    report = response.results?.[0]?.value;
    if (!report?.scope) throw new Error('canvas.review unavailable. Check canvas-catalog; use --perceive for an explicitly preview-only check on an older worker.');
  }
  process.stdout.write(JSON.stringify(saveReview(report, prefix), null, 2) + '\n');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
}
