---
name: pair-on-canvas
description: Use a Clearly canvas as mission control for a coding task — read the spec the human placed on the board, do the work in the repo, and report progress, diffs, and next steps back as cards they steer by inking. Load this when the user says "work the task on my canvas", "take this from the board", "what's on my Clearly canvas", "pick up the spec", "let's pair on the canvas", or whenever a human is directing your coding work spatially instead of in a chat thread. Composes clearly-canvas (primitives) + ship-review (diffs) into the loop that turns the board into a shared command surface between a human and a coding agent.
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

# Pair on canvas — the board as mission control

A chat is a single thread: you talk, the human talks, the work scrolls away. A Clearly canvas is a **standing command surface** — the human pins the spec where they can point at it, you land your work as cards beside it, and they steer by *gesture*: circle a region, ink "rename this", drop a sticky "do this first". This skill is the loop that makes the canvas the place a human **directs** a coding agent and **reviews** what comes back — not a place you dump a render.

Prereq: the `clearly` MCP is connected (`clearly-init` if not). Know the primitives from **clearly-canvas**; lean on **ship-review** for the diff itself.

The spine repeats every turn: **intake → plan → work → report → steer → ship.** The board is where the conversation lives *between* turns — durable, pointable, glanceable.

## Why the canvas beats a chat for this (say it to yourself before you start)

Your one unfair advantage here is **pointing, not prompting**. `clearly_canvas_perceive` returns `focus` (what the human selected), `gaze` (where they're looking), and `contents` (every node + bounds). So "make *this* responsive", "wire *these two*", "the bug is in *that* card" resolve to exact nodes. A terminal agent only has words; you have deixis. Use it — it's the whole reason the work is on a board.

## 0. Find the board + the task

```jsonc
clearly_canvas_list_compositions {}                          // newest first → pick the active board
clearly_canvas_perceive { "compositionId": "c_…", "format": "text" }
```

Read the **spec**: the human's text/doc/sticky node, or whatever is in `focus` (selected) / sitting in `gaze.visibleWorldRect` (what they're looking at). If the board is empty, ask them to drop a spec card — or propose one yourself and let them edit it. **Always pass `compositionId`** so everything persists headlessly (no tab needed).

## 1. Intake — restate the task before you spend a turn

Don't guess. Drop a small **"🤖 Reading this as…"** card next to the spec restating the task + your assumptions, and tell them to correct it. One cheap round-trip here saves a wasted work cycle. (`clearly_canvas_act` → `canvas.create-node` text, placed in their `gaze`.)

## 2. Plan — post it where they can veto it

Before any repo edit, land a **"🤖 Plan — &lt;task&gt;"** card: a `canvas.add-document` with the steps, or a framed checklist of text nodes. The human can reorder/cut it *before* you burn tokens. This is the canvas version of "here's my plan, ok?" — but it stays on the board as the task's header.

## 3. Work — in the repo, narrate on the board

Do the real edits with your normal tools (Bash / Edit / the repo). Keep **ONE status card live** and update it in place — don't spam:

```jsonc
// create once…
clearly_canvas_act { "compositionId":"c_…", "action":"canvas.create-node",
  "args":{ "type":"text","name":"status","text":"🟢 working — editing auth.ts (2/5)","x":…, "y":…, "size":15, "fontWeight":600, "fill":"#22c55e" } }   // → { id }
// …then update as you go
clearly_canvas_act { "compositionId":"c_…", "action":"canvas.update-nodes",
  "args":{ "ids":["<statusId>"], "patch":{ "text":"🟡 running tests (4/5)" } } }
```

That status card **is your presence** — the human glances it instead of watching a terminal. (When a tab's open you also appear as a live room `occupant` for free; the status card is the headless equivalent.)

## 4. Report — land the diff as a MAP, not a wall of text

This is `ship-review` — load it. The short version:

```bash
git diff main...HEAD            # or HEAD / --staged / git show <sha>
```
```jsonc
clearly_canvas_act { "compositionId":"c_…", "action":"canvas.add-diff",
  "args":{ "diff":"<full git diff>", "title":"<commit subject>", "commit":"abc1234", "frame":true } }
```

Then make it reviewable: dependency arrows between files that now call each other, and a **"🤖 Summary"** `canvas.add-document` card — *what changed · why · risks · how to verify*. The reviewer sees the shape of the change, not a scroll.

## 5. Steer — read their ink, revise

Tell them to look. Then `clearly_canvas_perceive` again — their annotations land in `contents`, their selection in `focus`. A sticky on `auth.ts` saying "this breaks SSO" is now a node you read and act on: fix the repo, `canvas.update-nodes` the affected card, bump the status. **annotate → perceive → revise** is the loop; run it until they stop inking.

## 6. Ship — close the arc on the board

Open the PR (`gh pr create …`), then land a **"✅ Shipped"** card with the PR URL + commit, and flip the status card to done. The board now shows the whole arc — **spec → plan → diff → PR, with the human's notes in place**: a durable record of the decision, not a chat that vanished. New task → new frame, gutter between; the board becomes a column of tasks, each self-contained.

## Conventions that keep it legible

- **Prefix your cards with 🤖**; leave the human's un-prefixed. At a glance: who said what.
- **One status card, updated in place** — never a trail of status nodes.
- **One frame per task.** The board reads as a stack of tasks, each with its spec/plan/diff/PR.
- **Perceive first; design WITH `backgroundColor`; place work in `gaze`.** (See clearly-canvas.)
- **Headless is fine** — every card persists to the composition with no tab open; just always pass `compositionId`.

## The payoff

A human directs many tasks by **pointing and glancing** — circle the spec, read the status cards, ink a correction — instead of typing paragraphs and scrolling logs. The work becomes a reviewable map that lives on. That's mission control for a coding agent, and it's something a chat thread structurally can't be.
