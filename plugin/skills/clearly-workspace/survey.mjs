#!/usr/bin/env node
/**
 * survey.mjs — what is IN this workspace, in one command.
 *
 * `node survey.mjs [--json]`
 *
 * ── WHY A SCRIPT AND NOT PROSE ───────────────────────────────────────────────
 * Answering "what is in here" by hand is ~15 `workspace-sql` round trips, each
 * one a chance to mistype a table name or forget that a SQLite boolean comes
 * back as the STRING 'true'. Every one of those mistakes is silent: you get a
 * number, it is just the wrong number. A script makes the sequence one call and
 * the coercions one decision.
 *
 * ⚠ IT REPORTS WHAT IT CANNOT SEE. A query that fails prints as `?` with its
 * error rather than as 0 — an unreadable table and an empty table are opposite
 * facts, and a survey that renders them alike is worse than no survey.
 *
 * ⚠ READ-ONLY BY CONSTRUCTION. Everything goes through `workspace-sql`, which
 * refuses anything that is not a single SELECT/WITH. This cannot mutate.
 */
import { execFileSync } from 'node:child_process';

const JSON_OUT = process.argv.includes('--json');

/** One guarded SELECT through the CLI. Returns rows, or `{ error }`. */
function sql(query) {
  try {
    const out = execFileSync('beehaven', ['call', 'workspace-sql', JSON.stringify({ query })], {
      encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'],
    });
    const m = out.match(/\{[\s\S]*\}/);
    if (!m) return { error: 'no JSON in response — is the daemon running? `beehaven status`' };
    const body = JSON.parse(m[0]);
    if (body.error) return { error: body.error };
    return { rows: body.rows ?? [] };
  } catch (e) {
    const msg = String(e.stderr || e.message || e);
    // ⚠ The two failures a caller can actually act on, named rather than dumped.
    if (/agent login|Not an agent/i.test(msg)) return { error: 'no agent identity — run `beehaven agent login <name>`' };
    if (/daemon|IPC/i.test(msg)) return { error: 'daemon not reachable — `beehaven status`' };
    return { error: msg.split('\n')[0].slice(0, 160) };
  }
}

const one = (query, col = 'n') => {
  const r = sql(query);
  if (r.error) return { v: null, error: r.error };
  return { v: Number(r.rows?.[0]?.[col] ?? 0) };
};

/** ⚠ SQLite folder booleans store as TEXT. `is_archived != 1` misses every 'true'. */
const LIVE = "(is_archived IS NULL OR is_archived NOT IN (1,'true','1'))";

const counts = {
  documents:    one(`SELECT COUNT(*) AS n FROM notes WHERE ${LIVE}`),
  // ⚠ LIVE ONLY. Counting archived rows too made this flag lie: 16 body-less documents were
  //   resolved by ARCHIVING them, and the health line still reported all 16 as a problem.
  //   A health check that cannot see its own fix is one nobody trusts twice.
  bodyless:     one(`SELECT COUNT(*) AS n FROM notes WHERE ${LIVE} AND id NOT IN (SELECT id FROM "note-content")`),
  projects:     one(`SELECT COUNT(*) AS n FROM projects WHERE ${LIVE}`),
  compositions: one(`SELECT COUNT(*) AS n FROM compositions WHERE ${LIVE} AND (is_system IS NULL OR is_system != 'true')`),
  boards:       one(`SELECT COUNT(*) AS n FROM boards WHERE ${LIVE}`),
  orphanBoards: one(`SELECT COUNT(*) AS n FROM boards WHERE project_id IS NULL OR project_id = ''`),
  tickets:      one(`SELECT COUNT(*) AS n FROM tickets`),
  openTickets:  one(`SELECT COUNT(*) AS n FROM tickets WHERE status NOT IN ('done','closed','resolved')`),
  thoughts:     one(`SELECT COUNT(*) AS n FROM thoughts`),
  files:        one(`SELECT COUNT(*) AS n FROM files WHERE deleted_at IS NULL OR deleted_at = 0`),
  agents:       one(`SELECT COUNT(*) AS n FROM agents WHERE archived IS NULL OR archived NOT IN ('true','1')`),
  liveSessions: one(`SELECT COUNT(*) AS n FROM agent_sessions WHERE state = 'active'`),
};

const name = sql(`SELECT value FROM "team-settings" WHERE key = 'name'`);
const prefix = sql(`SELECT prefix, last_number FROM project_counters WHERE id = 'unfiled'`);
const authors = sql(`SELECT COALESCE(created_by,'(unstamped)') AS who, COUNT(*) AS n FROM notes WHERE ${LIVE} GROUP BY who ORDER BY n DESC LIMIT 6`);

if (JSON_OUT) {
  console.log(JSON.stringify({ name: name.rows?.[0]?.value ?? null, counts, prefix: prefix.rows?.[0] ?? null, authors: authors.rows ?? [] }, null, 2));
  process.exit(0);
}

const n = (c) => (c.error ? `? (${c.error})` : String(c.v));
console.log(`\n  ${name.rows?.[0]?.value ?? '(unnamed workspace)'}`);
if (prefix.rows?.[0]) console.log(`  keys: ${prefix.rows[0].prefix}-*  (${prefix.rows[0].last_number} issued)`);
console.log('  ' + '─'.repeat(46));
for (const [k, v] of Object.entries(counts)) console.log(`  ${k.padEnd(16)} ${n(v)}`);

/**
 * ⚠ THE HEALTH LINES ARE THE POINT. A raw count tells you the size; these tell
 * you what is WRONG, and each one is a defect this workspace has actually had.
 */
const flags = [];
if (counts.bodyless.v > 0) flags.push(`${counts.bodyless.v} document(s) have no body — invisible to document-search forever`);
if (counts.orphanBoards.v > 0) flags.push(`${counts.orphanBoards.v} board(s) have no project — reachable from nothing in the UI`);
if (counts.liveSessions.v > 20) flags.push(`${counts.liveSessions.v} 'active' agent sessions — sessions are reaped after 6h idle, so this is high`);
if (flags.length) { console.log('\n  needs attention'); for (const f of flags) console.log(`  ⚠ ${f}`); }

if (authors.rows?.length) {
  console.log('\n  documents by author');
  for (const a of authors.rows) console.log(`  ${String(a.who).padEnd(34)} ${a.n}`);
}
console.log('');
