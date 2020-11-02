const { app, BrowserWindow } = require('electron');
const { join } = require('path');
const path = require('path');

function createWindow() {
    const window = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 300,
        minHeight: 500,
        center: true,
        frame: false,
        icon: path.join(__dirname, 'img/icon.png'),
        webPreferences: {
            nodeIntegration: true,
        }
    });

    window.webContents.openDevTools()
    window.loadFile('index.html');
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