/**
 * Build step: minify styles.css + charts.css into dist/styles.min.css
 * Uses the csso library API directly (no CLI binary required).
 */
const fs = require('fs');
const path = require('path');
const csso = require('csso');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'frontend');
const distDir = path.join(root, 'dist');

const inputs = ['styles.css', 'charts.css'];

let combined = '';
for (const file of inputs) {
  const filePath = path.join(srcDir, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`[build-css] warning: ${file} not found, skipping`);
    continue;
  }
  combined += `/* ${file} */\n` + fs.readFileSync(filePath, 'utf8') + '\n';
}

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const result = csso.minify(combined, { restructure: true });
const outPath = path.join(distDir, 'styles.min.css');
fs.writeFileSync(outPath, result.css, 'utf8');

const originalSize = Buffer.byteLength(combined, 'utf8');
const minifiedSize = Buffer.byteLength(result.css, 'utf8');
const saved = ((1 - minifiedSize / originalSize) * 100).toFixed(1);

console.log(`[build-css] -> ${outPath}`);
console.log(`[build-css] ${originalSize} bytes -> ${minifiedSize} bytes (${saved}% smaller)`);
