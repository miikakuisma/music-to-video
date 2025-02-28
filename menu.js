const { app, Menu, BrowserWindow, dialog } = require('electron');
const path = require('path');

function createAppMenu() {
  // Create the template with platform-specific considerations
  const template = [];
  
  // On macOS, the first menu is the application menu
  if (process.platform === 'darwin') {
    template.push({
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }
  
  // Add the File menu (which will be the first menu on Windows/Linux)
  template.push({
    label: 'File',
    submenu: [
      {
        label: 'Load Audio',
        accelerator: 'CmdOrCtrl+O',
        click: async () => {
          const win = BrowserWindow.getFocusedWindow();
          if (!win) return;
          
          const { canceled, filePaths } = await dialog.showOpenDialog(win, {
            properties: ['openFile'],
            filters: [
              { name: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'] }
            ]
          });
          if (!canceled && filePaths.length > 0) {
            win.webContents.send('load-audio-file', filePaths[0]);
          }
        }
      },
      {
        label: 'Load Image',
        accelerator: 'CmdOrCtrl+I',
        click: async () => {
          const win = BrowserWindow.getFocusedWindow();
          if (!win) return;
          
          const { canceled, filePaths } = await dialog.showOpenDialog(win, {
            properties: ['openFile'],
            filters: [
              { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }
            ]
          });
          if (!canceled && filePaths.length > 0) {
            win.webContents.send('load-image-file', filePaths[0]);
          }
        }
      },
      // Add exit but not on macOS (as it's in the app menu)
      ...(process.platform !== 'darwin' ? [
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'Alt+F4',
          click: () => app.quit()
        }
      ] : [])
    ]
  });
  
  // Add Edit menu
  template.push({
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' }
    ]
  });
  
  // Add our custom View menu with zoom controls
  template.push({
    label: 'View',
    submenu: [
      {
        label: 'Zoom In',
        accelerator: 'CommandOrControl+=',
        click: () => {
          const win = BrowserWindow.getFocusedWindow();
          if (win) win.webContents.send('zoom-in');
        }
      },
      {
        label: 'Zoom Out',
        accelerator: 'CommandOrControl+-',
        click: () => {
          const win = BrowserWindow.getFocusedWindow();
          if (win) win.webContents.send('zoom-out');
        }
      },
      {
        label: 'Reset Zoom',
        accelerator: 'CommandOrControl+0',
        click: () => {
          const win = BrowserWindow.getFocusedWindow();
          if (win) win.webContents.send('zoom-reset');
        }
      },
      { type: 'separator' },
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  });
  
  // Add Help menu
  template.push({
    label: 'Help',
    submenu: [
      {
        label: 'About Wave Render',
        // Don't include on macOS as it's in the app menu
        visible: process.platform !== 'darwin',
        click: async () => {
          const win = BrowserWindow.getFocusedWindow();
          if (!win) return;
          
          dialog.showMessageBox(win, {
            title: 'About Wave Render',
            message: 'Wave Render',
            detail: 'A tool for creating waveform videos from audio files.\nVersion 1.0.0'
          });
        }
      }
    ]
  });

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = { createAppMenu }; 