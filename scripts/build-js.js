/**
 * Build step: minify components.js + app.js into dist/app.min.js
 * Uses the terser library API directly (no CLI binary required).
 */
const fs = require('fs');
const path = require('path');
const terser = require('terser');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'frontend');
const distDir = path.join(root, 'dist');

const inputs = ['components.js', 'app.js'];

const sources = {};
let combined = '';
for (const file of inputs) {
  const filePath = path.join(srcDir, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`[build-js] warning: ${file} not found, skipping`);
    continue;
  }
  const code = fs.readFileSync(filePath, 'utf8');
  sources[file] = code;
  combined += `/* ${file} */\n` + code + '\n';
}

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

async function run() {
  const result = await terser.minify(sources, {
    compress: true,
    mangle: true,
    // sourceMap: {
    //   filename: 'app.min.js',
    //   url: 'app.min.js.map'
    // },
  });

  if (result.error) {
    console.error('[build-js] error:', result.error);
    process.exit(1);
  }

  const outPath = path.join(distDir, 'app.min.js');
  fs.writeFileSync(outPath, result.code, 'utf8');

  const originalSize = Buffer.byteLength(combined, 'utf8');
  const minifiedSize = Buffer.byteLength(result.code, 'utf8');
  const saved = ((1 - minifiedSize / originalSize) * 100).toFixed(1);

  console.log(`[build-js] -> ${outPath}`);
  console.log(`[build-js] ${originalSize} bytes -> ${minifiedSize} bytes (${saved}% smaller)`);
}

run();
