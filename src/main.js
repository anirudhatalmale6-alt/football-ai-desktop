const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
const EULA_ACCEPTED_FILE = path.join(app.getPath('userData'), 'eula_accepted');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 820,
    resizable: true,
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    title: 'AI2ORBIT Football AI',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  mainWindow.setMenuBarVisibility(false);

  if (!fs.existsSync(EULA_ACCEPTED_FILE)) {
    mainWindow.loadFile(path.join(__dirname, 'eula.html'));
  } else {
    mainWindow.loadFile(path.join(__dirname, 'game.html'));
  }
}

ipcMain.on('eula-accepted', () => {
  fs.writeFileSync(EULA_ACCEPTED_FILE, new Date().toISOString());
  mainWindow.loadFile(path.join(__dirname, 'game.html'));
});

ipcMain.on('eula-declined', () => {
  app.quit();
});

ipcMain.on('export-cost', (event, data) => {
  const ts = Date.now();
  const dir = app.getPath('documents');

  const csvPath = path.join(dir, `football_cost_${ts}.csv`);
  fs.writeFileSync(csvPath, data.csv);

  const jsonPath = path.join(dir, `football_cost_${ts}.json`);
  fs.writeFileSync(jsonPath, data.json);

  event.reply('export-done', { csvPath, jsonPath });
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
