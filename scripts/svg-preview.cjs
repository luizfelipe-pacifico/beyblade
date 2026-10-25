// Renders SVG files to PNG frames so they can be inspected (animations sampled over time).
// Usage: npx electron scripts/svg-preview.cjs <out-dir> <file.svg>... [--times=0,0.5,1.2] [--size=512] [--bg=#20263a]
// CommonJS because Electron's main process loads it directly.
const { app, BrowserWindow } = require('electron');
const { readFileSync, writeFileSync, mkdirSync } = require('node:fs');
const { basename, join, resolve } = require('node:path');

const args = process.argv.slice(2).filter((a) => !a.startsWith('--') && !a.endsWith('svg-preview.cjs') && a !== '.');
const flag = (name, def) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? def;
const [outDir, ...files] = args;
const times = flag('times', '0').split(',').map(Number);
const size = Number(flag('size', '512'));
const bg = flag('bg', '#20263a');

app.whenReady().then(async () => {
  mkdirSync(outDir, { recursive: true });
  const win = new BrowserWindow({ show: false, width: size, height: size, paintWhenInitiallyHidden: true, useContentSize: true, frame: false });
  for (const file of files) {
    const svg = readFileSync(resolve(file), 'utf8');
    const html = `<!doctype html><html><body style="margin:0;background:${bg};width:${size}px;height:${size}px;overflow:hidden">
      <div style="width:${size}px;height:${size}px">${svg.replace(/<\?xml[^>]*>/, '')}</div>
      <style>svg{width:100%;height:100%;display:block}</style></body></html>`;
    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    for (const t of times) {
      // Freeze every CSS animation at time t so frames are deterministic.
      await win.webContents.executeJavaScript(`document.getAnimations().forEach(a => { a.pause(); a.currentTime = ${t * 1000}; }); 0`);
      await new Promise((r) => setTimeout(r, 120));
      const img = await win.webContents.capturePage();
      const name = `${basename(file, '.svg')}${times.length > 1 ? `@${t}s` : ''}.png`;
      writeFileSync(join(outDir, name), img.toPNG());
      console.log(join(outDir, name));
    }
  }
  app.quit();
});
