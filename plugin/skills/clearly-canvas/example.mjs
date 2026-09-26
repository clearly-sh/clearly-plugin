#!/usr/bin/env node
/** Example of a reusable native-node builder. Writes JSON only; it never calls a workspace. */
import { writeFileSync } from 'node:fs';

const [compositionId, output = '/tmp/fieldwork-build.json'] = process.argv.slice(2);
if (!compositionId) throw new Error('Usage: node example.mjs <composition-id> [output.json]');
const grid = { w: 1440, h: 900, margin: 88, gutter: 80 };
const ink = '#172824', paper = '#F2F0E7', orange = '#C84A2E', muted = '#58685E';
const batch = [];
const op = (action, args) => batch.push({ action, args });
const frame = (name, index, fill) => op('frame.create', {
  id: name, name, x: index * (grid.w + grid.gutter), y: 0, w: grid.w, h: grid.h, fill,
});
const node = (parentId, name, type, x, y, w, h, props) => op('canvas.create-node', {
  id: `${parentId}-${name}`, name: `${parentId}-${name}`, parentId, type, x, y, w, h, ...props,
});
const text = (p, name, copy, x, y, w, size = 24, fill = ink, weight = 400, extra = {}) =>
  node(p, name, 'text', x, y, w, undefined, { text: copy, size, family: 'Inter', fontWeight: weight,
    lineHeight: 1.12, fill, ...extra });
const rect = (p, name, x, y, w, h, fill, extra = {}) => node(p, name, 'rect', x, y, w, h, { fill, ...extra });
const circle = (p, name, x, y, d, fill, extra = {}) => node(p, name, 'ellipse', x, y, d, d, { fill, ...extra });
const rule = (p, y, color) => rect(p, `rule-${y}`, grid.margin, y, grid.w - grid.margin * 2, 1, color);
const masthead = (p, index, color) => {
  text(p, 'brand', 'FIELDWORK', grid.margin, 52, 400, 20, color, 700, { letterSpacing: 2 });
  text(p, 'series', 'DESIGN NOTES     /     VOL. 01', 912, 54, 440, 14, color, 400, { letterSpacing: 1 });
  text(p, 'folio', 'STUDIO PRACTICE', grid.margin, 828, 900, 14, color, 400, { letterSpacing: 1 });
  text(p, 'page', String(index).padStart(2, '0'), 1304, 828, 48, 14, color, 400, { align: 'right' });
};

// Brief: show how one simple visual idea becomes a coherent editorial system.
// Hierarchy: statement → geometric proof → compact practical explanation.
// Motif: two fields meet to make a third; repeated with a different function on each slide.
const cover = 'fieldwork-01';
frame(cover, 0, paper); masthead(cover, 1, ink); rule(cover, 104, ink);
text(cover, 'eyebrow', 'A NOTE ON MAKING', 88, 168, 560, 16, orange, 700, { letterSpacing: 2 });
text(cover, 'title', 'Make room\nfor the idea.', 80, 228, 810, 108, ink, 700, { letterSpacing: -4, lineHeight: 1.02 });
text(cover, 'intro', 'Good design begins with a point of view.\nThe system gives it room to grow.', 88, 538, 740, 25, muted);
circle(cover, 'disc', 977, 233, 350, orange);
rect(cover, 'field', 916, 385, 270, 270, ink);
rect(cover, 'intersection', 977, 385, 209, 198, paper, { radius: 0 });
text(cover, 'motif-caption', '01 / TWO FIELDS, ONE IDEA', 920, 696, 420, 14, muted, 400, { letterSpacing: 1 });
rule(cover, 782, ink);

const method = 'fieldwork-02';
frame(method, 1, ink); masthead(method, 2, paper); rule(method, 104, '#607369');
text(method, 'title', 'One idea.\nMany expressions.', 80, 164, 1120, 92, paper, 700, { letterSpacing: -3, lineHeight: 1.04 });
text(method, 'intro', 'Keep the visual logic.\nChange what the content needs.', 952, 380, 400, 24, '#C7CFC4');
const concepts = [
  { x: 88, title: '01 / EMPHASIS', body: 'Let one thing lead.', kind: 0 },
  { x: 520, title: '02 / RELATIONSHIP', body: 'Make the connection visible.', kind: 1 },
  { x: 952, title: '03 / RHYTHM', body: 'Repeat with a reason.', kind: 2 },
];
for (const c of concepts) {
  const y = 518;
  if (c.kind === 0) { circle(method, 'emphasis', c.x, y, 152, orange); circle(method, 'quiet', c.x + 192, y + 92, 60, paper); }
  if (c.kind === 1) { rect(method, 'relation-field', c.x, y + 20, 148, 120, paper); circle(method, 'relation-disc', c.x + 80, y, 152, orange); }
  if (c.kind === 2) for (let i = 0; i < 4; i++) rect(method, `rhythm-${i}`, c.x + i * 78, y + i * 20, 48, 152 - i * 20, i === 3 ? orange : paper);
  text(method, `label-${c.kind}`, c.title, c.x, 714, 380, 16, paper, 700, { letterSpacing: 1 });
  text(method, `body-${c.kind}`, c.body, c.x, 748, 380, 20, '#C7CFC4');
}

const detail = 'fieldwork-03';
frame(detail, 2, orange); masthead(detail, 3, paper); rule(detail, 104, paper);
text(detail, 'title', 'The work is\nin the details.', 80, 168, 1100, 106, paper, 700, { letterSpacing: -4, lineHeight: 1.03 });
text(detail, 'intro', 'A composition is finished when the details\nserve the idea — at every scale.', 88, 436, 850, 28, paper);
rule(detail, 566, paper);
const details = [
  ['TYPE', 'Measure the words.\nGive them a voice.'],
  ['SPACE', 'Group what belongs.\nLet the rest breathe.'],
  ['REVIEW', 'Look at the result.\nMake the next decision.'],
];
details.forEach(([label, body], i) => {
  const x = grid.margin + i * 432;
  text(detail, `label-${i}`, label, x, 610, 380, 16, paper, 700, { letterSpacing: 2 });
  text(detail, `body-${i}`, body, x, 662, 390, 28, paper);
});
writeFileSync(output, JSON.stringify({ compositionId, batch }, null, 2) + '\n');
process.stdout.write(`${output}: ${batch.length} operations\n`);
