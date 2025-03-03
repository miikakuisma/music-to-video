const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const { spawn } = require('child_process');

// Set the ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

// Set the application name
app.name = 'Wave Render';

// Menu creation function directly in main.js
function createAppMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  return menu;
}

// Create menu when app is ready
app.whenReady().then(() => {
  // Create the application menu
  createAppMenu();
  
  createWindow();
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Wave Render',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  mainWindow.maximize();
  mainWindow.loadFile('index.html');
}

// Replace the stream-video and write-frame handlers with this batch approach
ipcMain.handle('start-batch-render', async (event, { audioPath, fps, frameCount }) => {
  try {
    const outputPath = path.join(app.getPath('downloads'), `wave_render_${Date.now()}.mp4`);
    const tempDir = path.join(app.getPath('temp'), `wave_render_${Date.now()}`);
    
    // Create temp directory
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Store render state globally
    global.renderState = {
      tempDir,
      frameCount,
      currentFrame: 0,
      outputPath,
      fps,
      audioPath,
      status: 'initializing',
      batchSize: 100 // Process 100 frames at a time
    };
    
    return {
      success: true,
      tempDir,
      outputPath,
      batchSize: global.renderState.batchSize
    };
  } catch (error) {
    console.error('Error starting batch render:', error);
    return { success: false, error: error.message };
  }
});

// Write a batch of frames to disk
ipcMain.handle('write-frame-batch', async (event, { frames }) => {
  try {
    if (!global.renderState) {
      return { success: false, error: 'Render not initialized' };
    }
    
    const { tempDir, currentFrame } = global.renderState;
    
    // Write frames to disk
    for (let i = 0; i < frames.length; i++) {
      const frameIndex = currentFrame + i;
      const framePath = path.join(tempDir, `frame_${frameIndex.toString().padStart(6, '0')}.png`);
      
      // Remove header and save to file
      const base64Data = frames[i].replace(/^data:image\/png;base64,/, '');
      fs.writeFileSync(framePath, Buffer.from(base64Data, 'base64'));
    }
    
    // Update frame counter
    global.renderState.currentFrame += frames.length;
    global.renderState.status = 'processing';
    
    return { 
      success: true, 
      processedFrames: global.renderState.currentFrame,
      remainingFrames: global.renderState.frameCount - global.renderState.currentFrame
    };
  } catch (error) {
    console.error('Error writing frame batch:', error);
    return { success: false, error: error.message };
  }
});

// Process all batches and generate the final video
ipcMain.handle('process-video', async (event) => {
  try {
    if (!global.renderState) {
      return { success: false, error: 'Render not initialized' };
    }
    
    const { tempDir, frameCount, fps, audioPath, outputPath } = global.renderState;
    global.renderState.status = 'encoding';
    
    // Process video with ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(path.join(tempDir, 'frame_%06d.png'))
        .inputFPS(fps)
        .input(audioPath)
        .outputOptions([
          '-c:v', 'libx264',      
          '-pix_fmt', 'yuv420p',  
          '-preset', 'ultrafast', 
          '-crf', '23',           
          '-c:a', 'aac',         
          '-b:a', '192k',         
          '-movflags', '+faststart'
        ])
        .output(outputPath)
        .on('progress', (progress) => {
          console.log('FFmpeg Progress:', progress);
        })
        .on('end', () => {
          global.renderState.status = 'complete';
          resolve();
        })
        .on('error', (err) => {
          global.renderState.status = 'error';
          reject(new Error(`FFmpeg error: ${err.message}`));
        })
        .run();
    });
    
    // Clean up temp files in the background
    setTimeout(() => {
      try {
        if (fs.existsSync(tempDir)) {
          const files = fs.readdirSync(tempDir);
          for (const file of files) {
            fs.unlinkSync(path.join(tempDir, file));
          }
          fs.rmdirSync(tempDir);
        }
      } catch (e) {
        console.error('Error cleaning temp files:', e);
      }
    }, 1000);
    
    // Clear global state
    const result = {
      success: true,
      outputPath,
      status: global.renderState.status
    };
    
    global.renderState = null;
    return result;
  } catch (error) {
    console.error('Error processing video:', error);
    
    if (global.renderState) {
      global.renderState.status = 'error';
    }
    
    return { success: false, error: error.message };
  }
});

// Add a way to check render status
ipcMain.handle('check-render-status', (event) => {
  if (!global.renderState) {
    return { status: 'not_initialized' };
  }
  
  return {
    status: global.renderState.status,
    currentFrame: global.renderState.currentFrame,
    totalFrames: global.renderState.frameCount
  };
});
