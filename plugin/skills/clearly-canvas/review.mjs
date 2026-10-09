#!/usr/bin/env node
/** Save review pixels outside the model context. No shell interpolation, no workspace mutations. */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function assertReceipt(result, { requireChange = false } = {}) {
  if (result?.ok === false || result?.error || result?.results?.some(r => r.ok === false)) {
    throw new Error(result.error || result.results?.find(r => !r.ok)?.error || 'Canvas request failed');
  }
  for (const row of result?.results ?? [result]) {
    const value = row.value ?? row;
    if (value.ignoredFields?.length || value.rejectedFields?.length) {
      throw new Error(`Fields were not applied: ${[...(value.ignoredFields ?? []), ...(value.rejectedFields ?? [])].join(', ')}. Some work may have landed; inspect the saved scene before retrying.`);
    }
    if (requireChange) {
      const delta = value.canvasChanges;
      const changed = ['changed', 'partial'].includes(value.outcome) || (Array.isArray(delta) ? delta.length > 0 : delta && typeof delta === 'object'
        ? Number(delta.added || 0) + Number(delta.changed || 0) + Number(delta.removed || 0) > 0
        : value.placed === true || /\.create(-node)?$/.test(String(row.action || '')) && !!value.id && !value.duplicate);
      if (!changed) throw new Error('No nodes changed, or the receipt does not prove a change. Inspect the saved scene; do not treat a match as an update.');
    }
  }
  return result;
}

export function rpc(action, payload, options) {
  const stdout = execFileSync('beehaven', ['call', action, '-'], {
    input: JSON.stringify(payload), encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe'], timeout: 120_000,
  });
  const result = JSON.parse(stdout);
  return assertReceipt(result, options);
}

export function sceneNodes(result) {
  if (!Array.isArray(result?.nodes)) throw new Error('Expected composition-detail includeScene:true to return top-level nodes. Refusing to interpret a missing field as an empty canvas.');
  return result.nodes;
}

/** Resume creates only. Existing layers are preserved, including the person's later edits. */
export function resumeCanvasPlan(plan, snapshot, idManifest = {}) {
  const nodes = sceneNodes(snapshot), byId = new Map(nodes.map(n => [n.id, n]));
  const names = new Map();
  for (const n of nodes) { const list = names.get(n.name) ?? []; list.push(n); names.set(n.name, list); }
  const roots = new Map(), batch = [], skipped = [];
  for (const step of plan.batch ?? []) {
    const args = { ...(step.args ?? {}) };
    if (!['frame.create', 'canvas.create-node'].includes(step.action)) { skipped.push({ action: step.action, reason: 'Resume preserves existing mutations; revise explicitly.' }); continue; }
    const type = step.action === 'frame.create' ? 'frame' : args.type;
    const pinned = args.id || idManifest[args.name];
    const matches = names.get(args.name) ?? [];
    if (!pinned && matches.length > 1) throw new Error(`Ambiguous layer name ${args.name}; use its recorded ID.`);
    const existing = pinned ? byId.get(pinned) : matches[0];
    if (existing) {
      if (existing.type !== type) throw new Error(`Layer ${args.name} has type ${existing.type}, expected ${type}. No automatic replacement.`);
      roots.set(args.name, existing.id); skipped.push({ id: existing.id, name: args.name, reason: 'Already exists; preserved.' }); continue;
    }
    args.id = pinned || `plan-${createHash('sha256').update(`${plan.compositionId}:${args.name}`).digest('hex').slice(0, 24)}`;
    if (args.parentId && roots.has(args.parentId)) args.parentId = roots.get(args.parentId);
    roots.set(args.name, args.id);
    batch.push({ ...step, args });
  }
  return { compositionId: plan.compositionId, expectedCanvasNodesRev: snapshot.canvasNodesRev, batch, skipped };
}

