const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');

// Set the ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('generate-video', async (event, { frames, audioPath }) => {
  const outputPath = path.join(__dirname, 'output.mp4');
  const tempDir = path.join(__dirname, 'assets', 'temp');

  // Ensure temp directory exists
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Write frames to temp files
  for (let i = 0; i < frames.length; i++) {
    const framePath = path.join(tempDir, `frame_${i}.png`);
    const base64Data = frames[i].replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(framePath, base64Data, 'base64');
  }

  // Generate video using FFmpeg
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(path.join(tempDir, 'frame_%d.png'))
      .inputFPS(1)
      .input(audioPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      // Add standard video format settings
      .outputOptions([
        '-pix_fmt yuv420p', // Standard pixel format for maximum compatibility
        '-movflags +faststart', // Enable streaming
        '-preset medium', // Encoding preset for good balance of quality/speed
        '-profile:v main', // Main profile for better compatibility
        '-level 3.1' // Common compatibility level
      ])
      .output(outputPath)
      .on('end', () => {
        // Cleanup temp files
        fs.readdirSync(tempDir).forEach(file => {
          fs.unlinkSync(path.join(tempDir, file));
        });
        resolve(outputPath);
      })
      .on('error', reject)
      .run();
  });
});
