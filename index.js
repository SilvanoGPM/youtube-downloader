const { app, BrowserWindow } = require('electron');
const { join } = require('path');
const icon = join(__dirname, 'img/icon.png');

app.setAppUserModelId('com.skygod.youtube-downloader');
app.setName('Youtube Downloader');

function createWindow() {
    const window = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 300,
        minHeight: 500,
        center: true,
        frame: false,
        icon,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        },
        show: false,
    });

    window.maximize();
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