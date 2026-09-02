const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function packageExtension() {
  const extensionDir = path.resolve(__dirname, '../extension');
  const distDir = path.resolve(__dirname, '../dist_extension');

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const manifestPath = path.join(extensionDir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const version = manifest.version || '1.0.0';
  const zipFileName = `nicemd-extension-v${version}.zip`;

  const outputExtensionPath = path.join(extensionDir, zipFileName);
  const outputDistPath = path.join(distDir, zipFileName);

  const zip = new JSZip();

  function addDirectoryToZip(currentDir, currentZip) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
      // Ignore existing zip, crx, or pem files inside extension directory
      if (file.endsWith('.zip') || file.endsWith('.crx') || file.endsWith('.pem') || file.startsWith('.')) {
        continue;
      }
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        const folderZip = currentZip.folder(file);
        addDirectoryToZip(filePath, folderZip);
      } else {
        const content = fs.readFileSync(filePath);
        currentZip.file(file, content);
      }
    }
  }

  console.log(`📦 Packaging extension from: ${extensionDir}...`);
  addDirectoryToZip(extensionDir, zip);

  const content = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  fs.writeFileSync(outputExtensionPath, content);
  fs.writeFileSync(outputDistPath, content);

  console.log(`✅ Extension packaged successfully!`);
  console.log(`📁 In extension dir: ${outputExtensionPath} (${(content.length / 1024).toFixed(2)} KB)`);
  console.log(`📁 In dist_extension: ${outputDistPath}`);
}

packageExtension().catch(console.error);
