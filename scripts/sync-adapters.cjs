// Sync the publish adapters (item 9).
//
// `extension/publish-adapters.js` is the single source of truth for the
// platform publish adapters. `electron/publish-adapters.cjs` used to be a
// hand-maintained copy that had already drifted (it was missing the
// Xiaohongshu adapter). It is now generated from the extension file by
// this script — byte for byte, because the file is already dual-compatible
// (classic-script globals for importScripts, plus a module.exports branch
// for Electron's CJS preload).
//
// Runs automatically before `npm run build` (prebuild) and inside
// scripts/package-extension.cjs, so the packaged extension and the
// desktop app can never drift apart again. CI also runs this script and
// fails if the committed .cjs copy differs from the generated one.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const src = path.resolve(__dirname, '../extension/publish-adapters.js');
const dest = path.resolve(__dirname, '../electron/publish-adapters.cjs');

const content = fs.readFileSync(src);
fs.writeFileSync(dest, content);

const hash = crypto.createHash('md5').update(content).digest('hex');
console.log(`[sync-adapters] electron/publish-adapters.cjs <- extension/publish-adapters.js (${(content.length / 1024).toFixed(1)} KB, md5 ${hash})`);
