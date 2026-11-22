// Bakes the rendered page into dist/index.html so crawlers and link-preview
// bots that don't run JavaScript still see the full content, then stamps the
// sitemap with the build date.
import { readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const serverDir = fileURLToPath(new URL('../dist-server/', import.meta.url));
const { render, faqJsonLd } = await import(new URL('../dist-server/entry-server.js', import.meta.url).href);

const indexPath = `${dist}index.html`;
const html = await readFile(indexPath, 'utf8');
const rootTag = '<div id="root"></div>';
if (!html.includes(rootTag)) throw new Error('prerender: #root placeholder not found in dist/index.html');

const ld = faqJsonLd().replace(/</g, '\\u003c');
const out = html
  .replace(rootTag, `<div id="root">${render()}</div>`)
  .replace('</head>', `    <script type="application/ld+json">${ld}</script>\n  </head>`);
await writeFile(indexPath, out);

const sitemapPath = `${dist}sitemap.xml`;
const today = new Date().toISOString().slice(0, 10);
const sitemap = await readFile(sitemapPath, 'utf8');
await writeFile(sitemapPath, sitemap.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${today}</lastmod>`));

await rm(serverDir, { recursive: true, force: true });
console.log('prerender: wrote dist/index.html and dist/sitemap.xml');
