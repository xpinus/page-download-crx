import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';

const dist = 'dist';
const output = path.join(dist, 'page-download-crx.zip');

const zip = new JSZip();

function addDir(dir, zipFolder) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.name === 'page-download-crx.zip') continue;
    if (entry.isDirectory()) {
      addDir(fullPath, zipFolder.folder(entry.name));
    } else {
      zipFolder.file(entry.name, fs.readFileSync(fullPath));
    }
  }
}

addDir(dist, zip);

const content = await zip.generateAsync({ type: 'nodebuffer' });
fs.writeFileSync(output, content);
console.log('✓', output);
