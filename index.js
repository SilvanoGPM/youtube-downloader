const { app, BrowserWindow } = require('electron');
const { join } = require('path');

try {
    require('electron-reloader')(module);
} catch (_) { }

function createWindow() {
    const window = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 300,
        minHeight: 500,
        center: true,
        frame: false,
        icon: join(__dirname, 'img/icon.png'),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        },
        show: false,
    });

    window.maximize();
    window.webContents.openDevTools()
    window.loadFile('index.html');

    window.once('ready-to-show', () => window.show());
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('active', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
})

