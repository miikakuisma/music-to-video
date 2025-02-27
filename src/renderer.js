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

  const file = e.dataTransfer.files[0];
  
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
  
  // Handle audio files (existing code)
  console.log('file', file.type);
  if (file && (file.type.startsWith('audio/'))) {
    document.querySelector('wave-surfer').audiofile = file;
    document.getElementById('renderBtn').disabled = false;

    document.querySelector('.spinner').classList.remove('hidden');
    document.querySelector('.spinner').classList.add('flex');
    document.querySelector('.progress-text').innerText = 'Loading audio..';

    await document.querySelector('wave-surfer').loadFile(file);

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

    document.querySelector('.spinner').classList.remove('flex');
    document.querySelector('.spinner').classList.add('hidden');

    document.querySelector('text-controls').renderText();
    document.querySelector('.progress-text').innerText = '';

    document.querySelector('button[play]').disabled = false;
  }
}

function exportWaveformWithProgress() {
    return new Promise((resolve, reject) => {
      // Grab the wave-surfer element and its canvases
      const wsElement = document.querySelector('wave-surfer');
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
      const bgImageUrl = document.querySelector('background-controls').backgroundImage
      if (bgImageUrl) {
        const bgImage = new Image();
        bgImage.src = bgImageUrl;

        // Calculate dimensions to maintain aspect ratio and cover full area
        const imageAspect = bgImage.width / bgImage.height;
        const canvasAspect = OUTPUT_WIDTH / OUTPUT_HEIGHT;
        
        let renderWidth = OUTPUT_WIDTH;
        let renderHeight = OUTPUT_HEIGHT;
        let offsetX = 0;
        let offsetY = 0;
        
        if (imageAspect > canvasAspect) {
          // Image is wider - scale to height
          renderWidth = OUTPUT_HEIGHT * imageAspect;
          offsetX = (OUTPUT_WIDTH - renderWidth) / 2;
        } else {
          // Image is taller - scale to width
          renderHeight = OUTPUT_WIDTH / imageAspect;
          offsetY = (OUTPUT_HEIGHT - renderHeight) / 2;
        }
        
        ctx.drawImage(bgImage, offsetX, offsetY, renderWidth, renderHeight);
      }

      if (document.getElementById('shadowEnabled').checked) {
        // Draw gradient overlay (from transparent to 50% black) over the whole canvas.
        const gradient = ctx.createLinearGradient(0, 0, 0, OUTPUT_HEIGHT);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
      }

      if (document.getElementById('waveformEnabled').checked) {
        // Draw the waveform canvas
        const waveHeight = document.getElementById('waveHeight').value;
        ctx.drawImage(
          waveformCanvas,
          0, 0, waveformCanvas.width, waveformCanvas.height,
          0, OUTPUT_HEIGHT - (OUTPUT_HEIGHT / waveHeight), OUTPUT_WIDTH, OUTPUT_HEIGHT / waveHeight
        );

        // Calculate the playhead position based on current time progress.
        const progress = wavesurfer.getCurrentTime() / wavesurfer.getDuration();
        const playheadX = progress * OUTPUT_WIDTH;

        // Draw the progress overlay: clip to the played portion and scale the progress canvas.
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, playheadX, OUTPUT_HEIGHT);
        ctx.clip();
        ctx.drawImage(
          progressCanvas,
          0, 0, progressCanvas.width, progressCanvas.height,
          0, OUTPUT_HEIGHT - (OUTPUT_HEIGHT / waveHeight), OUTPUT_WIDTH, OUTPUT_HEIGHT / waveHeight
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
    });
}

async function generateVideo() {
  const wavesurfer = document.querySelector('wave-surfer').wavesurfer;
  const renderBtn = document.getElementById('renderBtn');
  renderBtn.disabled = true;
  renderBtn.textContent = 'Generating...';

  const duration = wavesurfer.getDuration();
  const frames = [];
  
  // Get video width from wavesurfer
  const videoWidth = wavesurfer.width || 640; // fallback to 640 if not set
  
  // Calculate frame count based on video width
  // Never generate more frames than pixels we have
  const frameCount = Math.min(videoWidth, Math.ceil(duration));
  const frameInterval = duration / frameCount;

  // Show progress
  const progressText = document.querySelector('.progress-text');

  // Generate frames for the video
  for (let i = 0; i < frameCount; i++) {
    const progress = (i * frameInterval) / duration;
    
    // Update progress text
    progressText.textContent = `Generating frame ${i + 1}/${frameCount}`;
    
    await new Promise(resolve => {
      wavesurfer.seekTo(progress);
      wavesurfer.on('timeupdate', resolve);
    });
    
    await new Promise(resolve => setTimeout(resolve, 20));
    
    try {
      const imageData = await exportWaveformWithProgress();
      frames.push(imageData.toString()); // Convert to string immediately to save memory
    } catch (err) {
      console.error('Error exporting frame:', err);
      alert('Error generating video frames. Please try again.');
      renderBtn.disabled = false;
      renderBtn.textContent = 'Render Video';
      return;
    }
  }

  progressText.textContent = 'Encoding video...';

  try {
    const outputPath = await require('electron').ipcRenderer.invoke('generate-video', {
      frames,
      audioPath: document.querySelector('wave-surfer').audiofile.path,
      frameInterval
    });
    progressText.innerText = `Video saved to: ${outputPath}`;
    // alert(`Video generated successfully!\nSaved to: ${outputPath}`);
  } catch (error) {
      alert('Error generating video: ' + error.message);
  } finally {
    setTimeout(() => {
      progressText.innerText = '';
    }, 3000);
    renderBtn.disabled = false;
    renderBtn.textContent = 'Render Video';
    wavesurfer.seekTo(0);
  }
}
