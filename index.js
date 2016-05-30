const {app, BrowserWindow, ipcMain} = require('electron');

let win;

function createWindow () {
  win = new BrowserWindow();
  win.loadURL(`file://${__dirname}/index.html`);
  win.webContents.openDevTools();
  win.on('closed', () => { win = null; });
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (!win) createWindow();
});
app.on('will-finish-launching', () => {
  app.on('open-file', (ev, path) => {
    ev.preventDefault();
    win.webContents.send('file', path);
  });
});
