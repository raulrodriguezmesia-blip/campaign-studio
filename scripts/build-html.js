/**
 * Build step: produce dist/index.html using minified assets,
 * and copy static assets (favicon, logo, etc.) into dist/.
 *
 * Rules:
 *  1. Read index.html from the project root.
 *  2. Replace local .css/.js references with their .min.css/.min.js equivalents.
 *  3. Keep external CDN references (e.g. Chart.js) untouched.
 *  4. Consolidate split bundles: styles.css + charts.css -> styles.min.css,
 *     components.js + app.js -> app.min.js (matching build:css / build:js).
 *  5. Write the result to dist/index.html.
 *  6. Copy the assets/ folder into dist/assets/.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'frontend');
const distDir = path.join(root, 'dist');
const srcHtml = path.join(srcDir, 'index.html');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

let html = fs.readFileSync(srcHtml, 'utf8');

// --- Consolidate bundles that build:css / build:js merge together ---
// charts.css is merged into styles.min.css, so drop its <link>.
html = html.replace(
  /\s*<link[^>]*href=["'](?:\.\/)?charts\.css["'][^>]*>\s*/i,
  '\n'
);
// components.js is merged into app.min.js, so drop its <script>.
html = html.replace(
  /\s*<script[^>]*src=["'](?:\.\/)?components\.js["'][^>]*><\/script>\s*/i,
  '\n'
);

// --- Rewrite local (non-CDN) references to minified equivalents ---
// Only touch href/src values that are NOT absolute URLs (http/https///).
const rewriteLocal = (attr, ext, min) => {
  const re = new RegExp(
    `(${attr}=["'])(?!https?:|//)([^"']+?)\\.${ext}(["'])`,
    'gi'
  );
  html = html.replace(re, (m, pre, base, post) => {
    // Skip if already minified.
    if (base.endsWith('.min')) return m;
    return `${pre}${base}.min.${ext}${post}`;
  });
};

rewriteLocal('href', 'css', 'min.css');
rewriteLocal('src', 'js', 'min.js');

// --- Generate frontend/config.js with the API base URL ---
// VITE_API_URL is provided by the build environment (e.g. Vercel env var).
// Falls back to the local simulator URL so the site works without a backend.
// Default to the live Render API; override with VITE_API_URL when set.
const DEFAULT_API = 'https://campaign-studio-api.onrender.com';
const apiBase =
  process.env.VITE_API_URL && process.env.VITE_API_URL.trim()
    ? process.env.VITE_API_URL.trim().replace(/\/+$/, '') + '/api'
    : DEFAULT_API + '/api';
const configJs = `window.APP_CONFIG = { apiBase: ${JSON.stringify(apiBase)} };\n`;
fs.writeFileSync(path.join(distDir, 'config.js'), configJs, 'utf8');
console.log(`[build-html] -> ${path.join(distDir, 'config.js')} (apiBase: ${apiBase})`);

// Inject config.js BEFORE the app bundle so window.APP_CONFIG is ready.
html = html.replace(
  /(<script[^>]*src=["']app\.min\.js["'][^>]*><\/script>)/i,
  '<script src="config.js"></script>\n    $1'
);

const outHtml = path.join(distDir, 'index.html');
fs.writeFileSync(outHtml, html, 'utf8');
console.log(`[build-html] -> ${outHtml}`);

// --- Copy assets directory if present ---
const assetsSrc = path.join(srcDir, 'assets');
const assetsDst = path.join(distDir, 'assets');
if (fs.existsSync(assetsSrc)) {
  fs.cpSync(assetsSrc, assetsDst, { recursive: true });
  console.log(`[build-html] copied assets -> ${assetsDst}`);
} else {
  console.warn('[build-html] warning: assets/ not found, skipping copy');
}
