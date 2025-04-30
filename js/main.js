const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // 加载 index.html（注意路径调整）
    win.loadFile(path.join(__dirname, '../index.html'));
}

app.whenReady().then(createWindow);