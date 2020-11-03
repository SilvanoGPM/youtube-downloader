const { MSICreator } = require('electron-wix-msi');
const path = require('path');

const APP_DIR = path.resolve(__dirname, './dist/Youtube Downloader-win32-x64');

const OUT_DIR = path.resolve(__dirname, './windows_installer');

const ICON_PATH = path.resolve(__dirname, './img/icon.ico');

const msiCreator = new MSICreator({
    appDirectory: APP_DIR,
    outputDirectory: OUT_DIR,

    description: 'A YouTube video downloader',
    exe: 'Youtube Downloader',
    name: 'Youtube Downloader',
    manufacturer: 'SkyG0D',
    version: '2.0.0',
    appIconPath: ICON_PATH,
    ui: {
        chooseDirectory: true
    }
});

msiCreator.create().then(function () {
    msiCreator.compile();
})