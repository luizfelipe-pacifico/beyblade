// Processo principal do Electron (D-004): abre a janela do jogo servido em 127.0.0.1:5000.
// Em desenvolvimento o servidor é subido por scripts/dev-all.js; aqui só a janela e a segurança
// (checklist em docs/SECURITY.md#electron).
import path from 'node:path';
import { app, BrowserWindow, powerSaveBlocker, session, shell } from 'electron';

const GAME_URL = process.env.GAME_URL ?? 'http://127.0.0.1:5000';
const GAME_ORIGIN = new URL(GAME_URL).origin;

// Compara pela origem do URL parseado, nunca por startsWith (evita 127.0.0.1:5000.exemplo.com).
const isGameUrl = (raw) => {
  try {
    return new URL(raw).origin === GAME_ORIGIN;
  } catch {
    return false;
  }
};

if (!app.requestSingleInstanceLock()) app.quit();
// Ícone na janela e na barra de tarefas (arte em docs/ART.md, "Ícone do jogo"). O AppUserModelId faz o
// Windows agrupar a janela com o ícone do jogo, e não com o do Electron.
const ICON = path.join(import.meta.dirname, '..', process.platform === 'win32' ? 'build/icon.ico' : 'public/icon-512.png');
if (process.platform === 'win32') app.setAppUserModelId('com.beyblade.arena');

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    title: 'Beyblade Arena',
    icon: ICON,
    backgroundColor: '#0d1226',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true,
      // Os sons da batalha tocam desde a primeira tela, sem exigir um clique antes.
      autoplayPolicy: 'no-user-gesture-required',
    },
  });

  win.once('ready-to-show', () => win.show());

  win.webContents.on('will-navigate', (event, url) => {
    if (!isGameUrl(url)) event.preventDefault();
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });

  win.loadURL(GAME_URL);
  win.on('closed', () => {
    win = null;
  });
}

app.on('second-instance', () => {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.focus();
});

app.whenReady().then(() => {
  // O jogo não precisa de câmera, microfone, notificações etc.; a Gamepad API não pede permissão.
  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
  // Evita a tela apagar ou o sistema reduzir o clock no meio de uma partida.
  const blocker = powerSaveBlocker.start('prevent-display-sleep');
  app.on('will-quit', () => powerSaveBlocker.stop(blocker));
  createWindow();
});

app.on('window-all-closed', () => app.quit());
