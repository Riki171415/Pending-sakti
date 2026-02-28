const { app, BrowserWindow, shell, protocol, net } = require('electron')
const path = require('path')
const fs = require('fs')
const { URL } = require('url')

// Daftarkan 'app' sebagai scheme yang aman
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } }
])

const isDev = !app.isPackaged || process.env.ELECTRON_IS_DEV === '1';
const isDevServer = process.env.NODE_ENV === 'development';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    icon: path.join(__dirname, 'public/icon.png'),
    title: 'Claim Audit App',
    webPreferences: {
      preload: path.join(__dirname, 'preload-electron.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false,
    },
  })

  if (isDevServer && process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else if (isDevServer) {
    win.loadURL('http://localhost:5173').catch(err => {
      console.log('Failed to load localhost, trying file index...', err);
      win.loadFile(path.join(__dirname, 'dist', 'index.html'));
    });
    win.webContents.openDevTools();
  } else {
    // Check if we are packed and where the index is actually located
    let indexPath = path.join(__dirname, 'dist', 'index.html');
    if (!fs.existsSync(indexPath)) {
      indexPath = path.join(__dirname, 'index.html');
    }

    // For preview mode, we can use loadFile to be safe, or app:// protocol
    if (isDev && !isDevServer) {
      win.loadFile(indexPath).catch(err => {
        console.error(`Gagal meload URL app (preview): ${err.message}`);
      });
      win.webContents.openDevTools();
    } else {
      win.loadURL(`app://-/${indexPath.replace(/\\/g, '/')}`).catch(err => {
        console.error(`Gagal meload URL app: ${err.message}`);
      });
    }
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' } // Izinkan pop-up internal/blank untuk pencetakan
  })
}

app.whenReady().then(() => {
  if (!isDev) {
    protocol.handle('app', async (request) => {
      try {
        const url = new Request(request).url;
        let pathname = '';

        try {
          const parsedUrl = new URL(url);
          pathname = decodeURIComponent(parsedUrl.pathname);
        } catch (e) {
          pathname = url.replace('app://-/', '');
        }

        // Normalisasi pathname
        while (pathname.startsWith('/')) pathname = pathname.substring(1)
        if (!pathname || pathname === '') pathname = 'index.html'

        let filePath = path.join(__dirname, 'dist', pathname)

        if (!fs.existsSync(filePath)) {
          // Fallback jika dist/ tidak ditemukan (beberapa packaging pattern mem-flatten dist)
          const fallbackPath = path.join(__dirname, pathname)
          if (fs.existsSync(fallbackPath)) {
            filePath = fallbackPath
          }
        }

        if (!fs.existsSync(filePath)) {
          console.error(`[Protocol app] File not found: ${filePath}`);
          // Coba cari index.html di mana saja yang mungkin
          let indexPath = path.join(__dirname, 'dist', 'index.html')
          if (!fs.existsSync(indexPath)) {
            indexPath = path.join(__dirname, 'index.html')
          }

          if (!fs.existsSync(indexPath)) {
            return new Response('Fatal Error: index.html missing', { status: 404 })
          }
          return new Response(fs.readFileSync(indexPath), {
            headers: { 'content-type': 'text/html' }
          })
        }

        const data = fs.readFileSync(filePath)
        const ext = path.extname(filePath).toLowerCase()
        const mimeTypes = {
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.html': 'text/html',
          '.svg': 'image/svg+xml',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.ico': 'image/x-icon',
          '.json': 'application/json',
          '.woff': 'font/woff',
          '.woff2': 'font/woff2'
        }

        return new Response(data, {
          headers: {
            'content-type': mimeTypes[ext] || 'application/octet-stream',
            'Access-Control-Allow-Origin': '*'
          }
        })
      } catch (err) {
        return new Response(`500 Internal error: ${err.message}`, { status: 500 })
      }
    })
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
