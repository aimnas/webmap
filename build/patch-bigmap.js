'use strict';
// One-off: stamp `sector.big` (360² bigmap vs 160² vanilla) onto an already-built dist, by reading
// each sector's map header — no full re-render needed. Future full builds set this directly (build.js).
const fs = require('fs'), path = require('path');
const cfg = require('./config');
const { openSlf } = require('./slf');
const { parseDat } = require('./dat');

// Same map source as createMapSource(): loose dirs (highest priority wins), then the vanilla Maps.slf.
const loose = new Map();
for (const dir of cfg.MAPS_DIRS) {
  let files; try { files = fs.readdirSync(dir); } catch (e) { continue; }
  for (const f of files) { if (!/\.dat$/i.test(f)) continue; const c = f.replace(/\.dat$/i, '').toUpperCase(); if (!loose.has(c)) loose.set(c, path.join(dir, f)); }
}
const slf = fs.existsSync(cfg.UB_MAPS_SLF) ? openSlf(cfg.UB_MAPS_SLF) : null;
const getBuf = (code) => { const p = loose.get(code.toUpperCase()); if (p) return fs.readFileSync(p); return slf ? slf.get(code + '.dat') : null; };

const dataPath = path.join(cfg.DIST, 'data.js');
const j = JSON.parse(fs.readFileSync(dataPath, 'utf8').replace(/^window\.JA2_DATA = /, '').replace(/;\s*$/, ''));
const manifest = j.manifest;

let big = 0, std = 0, miss = 0;
for (const lid of manifest.levelOrder) {
  for (const s of manifest.levels[lid].sectors) {
    const buf = getBuf(s.tiles);
    let cols = 0;
    if (buf) { try { cols = parseDat(buf).cols; } catch (e) { cols = 0; } } else miss++;
    s.big = cols > 200;
    if (s.big) big++; else std++;
  }
}

fs.writeFileSync(dataPath, `window.JA2_DATA = ${JSON.stringify(j)};\n`);
fs.writeFileSync(path.join(cfg.DIST, 'manifest.json'), JSON.stringify(manifest, null, 1));
console.log(`bigmaps (360²): ${big} | standard (160²): ${std} | unresolved: ${miss}`);
