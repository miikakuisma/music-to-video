// Add these imports at the top of renderer.js
const fs = require('fs');
const path = require('path');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
});

function setupEventListeners() {
  const dropZone = document.querySelector('.drop-zone');
  const renderBtn = document.getElementById('renderBtn');
  
  // Drop zone events
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', handleFileDrop);
  
  renderBtn.addEventListener('click', generateVideo);    
}

async function handleFileDrop(e) {
  e.preventDefault();
  const dropZone = document.querySelector('.drop-zone');
  dropZone.classList.remove('drag-over');

  const file = (e.target.files && e.target.files[0]) || e.dataTransfer.files[0];
  
  // Handle image files
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      document.querySelector('background-controls').updateBackground(imageUrl);
      document.querySelector('background-controls').backgroundImage = imageUrl;
    };
    reader.readAsDataURL(file);
    return;
  }
  
  // Handle audio files
  if (file && (file.type.startsWith('audio/'))) {
    document.querySelector('wr-wavesurfer').audiofile = file;
    document.getElementById('renderBtn').disabled = false;

    document.querySelector('wr-spinner').setAttribute('visible', 'true');
    document.querySelector('.progress-text').innerText = 'Loading audio..';

    await document.querySelector('wr-wavesurfer').loadFile(file);

    if (file.type === 'audio/mpeg') {
      try {
        document.querySelector('.progress-text').innerText = 'Reading ID3 tags..';

        // Use CommonJS require
        const { parseBuffer } = require('music-metadata');
        
        // Convert File to Buffer
        const buffer = await file.arrayBuffer();
        const metadata = await parseBuffer(
          Buffer.from(buffer),
          { mimeType: file.type }
        );
        
        console.log('Metadata:', metadata);
        
        // Update the input fields with the metadata
        if (metadata.common.title) {
          document.getElementById('songTitleInput').value = metadata.common.title;
        }
        if (metadata.common.artist) {
          document.getElementById('artistNameInput').value = metadata.common.artist;
        }
        // Load image from metadata
        if (metadata.common.picture) {
          const pictureData = metadata.common.picture[0].data;
          const pictureFormat = metadata.common.picture[0].format;
          const blob = new Blob([pictureData], { type: pictureFormat });
          const imageUrl = URL.createObjectURL(blob);
          document.querySelector('background-controls').updateBackground(imageUrl);
          document.querySelector('background-controls').backgroundImage = imageUrl;
        }
      } catch (error) {
        console.error('Error reading metadata:', error);
        // Fallback to filename if metadata reading fails
        const filename = file.name.replace(/\.[^/.]+$/, '');
        document.getElementById('songTitleInput').value = filename;
        document.getElementById('artistNameInput').value = '';
      }
    } else {
      // Parse WAV filename (Artist - Song)
      const filename = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      const parts = filename.split('-').map(part => part.trim());
      if (parts.length === 2) {
        document.getElementById('artistNameInput').value = parts[0];
        document.getElementById('songTitleInput').value = parts[1];
      } else {
        document.getElementById('songTitleInput').value = filename;
        document.getElementById('artistNameInput').value = '';
      }
    }

    document.querySelector('wr-spinner').setAttribute('visible', 'false');

    document.querySelector('text-controls').renderText();
    document.querySelector('waveform-controls').updateWaveform();
    document.querySelector('.progress-text').innerText = '';

    document.querySelector('button[play]').disabled = false;
  }
}

