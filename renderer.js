let wavesurfer;
let audioFile;

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
        barGap: 1,
        responsive: true,
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
    setupEventListeners();
});

function setupEventListeners() {
    const dropZone = document.getElementById('dropZone');
    const renderBtn = document.getElementById('renderBtn');
    
    // Color control events
    document.getElementById('bgColor').addEventListener('change', updateColors);
    document.getElementById('waveformColor').addEventListener('change', updateColors);
    document.getElementById('progressColor').addEventListener('change', updateColors);

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

function handleFileDrop(e) {
    e.preventDefault();
    const dropZone = document.getElementById('dropZone');
    dropZone.classList.remove('drag-over');

    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'audio/mp3' || file.type === 'audio/wav')) {
        audioFile = file;
        document.getElementById('songTitle').textContent = file.name;
        document.getElementById('renderBtn').disabled = false;
        wavesurfer.loadBlob(file);
        wavesurfer.on('ready', () => {
            const duration = wavesurfer.getDuration();
            document.getElementById('duration').textContent = formatTime(duration);
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

    // Clone the original canvas
    const clonedCanvas = document.createElement('canvas');
    clonedCanvas.width = canvas.width;
    clonedCanvas.height = canvas.height;
    const ctx = clonedCanvas.getContext('2d');

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
    // Create clipping path for played portion
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, playheadX, canvas.height);
    ctx.clip();
    // Draw progress image only in clipped area
    ctx.drawImage(progressImage, 0, 0);
    ctx.restore();

    // Export the final image with the playhead
    const imageURL = clonedCanvas.toDataURL('image/png');
    resolve(imageURL);
  })
  
}

async function generateVideo() {
    const renderBtn = document.getElementById('renderBtn');
    renderBtn.disabled = true;
    renderBtn.textContent = 'Generating...';

    const frames = [];
    const duration = wavesurfer.getDuration();
    const fps = 5;
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