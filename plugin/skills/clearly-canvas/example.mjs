#!/usr/bin/env node
/** Three editable page states. Writes JSON only; it never calls a workspace. */
import { writeFileSync } from 'node:fs';

const [compositionId, output = '/tmp/fieldwork-build.json'] = process.argv.slice(2);
if (!compositionId) throw new Error('Usage: node example.mjs <composition-id> [output.json]');
const batch = [];
const op = (action, args) => batch.push({ action, args });
const fillWidth = id => op('canvas.update-nodes', { ids: [id], patch: { layoutSizingH: 'fill' } });
// Page, section, row, card and button share this container contract.
function flow(id, parentId, box, layout, children) {
  // Enable flow before adding children so reading order is creation order.
  op('frame.create', { id, name: id, parentId, fill: 'transparent', ...box,
    autoLayout: { direction: 'v', gap: 24, padding: 0, ...layout },
    layoutSizingH: layout.sizingH ?? 'fixed', layoutSizingV: layout.sizingV ?? 'hug' });
  children(id);
  op('canvas.auto-layout', { id, direction: 'v', gap: 24, padding: 0,
    sizingH: 'fixed', sizingV: 'hug', ...layout });
  return id;
}
function text(parentId, name, copy, w, size, fill, extra = {}) {
  const id = parentId + '/' + name;
  op('canvas.create-node', { id, name, parentId, type: 'text', w, text: copy,
    size, family: 'Inter', fill, lineHeight: 'auto', ...extra });
  fillWidth(id);
  return id;
}
function page(id, x, mobile = false, dark = false) {
  const w = mobile ? 390 : 1440, pad = mobile ? 24 : 80, inner = w - pad * 2;
  const ink = dark ? '#F2F0E7' : '#172824', ground = dark ? '#172824' : '#F2F0E7';
  flow(id, undefined, { x, y: 0, w, h: 1000, fill: ground }, { gap: 64, padding: pad }, p => {
    flow(p + '/navigation', p, { w: inner, h: 48 }, { direction: 'h', align: 'center', justify: 'space-between' }, nav => {
      text(nav, 'brand', 'FIELDWORK', inner - 140, 20, ink, { fontWeight: 700 });
      text(nav, 'edition', 'STUDIO NOTES', 140, 14, ink);
      op('canvas.update-nodes', { ids: [nav + '/edition'], patch: { layoutSizingH: 'fixed' } });
    });
    fillWidth(p + '/navigation');
    flow(p + '/hero', p, { w: inner, h: 420 }, { direction: mobile ? 'v' : 'h', gap: 48 }, hero => {
      const copyWidth = mobile ? inner : 740;
      flow(hero + '/copy', hero, { w: copyWidth, h: 400 }, { gap: 24 }, copy => {
        text(copy, 'eyebrow', 'A NOTE ON MAKING', copyWidth, 14, ink, { letterSpacing: 1.5 });
        text(copy, 'title', 'Make room for the idea.', copyWidth, mobile ? 48 : 88, ink,
          { fontWeight: 700, letterSpacing: -2, lineHeight: '105%' });
        text(copy, 'description', 'A shared direction. An editable system. Room for the next idea.', copyWidth, 22, ink, { lineHeight: '145%' });
        flow(copy + '/action', copy, { w: 240, h: 56, fill: ink, radius: 8 },
          { direction: 'h', padding: 16, align: 'center' }, button => {
            text(button, 'label', 'Explore the studio', 208, 16, ground, { align: 'center' });
          });
      });
      fillWidth(hero + '/copy');
      // Art-directed coordinates belong inside an owning artwork frame.
      const art = hero + '/artwork', aw = mobile ? inner : 400;
      op('frame.create', { id: art, name: 'Artwork / two fields', parentId: hero, w: aw, h: 320, fill: '#C84A2E' });
      op('canvas.create-node', { id: art + '/disc', name: 'Disc', type: 'ellipse', parentId: art, x: 24, y: 24, w: 220, h: 220, fill: '#F2F0E7' });
      op('canvas.create-node', { id: art + '/field', name: 'Field', type: 'rect', parentId: art, x: 116, y: 136, w: 196, h: 160, fill: '#172824' });
    });
    fillWidth(p + '/hero');
    flow(p + '/features', p, { w: inner, h: 220 }, { direction: 'grid', columns: mobile ? 1 : 3,
      rows: mobile ? 3 : 1, rowSizes: mobile ? ['hug', 'hug', 'hug'] : ['hug'], gap: 24, rowGap: 24 }, grid => {
      for (const [name, title, body] of [
        ['type', 'Give ideas a voice.', 'Type scales and wraps with the available space.'],
        ['space', 'Keep room to grow.', 'Content owns its height. Related layers move together.'],
        ['review', 'Make the next edit.', 'Resize a card and extend its copy to check the system.'],
      ]) {
        const card = grid + '/' + name, cw = mobile ? inner : (inner - 48) / 3;
        flow(card, grid, { w: cw, h: 180, fill: dark ? '#294337' : '#FFFFFF', radius: 12 }, { gap: 16, padding: 24 }, c => {
          text(c, 'title', title, cw - 48, 24, ink, { fontWeight: 600 });
          text(c, 'body', body, cw - 48, 18, ink, { lineHeight: '145%' });
        });
        fillWidth(card);
      }
    });
    fillWidth(p + '/features');
    text(p, 'footer', 'FIELDWORK / A SYSTEM READY FOR CHANGE', inner, 14, ink, { letterSpacing: 1 });
  });
}
page('01-desktop', 0);
page('02-mobile', 1520, true);
page('03-dark', 1990, false, true);
writeFileSync(output, JSON.stringify({ compositionId, batch }, null, 2) + '\n');
process.stdout.write(output + ': ' + batch.length + ' operations\n');