function exportWaveformWithProgress() {
  return new Promise((resolve, reject) => {
    // Grab the wave-surfer element and its canvases
    const wsElement = document.querySelector('wr-wavesurfer');
    const wavesurfer = wsElement.wavesurfer;
    const waveformCanvas = wsElement.waveformCanvas;
    const progressCanvas = wsElement.progressCanvas;
    // Get the text overlay canvas (from canvas.js)
    const textCanvas = document.getElementById('textOverlay');

    // Use the output dimensions stored on the wave-surfer element.
    const OUTPUT_WIDTH = wsElement.width;
    const OUTPUT_HEIGHT = wsElement.height;

    // Create an offscreen canvas to composite the final image.
    const clonedCanvas = document.createElement('canvas');
    clonedCanvas.width = OUTPUT_WIDTH;
    clonedCanvas.height = OUTPUT_HEIGHT;
    const ctx = clonedCanvas.getContext('2d');

    // Fill the background with the selected color.
    const bgColor = document.getElementById('bgColor').value;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

    // Draw background image if provided, scaling it to fill the canvas.
    if (timeline[0].backgroundImage) {
      const backgroundImg = new Image();
      backgroundImg.src = timeline[0].backgroundImage;
      
      // Wait for the image to load
      if (backgroundImg.complete) {
        drawBackgroundWithSettings(ctx, backgroundImg, OUTPUT_WIDTH, OUTPUT_HEIGHT);
        continueProcessing();
      } else {
        backgroundImg.onload = () => {
          drawBackgroundWithSettings(ctx, backgroundImg, OUTPUT_WIDTH, OUTPUT_HEIGHT);
          continueProcessing();
        };
        // Handle potential image loading failure
        backgroundImg.onerror = () => {
          console.error('Failed to load background image');
          continueProcessing();
        };
        // Safety timeout
        setTimeout(continueProcessing, 1000);
      }
    } else {
      continueProcessing();
    }
    
    // Continue processing after the image loads or fails
    function continueProcessing() {
      if (document.getElementById('shadowEnabled').checked) {
        // Draw gradient overlay (from transparent to 50% black) over the whole canvas.
        const gradient = ctx.createLinearGradient(0, 0, 0, OUTPUT_HEIGHT);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
      }

      if (document.getElementById('waveformEnabled').checked) {
        // Since the waveform now always matches the canvas size, draw it across the entire canvas.
        ctx.drawImage(
          waveformCanvas,
          0, 0, waveformCanvas.width, waveformCanvas.height,
          0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT
        );

        // Calculate the playhead position based on current time progress.
        const progress = wavesurfer.getCurrentTime() / wavesurfer.getDuration();
        const playheadX = progress * OUTPUT_WIDTH;

        // Draw the progress overlay by clipping to the played portion over the full canvas.
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, playheadX, OUTPUT_HEIGHT);
        ctx.clip();
        ctx.drawImage(
          progressCanvas,
          0, 0, progressCanvas.width, progressCanvas.height,
          0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT
        );
        ctx.restore();
      }

      // Draw the text overlay
      if (textCanvas) {
        ctx.drawImage(
          textCanvas,
          0, 0, textCanvas.width, textCanvas.height,
          0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT
        );
      }

      const imageURL = clonedCanvas.toDataURL('image/png');
      resolve(imageURL);
    }
  });
}

function drawBackgroundWithSettings(ctx, img, width, height) {
  // Get settings from timeline
  const scale = timeline[0].backgroundScale;
  const position = timeline[0].backgroundPosition;
  
  // Calculate dimensions based on scaling mode
  let imgWidth, imgHeight, x, y;
  
  if (scale === 'cover') {
    // Cover - fill the entire canvas
    const imgRatio = img.width / img.height;
    const canvasRatio = width / height;
    
    if (imgRatio > canvasRatio) {
      // Image is wider than canvas (relative to height)
      imgHeight = height;
      imgWidth = height * imgRatio;
    } else {
      // Image is taller than canvas (relative to width)
      imgWidth = width;
      imgHeight = width / imgRatio;
    }
  } else if (scale === 'contain') {
    // Contain - fit within canvas
    const imgRatio = img.width / img.height;
    const canvasRatio = width / height;
    
    if (imgRatio > canvasRatio) {
      // Image is wider than canvas (relative to height)
      imgWidth = width;
      imgHeight = width / imgRatio;
    } else {
      // Image is taller than canvas (relative to width)
      imgHeight = height;
      imgWidth = height * imgRatio;
    }
  } else if (scale === '100%') {
    // Original size
    imgWidth = img.width;
    imgHeight = img.height;
  } else if (scale === 'custom') {
    // Custom scale percentage
    const scaleFactor = timeline[0].backgroundCustomScale / 100;
    imgWidth = img.width * scaleFactor;
    imgHeight = img.height * scaleFactor;
  }
  
  // Calculate position
  if (position === 'center') {
    x = (width - imgWidth) / 2;
    y = (height - imgHeight) / 2;
  } else if (position === 'top') {
    x = (width - imgWidth) / 2;
    y = 0;
  } else if (position === 'bottom') {
    x = (width - imgWidth) / 2;
    y = height - imgHeight;
  } else if (position === 'left') {
    x = 0;
    y = (height - imgHeight) / 2;
  } else if (position === 'right') {
    x = width - imgWidth;
    y = (height - imgHeight) / 2;
  } else if (position === 'custom') {
    // Custom position percentages
    x = width * (timeline[0].backgroundPositionX / 100) - imgWidth / 2;
    y = height * (timeline[0].backgroundPositionY / 100) - imgHeight / 2;
  }
  
  // Draw the image
  ctx.drawImage(img, x, y, imgWidth, imgHeight);
}

