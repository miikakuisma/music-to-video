let wavesurfer;
let audioFile;
let textCanvas;
let textCtx;

// Initialize WaveSurfer
function initWaveSurfer() {
    wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: document.getElementById('waveformColor').value,
        progressColor: document.getElementById('progressColor').value,
        width: 1280,
        height: 720,
        barHeight: 1,
        barWidth: 2,
        barGap: 2,
        responsive: false,
        normalize: false,
        partialRender: false, // Ensure full waveform is rendered
    });

    // Add error handling for WaveSurfer initialization
    wavesurfer.on('error', err => {
        console.error('WaveSurfer error:', err);
        alert('Error initializing audio visualization. Please try again.');
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initWaveSurfer();
    initTextCanvas();
    setupEventListeners();
    updateColors();
});

function setupEventListeners() {
    const dropZone = document.getElementById('dropZone');
    const renderBtn = document.getElementById('renderBtn');
    
    // Color control events
    document.getElementById('bgColor').addEventListener('input', updateColors);
    document.getElementById('waveformColor').addEventListener('input', updateColors);
    document.getElementById('progressColor').addEventListener('input', updateColors);

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

    // Add text control event listeners
    document.getElementById('songTitleInput').addEventListener('input', renderText);
    document.getElementById('artistNameInput').addEventListener('input', renderText);
    document.getElementById('fontSelect').addEventListener('change', renderText);
    document.getElementById('textColor').addEventListener('input', renderText);
    document.getElementById('fontSize').addEventListener('input', renderText);
}

async function handleFileDrop(e) {
    e.preventDefault();
    const dropZone = document.getElementById('dropZone');
    dropZone.classList.remove('drag-over');

    const file = e.dataTransfer.files[0];
    console.log(file);
    if (file && (file.type === 'audio/mpeg' || file.type === 'audio/wav')) {
        audioFile = file;
        document.getElementById('songTitle').textContent = file.name;
        document.getElementById('renderBtn').disabled = false;

        if (file.type === 'audio/mpeg') {
            try {
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

        wavesurfer.loadBlob(file);
        wavesurfer.on('ready', () => {
            const duration = wavesurfer.getDuration();
            document.getElementById('duration').textContent = formatTime(duration);
            renderText();
        });
    }
}

function updateColors() {
    const bgColor = document.getElementById('bgColor').value;
    const waveformColor = document.getElementById('waveformColor').value;
    const progressColor = document.getElementById('progressColor').value;

    document.querySelector('.waveform-container').style.backgroundColor = bgColor;
    wavesurfer.setOptions({
        waveColor: waveformColor,
        progressColor: progressColor
    });
}

function exportWaveformWithProgress() {
  return new Promise((resolve, reject) => {
    // Get the canvas element used by WaveSurfer
    const canvas = wavesurfer.renderer.canvasWrapper.querySelector('canvas');

    // Create a new canvas with the same dimensions
    const clonedCanvas = document.createElement('canvas');
    clonedCanvas.width = canvas.width;
    clonedCanvas.height = canvas.height;
    const ctx = clonedCanvas.getContext('2d');

    // Fill background with selected color
    const bgColor = document.getElementById('bgColor').value;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, clonedCanvas.width, clonedCanvas.height);

    // Draw the original waveform onto the new canvas
    ctx.drawImage(canvas, 0, 0);

    // Calculate the current playback position
    const progress = wavesurfer.getCurrentTime() / wavesurfer.getDuration();
    const playheadX = progress * canvas.width;

    // Get progress image
    const progressCanvas = wavesurfer.renderer.progressWrapper.querySelector('canvas');
    const progressImage = new Image();
    progressImage.src = progressCanvas.toDataURL('image/png');

    // Draw progress with clipped image put on top of waveform
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, playheadX, canvas.height);
    ctx.clip();
    // Draw progress image only in clipped area
    ctx.drawImage(progressImage, 0, 0);
    ctx.restore();

    // Draw text canvas on top of waveform
    ctx.drawImage(textCanvas, 0, 0);
    
    // Export the final image with the playhead
    const imageURL = clonedCanvas.toDataURL('image/png');
    resolve(imageURL);
  });
}

function initTextCanvas() {
    textCanvas = document.getElementById('textOverlay');
    textCtx = textCanvas.getContext('2d');
    
    // Set canvas size to match waveform
    textCanvas.width = 1280;
    textCanvas.height = 720;
    
    // Initial render
    renderText();
}

function renderText() {
    // Clear the canvas
    textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
    
    // Get text properties
    const songTitle = document.getElementById('songTitleInput').value;
    const artistName = document.getElementById('artistNameInput').value;
    const font = document.getElementById('fontSelect').value;
    const color = document.getElementById('textColor').value;
    const size = document.getElementById('fontSize').value;
    
    textCtx.fillStyle = color;
    textCtx.textAlign = 'center';
    
    // Render song title
    textCtx.font = `bold ${size}px ${font}`;
    textCtx.fillText(songTitle, textCanvas.width / 2, 50);
    
    // Render artist name
    textCtx.font = `${size * 0.8}px ${font}`;
    textCtx.fillText(artistName, textCanvas.width / 2, 50 + size * 1.2);
}

async function generateVideo() {
    const renderBtn = document.getElementById('renderBtn');
    renderBtn.disabled = true;
    renderBtn.textContent = 'Generating...';

    const frames = [];
    const duration = wavesurfer.getDuration();
    const fps = 2;
    const frameCount = Math.ceil(duration * fps);

    // Generate frames
    for (let i = 0; i < frameCount; i++) {
        // Calculate progress percentage
        const progress = i / frameCount;
        
        // Set the playback position
        wavesurfer.seekTo(progress);
        
        // Wait for the render to complete
        await new Promise(resolve => setTimeout(resolve, 10));
        
        try {
            // Use WaveSurfer's exportImage method
            const imageData = await exportWaveformWithProgress();
            frames.push(imageData);
        } catch (err) {
            console.error('Error exporting frame:', err);
            alert('Error generating video frames. Please try again.');
            renderBtn.disabled = false;
            renderBtn.textContent = 'Render Video';
            return;
        }
    }

    try {
        // Convert frames to base64 strings before sending
        const base64Frames = frames.map(frame => frame.toString());
        const outputPath = await require('electron').ipcRenderer.invoke('generate-video', {
            frames: base64Frames,
            audioPath: audioFile.path
        });
        
        alert(`Video generated successfully!\nSaved to: ${outputPath}`);
    } catch (error) {
        alert('Error generating video: ' + error.message);
    } finally {
        renderBtn.disabled = false;
        renderBtn.textContent = 'Render Video';
        // Reset playback position
        wavesurfer.seekTo(0);
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 