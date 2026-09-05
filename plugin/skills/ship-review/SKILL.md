---
name: ship-review
description: Land a code change on a Clearly canvas as a spatial change-map and review it there — one crisp card per file, wired with dependency arrows, ready for the human to ink notes that you read back and act on. Load this after you finish a multi-file edit, before opening a PR, or whenever the user says "review this", "let's look at the diff", "what changed", or "put this PR on the canvas". Turns a linear diff into a reviewable map and closes the loop — human annotates → you revise.
---

> **Tool names below are written UNPREFIXED** (`clearly_canvas_act`). Your runtime may
> expose them with a server prefix — e.g.
> `mcp__plugin_clearly_clearly-staging__clearly_canvas_act`. **Match by suffix, not by
> exact name**: a skill written against the bare name resolves to nothing otherwise, and
> the failure looks like "the tool doesn't exist" rather than "the name is decorated".
>
> **If no such tool is callable at all**, the Clearly MCP server isn't authorised in this
> session — note that these skills still LIST when it isn't, so you find out by firing a
> dead call. Authorise it (`/mcp`, or `claude mcp`), or if you have a shell, use the
> `beehaven` CLI and its own `clearly-canvas` skill instead.

# Ship review — diff → spatial change-map

A 15-file diff is a scroll in a terminal. On a Clearly canvas it's a **map**: every file a card you can lay out, cluster, and draw relationships between — and the human reviews by gesture, inking "this breaks auth" on a card you then read back and fix. That annotate→perceive→revise loop is something a terminal diff can't do.

Prereq: the `clearly` MCP is connected (run `clearly-init` if not). Read `clearly-canvas` for the primitives.

## When to fire

- You just finished a multi-file change and are about to open a PR.
- The user says *review this / what changed / look at the diff / put this on the canvas*.
- A `beehaven watch git` run is pushing commits and you're narrating the review. ⚠ CLI-only — on MCP there is no shell, so drive the review from the diff you already have.

Skip it for a one-line, single-file change — a normal diff is fine. The canvas wins for the **shape of a change**: multiple files, a refactor, anything where relationships matter.

## 1. Capture the diff

From the host shell (you have Bash):

```bash
git diff HEAD                 # working changes
git diff --staged             # what's staged
git diff main...HEAD          # the whole branch / PR
git show <sha>                # one commit
```

Grab the commit subject too (`git log -1 --format=%s`) — it titles the change-map.

## 2. Land it on the canvas

One call does the split + layout + frame:

```jsonc
clearly_canvas_act {
  "compositionId": "c_…",
  "action": "canvas.add-diff",
  "args": {
    "diff":   "<the full git diff text>",
    "title":  "Add per-seat billing",   // the commit subject / PR title
    "commit": "abc1234",                 // optional, shown on the frame
    "frame":  true                        // wrap the file cards in a titled frame (default)
  }
}
// → { ids: ["diff-…", …], frameId: "frame-…", files: 6 }
```

`canvas.add-diff` splits the diff on file boundaries into **one `diff` node per file** — a GitHub-dark card with the path, `+N −M` stat, status dot (added/modified/deleted/renamed), and the hunks rendered in crisp vector monospace — then stacks them in a frame titled with your `title`. Capture the returned `ids` + `frameId`.

> No tab open? Still works — the cards persist headlessly. Tell the user to open the composition to review.

## 3. Make it a MAP, not a list

This is where you earn the canvas. After the cards land, `clearly_canvas_perceive` to get their bounds, then add structure with `clearly_canvas_act` — wire dependencies with `arrow.create {from, to}` (a first-class arrow that binds to the cards + follows them; see `clearly-canvas` → Arrows / connectors):

- **Dependency arrows** — when file A now imports/calls something new in file B, draw a vector arrow A→B. The reviewer instantly sees the blast radius.
- **Cluster by concern** — `canvas.update-nodes` to move cards into groups (API / UI / tests / migration). Drop a `text` heading over each cluster.
- **Flag the risky one** — give the highest-churn or security-touching card a colored `rect` halo behind it, or a `text` callout: "⚠ touches auth — review first".
- **A one-line summary** `text` node at the top: what the change does + what to look at.

A good change-map answers "what changed, how do the pieces relate, and where should I look first" at a glance.

## 4. Close the loop — read the review back

Tell the user: *"It's on the canvas — pan through, drop a comment or ink on any card you want changed."* Then:

```jsonc
clearly_canvas_perceive { "compositionId": "c_…", "format": "text" }
```

Their annotations come back in `contents` (new text/ink nodes near a card) and `focus` (what they selected). Read them, map each note to its file card (by proximity to the card's bounds), make the code change, and either push a fresh `canvas.add-diff` of the revision or `canvas.update-nodes` the card with a "✓ addressed" marker. Repeat until the board is clean.

## The viral bit

A screenshot of a real PR as a spatial map — file cards, dependency arrows, a flagged risk, the reviewer's inked notes — is the thing people share with "wait, you review PRs on an infinite canvas now?". Make every change-map look like that: clean frame, honest arrows, one clear "look here first". The output sells the next install.

## Rules of thumb

- **`canvas.add-diff` once**, then **perceive + arrow** to turn the list into a map.
- **Title it with the commit subject**; flag the riskiest file explicitly.
- **Arrows only where a real dependency changed** — don't decorate, inform.
- **Always re-perceive** to read the human's annotations; map each to a file by bounds; revise.
- **Pair with `beehaven watch git`** to stream each commit's diff onto the board as you work. ⚠ CLI-only; on MCP, land each diff with `canvas.add-diff` as you finish it.
