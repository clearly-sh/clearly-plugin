# Canvas updates and handoff

Use communication blocks when the canvas is the user's working surface. Keep them
outside the final artboards and reuse a status block instead of adding one per tool call.

```sh
beehaven call canvas-add-claude-comm '{"compositionId":"<id>","kind":"status","title":"Designing the campaign","active":true,"statusLines":["Establishing the visual direction"]}'
```

Capture `blockId`, then pass it on subsequent updates. Close with `active:false`.
Use `kind:"build-result"` for a code build (with the actual URL or install command),
`kind:"result"` for design work, and `kind:"narration"` for a concise explanation.
Discover optional fields through `canvas:actions`.

`canvas.add-diff {diff,title,frame:true}` makes a spatial code review from a real diff.
Pass it through a JSON file. Keep code review separate from delivered artwork.

`canvas-add-brand-snapshot` displays a brand reference. It does not change that brand.
Use real brand assets; do not redraw a company's logo from memory. A request to design
an artifact does not inherently authorize changing shared brand settings.

Use normal chat for a question or approval when one is actually required. Do not invent
`canvas-add-claude-template` or `brand-propose-update` actions.

```sh
beehaven call agent-nav-open '{"kind":"composition","id":"<id>"}'
```

This records your location and can navigate connected clients. `delivered:0` means no
client received navigation; it does not invalidate the stored composition. Give the
user the title and composition link on the intended environment. Do not claim a browser
opened merely because a message was delivered.