// Add this function to ensure latest settings are captured before rendering
function captureCurrentSettings() {
  // Ensure waveform settings are up-to-date in the timeline model
  const wsElement = document.querySelector('wr-wavesurfer');
  const wavesurfer = wsElement.wavesurfer;
  
  // Get current values from UI
  const barHeight = document.getElementById('waveHeight').value;
  const barWidth = document.getElementById('barWidth').value;
  const barGap = document.getElementById('barGap').value;
  const barAlign = document.getElementById('barAlign').value;
  
  // Update timeline model
  timeline[0].barHeight = parseFloat(barHeight);
  timeline[0].barWidth = parseInt(barWidth);
  timeline[0].barGap = parseInt(barGap);
  timeline[0].barAlign = barAlign;
  
  console.log('Captured settings for rendering:', {
    barHeight: timeline[0].barHeight,
    barWidth: timeline[0].barWidth,
    barGap: timeline[0].barGap,
    barAlign: timeline[0].barAlign
  });
}

// Replace the existing generateVideo function with this batch-based approach
async function generateVideo() {
  // Capture latest settings first
  captureCurrentSettings();
  
  const wavesurfer = document.querySelector('wr-wavesurfer').wavesurfer;
  const renderBtn = document.getElementById('renderBtn');
  renderBtn.disabled = true;
  renderBtn.textContent = 'Generating...';
  
  // Show spinner
  document.querySelector('wr-spinner').setAttribute('visible', 'true');
  
  const progressText = document.querySelector('.progress-text');
  progressText.textContent = 'Preparing to render...';
  
  try {
    const duration = wavesurfer.getDuration();
    const videoWidth = document.querySelector('wr-wavesurfer').width;
    
    // Calculate optimal frame parameters
    // Limit frames to video width (no point in having more)
    const frameCount = Math.min(videoWidth, 1920);
    const fps = Math.min(30, frameCount / duration);
    
    // Start batch rendering
    const batchResult = await require('electron').ipcRenderer.invoke('start-batch-render', {
      audioPath: document.querySelector('wr-wavesurfer').audiofile.path,
      fps,
      frameCount
    });
    
    if (!batchResult.success) {
      throw new Error(`Failed to start rendering: ${batchResult.error}`);
    }
    
    const batchSize = batchResult.batchSize || 100;
    let currentBatch = [];
    
    // Generate frames in batches
    for (let i = 0; i < frameCount; i++) {
      // Update progress text
      if (i % 10 === 0 || i === frameCount - 1) {
        progressText.textContent = `Rendering frame ${i+1}/${frameCount}`;
      }
      
      // Set waveform position
      const progress = i / frameCount;
      wavesurfer.seekTo(progress);
      
      // Small delay to ensure waveform updates
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Generate frame and add to current batch
      const imageData = await exportWaveformWithProgress();
      currentBatch.push(imageData);
      
      // Process batch when it reaches batch size or is the last frame
      if (currentBatch.length >= batchSize || i === frameCount - 1) {
        progressText.textContent = `Writing frames ${i-currentBatch.length+1}-${i+1}/${frameCount}`;
        
        const batchWriteResult = await require('electron').ipcRenderer.invoke('write-frame-batch', {
          frames: currentBatch
        });
        
        if (!batchWriteResult.success) {
          throw new Error(`Failed to write frames: ${batchWriteResult.error}`);
        }
        
        // Clear batch
        currentBatch = [];
      }
    }
    
    // Process video once all frames are written
    progressText.textContent = 'Processing video...';
    const processResult = await require('electron').ipcRenderer.invoke('process-video');
    
    if (!processResult.success) {
      throw new Error(`Failed to process video: ${processResult.error}`);
    }
    
    progressText.textContent = `Video saved to: ${processResult.outputPath}`;
    
    // Clear message after delay
    setTimeout(() => {
      if (progressText.textContent.includes('Video saved')) {
        progressText.textContent = '';
      }
    }, 10000);
    
  } catch (error) {
    console.error('Video generation error:', error);
    progressText.textContent = `Error: ${error.message}`;
    alert(`Error generating video: ${error.message}`);
  } finally {
    // Hide spinner
    document.querySelector('wr-spinner').setAttribute('visible', 'false');
    
    // Re-enable render button
    renderBtn.disabled = false;
    renderBtn.textContent = 'Render Video';
    
    // Reset playback position
    wavesurfer.seekTo(0);
  }
}