export function saveReview(report, prefix) {
  const preview = report.preview;
  if (!preview?.dataUrl?.startsWith('data:image/png;base64,')) {
    throw new Error(report.previewError || 'No PNG returned. Visual verification is incomplete.');
  }
  const bytes = Buffer.from(preview.dataUrl.slice('data:image/png;base64,'.length), 'base64');
  if (!bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) throw new Error('Invalid PNG response');
  if (bytes.length < 45 || bytes.readUInt32BE(8) !== 13 || bytes.subarray(12,16).toString() !== 'IHDR'
    || !bytes.readUInt32BE(16) || !bytes.readUInt32BE(20)) throw new Error('Invalid PNG response: missing image header/body');
  let offset = 8, imageData = false, end = false;
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset), tag = bytes.subarray(offset+4,offset+8).toString();
    if (offset + length + 12 > bytes.length) throw new Error('Invalid PNG response: truncated image chunk');
    if (tag === 'IDAT' && length > 0) imageData = true;
    offset += length + 12;
    if (tag === 'IEND') { end = length === 0; break; }
  }
  if (!imageData || !end) throw new Error('Invalid PNG response: missing image data/end');
  let base = resolve(prefix);
  const original = base;
  let version = 0;
  while (existsSync(`${base}.png`) || existsSync(`${base}.json`)) base = `${original}-r${report.canvasNodesRev ?? 'unknown'}-${++version}`;
  mkdirSync(dirname(base), { recursive: true });
  const { dataUrl, url, ...metadata } = preview;
  const saved = { ...report, preview: { ...metadata, path: `${base}.png` } };
  writeFileSync(`${base}.png`, bytes);
  writeFileSync(`${base}.json`, JSON.stringify(saved, null, 2) + '\n');
  const craft = report.craft?.findings ?? [];
  return { png: `${base}.png`, report: `${base}.json`,
    // `fix` = a probable defect remains: fix it, or pass its check/id in `ignore` with a reason.
    // `look` = only things worth a second look. `clean` = nothing mechanical found — NOT "good".
    verdict: report.verdict ?? 'unknown', acceptanceStatus: report.acceptanceStatus,
    acceptedFindings: report.acceptedFindings ?? [], blocking: report.blocking,
    craft: craft.map((f) => `${f.severity} ${f.check}: ${f.detail}`),
    audit: (report.audit?.violations ?? []).map(v => ({check:v.kind,layer:v.name || v.id,detail:v.detail || v.message || v.reason || `${v.kind} on ${v.name || v.id}`})),
    scopeWarnings: report.scopeWarnings ?? [],
    assets: (report.assets ?? []).filter(a => a.status !== 'ready'),
    typography: (report.typography?.text ?? []).filter(t => t.issue || t.horizontalOverflow > 1 || !t.autoHeight && t.verticalOverflow > 1 || t.exact === false)
      .map(t => ({layer:t.name || t.id,issue:t.issue,horizontalOverflow:t.horizontalOverflow,verticalOverflow:t.verticalOverflow,
        requestedFont:t.font?.requestedFamily,requestedWeight:t.font?.requestedWeight,resolvedFile:t.font?.file,exact:t.exact})),
    nodes: report.scope?.nodeCount, findings: report.audit?.total, textChecked: report.typography?.checked,
    textOmitted: report.typography?.omitted, visualReviewRequired: true,
    note: report.verdict === 'fix'
      ? 'Fix every warn (or accept an exact finding with a reason), then review changed artboards. Then open the PNG and critique it.'
      : 'Open the PNG with your image-viewing tool, critique it against the studio bar, revise and render again.' };
}

export async function saveReviewPixels(report, prefix, fetchImage = fetch) {
  if (report.preview?.dataUrl) return saveReview(report, prefix);
  const url = report.preview?.url;
  if (!url || !/^https?:\/\//.test(url)) throw new Error(report.previewError || 'No downloadable preview. Visual verification is incomplete.');
  const response = await fetchImage(url);
  if (!response.ok) throw new Error(`Preview download failed (HTTP ${response.status}); request a fresh review.`);
  const bytes = Buffer.from(await response.arrayBuffer());
  return saveReview({ ...report, preview: { ...report.preview, dataUrl: `data:image/png;base64,${bytes.toString('base64')}` } }, prefix);
}

export async function main(argv = process.argv.slice(2)) {
  if (argv.includes('--many')) {
    const args = argv.filter(a => a !== '--many');
    if (args.length !== 3) throw new Error('Usage: node review.mjs --many <compositionId> <artboard-ids.json> <output-directory>');
    const [compositionId, manifest, directory] = args;
    const ids = JSON.parse(readFileSync(manifest, 'utf8'));
    if (!Array.isArray(ids) || !ids.length) throw new Error('The manifest must be a non-empty artboard ID/name array.');
    const response = rpc('canvas-act', { compositionId, action: 'canvas.review-many', args: { ids, preview: 'files' } });
    const reports = response.results?.[0]?.value?.reviews;
    if (!Array.isArray(reports) || reports.length !== ids.length) throw new Error('Incomplete review-many result; do not claim all artboards passed.');
    const saved = [];
    for (let i = 0; i < reports.length; i++) saved.push(await saveReviewPixels(reports[i], resolve(directory, `${String(i + 1).padStart(2, '0')}-${String(ids[i]).replace(/[^a-z0-9_-]/gi, '-')}`)));
    process.stdout.write(JSON.stringify(saved, null, 2) + '\n');
    return;
  }
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
  process.stdout.write(JSON.stringify(await saveReviewPixels(report, prefix), null, 2) + '\n');
}

if (process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  main().catch(error => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
}
