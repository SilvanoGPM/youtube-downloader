const { app, BrowserWindow } = require('electron');
const { join } = require('path');
const path = require('path');

function createWindow() {
    const window = new BrowserWindow({
        width: 800,
        height: 600,
        center: true,
        icon: path.join(__dirname, 'img/icon.png'),
        webPreferences: {
            nodeIntegration: true,
        }
    });

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