// Add these event listeners at the end of the file
require('electron').ipcRenderer.on('load-audio-file', async (event, filePath) => {
  try {
    // Create a File object from the file path
    const stats = await fs.promises.stat(filePath);
    const fileBuffer = await fs.promises.readFile(filePath);
    
    // Get the file type
    const fileType = path.extname(filePath).toLowerCase().substring(1);
    
    // Create a File-like object
    const file = new File([fileBuffer], path.basename(filePath), {
      type: `audio/${fileType}`
    });
    
    // Pass the file to the existing handling code
    document.querySelector('wr-wavesurfer').audiofile = file;
    document.getElementById('renderBtn').disabled = false;

    document.querySelector('wr-spinner').setAttribute('visible', 'true');
    document.querySelector('.progress-text').innerText = 'Loading audio..';

    await document.querySelector('wr-wavesurfer').loadFile(file);
    
    // Process metadata similar to handleFileDrop
    processAudioMetadata(file, filePath);
    
    document.querySelector('wr-spinner').setAttribute('visible', 'false');
    document.querySelector('text-controls').renderText();
    document.querySelector('.progress-text').innerText = '';
    document.querySelector('button[play]').disabled = false;
  } catch (error) {
    console.error('Error loading audio file:', error);
    alert(`Error loading audio file: ${error.message}`);
  }
});

require('electron').ipcRenderer.on('load-image-file', async (event, filePath) => {
  try {
    // Read the image file
    const fileBuffer = await fs.promises.readFile(filePath);
    
    // Convert to data URL
    const base64data = fileBuffer.toString('base64');
    const fileType = path.extname(filePath).toLowerCase().substring(1);
    const imageUrl = `data:image/${fileType};base64,${base64data}`;
    
    // Update the background
    document.querySelector('background-controls').updateBackground(imageUrl);
    document.querySelector('background-controls').backgroundImage = imageUrl;
  } catch (error) {
    console.error('Error loading image file:', error);
    alert(`Error loading image file: ${error.message}`);
  }
});

// Add a helper function to process audio metadata
async function processAudioMetadata(file, filePath) {
  if (file.type === 'audio/mpeg') {
    try {
      document.querySelector('.progress-text').innerText = 'Reading ID3 tags..';
      
      // Use CommonJS require
      const { parseBuffer } = require('music-metadata');
      
      // Convert File to Buffer
      const buffer = await file.arrayBuffer();
      const metadata = await parseBuffer(
        Buffer.from(buffer),
        { mimeType: file.type }
      );
      
      console.log('Metadata:', metadata);
      
      // Update the input fields with the metadata
      if (metadata.common.title) {
        document.getElementById('songTitleInput').value = metadata.common.title;
      }
      if (metadata.common.artist) {
        document.getElementById('artistNameInput').value = metadata.common.artist;
      }
      // Load image from metadata
      if (metadata.common.picture) {
        const pictureData = metadata.common.picture[0].data;
        const pictureFormat = metadata.common.picture[0].format;
        const blob = new Blob([pictureData], { type: pictureFormat });
        const imageUrl = URL.createObjectURL(blob);
        document.querySelector('background-controls').updateBackground(imageUrl);
        document.querySelector('background-controls').backgroundImage = imageUrl;
      }
    } catch (error) {
      console.error('Error reading metadata:', error);
      // Fallback to filename if metadata reading fails
      const filename = path.basename(filePath).replace(/\.[^/.]+$/, '');
      document.getElementById('songTitleInput').value = filename;
      document.getElementById('artistNameInput').value = '';
    }
  } else {
    // Parse WAV filename (Artist - Song)
    const filename = path.basename(filePath).replace(/\.[^/.]+$/, ''); // Remove extension
    const parts = filename.split('-').map(part => part.trim());
    if (parts.length === 2) {
      document.getElementById('artistNameInput').value = parts[0];
      document.getElementById('songTitleInput').value = parts[1];
    } else {
      document.getElementById('songTitleInput').value = filename;
      document.getElementById('artistNameInput').value = '';
    }
  }
}
