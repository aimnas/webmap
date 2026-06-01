'use strict';
const path = require('path');

// AIMNAS (Arulco) instance, pointed at the full "JA2 1.13 AIMNAS" install. The campaign's VFS stack
// (vfs_config.JA2113AIMNAS.ini), highest priority first:
//   Data-Bigmaps ("Maps")  >  Data-AIM ("AIM")  >  Data-1.13 ("v113")  >  Data (vanilla/base SLFs)
// The Arulco maps ship as 360x360 bigmaps in Data-Bigmaps, which also carries a complete tileset set
// (0-99) and the JA2SET table. JA2SET tables and tile graphics are merged/searched down the stack.
const EDIT_ROOT = path.resolve(__dirname, '..', '..');                 // .../edit113
const INSTALL = path.join(EDIT_ROOT, 'JA2 1.13 AIMNAS');               // the full install
const BIGMAPS = path.join(INSTALL, 'Data-Bigmaps');
const AIM = path.join(INSTALL, 'Data-AIM');
const V113 = path.join(INSTALL, 'Data-1.13');
const DATA = path.join(INSTALL, 'Data');
const ja2set = (root) => path.join(root, 'BinaryData', 'JA2SET.DAT');

module.exports = {
  EDIT_ROOT,
  INSTALL,
  // Maps: bigmaps win; loose 1.13/vanilla maps and the vanilla Maps.slf fill any sector not in bigmaps.
  MAPS_DIRS: [path.join(BIGMAPS, 'maps'), path.join(V113, 'Maps'), path.join(DATA, 'Maps')],
  MAPS_DIR: path.join(BIGMAPS, 'maps'),                 // primary (overlays' loot reader)
  UB_MAPS_SLF: path.join(DATA, 'Maps.slf'),
  // !!! THE AIMNAS VFS TRAP !!! AIMNAS REMAPPED the tileset indices (its JA2SET has 100 tilesets with
  // different meanings than vanilla's 70 — e.g. index 3 = "Bayou 1" here vs "LUSH 1" in v1.13). The
  // trap is the JA2SET *merge*: merging the tables fills AIMNAS's blank slots with FILENAMES from the
  // remapped lower tables (707 wrong tiles). So we use ONLY the AIMNAS JA2SET (blank slots fall to its
  // generic tileset 0, like the engine does). Tile GRAPHICS, however, still resolve by filename down
  // the full VFS stack — AIMNAS filenames rarely collide with vanilla's, so this only fills genuine
  // gaps (shared/common tiles) and doesn't pull wrong-biome tiles. Both are needed: no-merge fixes the
  // corruption; the graphics fallback fixes ~520 otherwise-missing tiles.
  JA2SET_DATS: [ja2set(BIGMAPS)],
  TILESET_DIRS: [path.join(BIGMAPS, 'Tilesets'), path.join(AIM, 'tilesets'), path.join(V113, 'Tilesets'), path.join(DATA, 'Tilesets')],
  BASE_TILESETS_SLF: [path.join(DATA, 'Tilesets.slf')],
  // Overlays read the 1.13 Arulco TableData / Scripts / Mod_Settings (AIMNAS doesn't override the map tables).
  TABLEDATA_MAP: path.join(V113, 'TableData', 'Map'),
  AIMNAS: V113,                                         // overlays' Scripts/ + Mod_Settings.ini root
  DIST: path.resolve(__dirname, '..', 'dist'),
  RENDER_SCALE: 1.0,
};
