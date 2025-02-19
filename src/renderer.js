
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
    console.log(file);
    if (file && (file.type === 'audio/mpeg' || file.type === 'audio/wav')) {
        audioFile = file;
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

        document.querySelector('wave-surfer').loadFile(file);
    }
}

function exportWaveformWithProgress() {
    return new Promise((resolve, reject) => {
        const wavesurfer = document.querySelector('wave-surfer').wavesurfer;
        const waveformCanvas = document.querySelector('wave-surfer').waveformCanvas;
        const progressCanvas = document.querySelector('wave-surfer').progressCanvas;

        // Use stored canvas references instead of querying DOM each time
        const clonedCanvas = document.createElement('canvas');
        clonedCanvas.width = waveformCanvas.width;
        clonedCanvas.height = waveformCanvas.height;
        const ctx = clonedCanvas.getContext('2d');

        // Fill background
        const bgColor = document.getElementById('bgColor').value;
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, clonedCanvas.width, clonedCanvas.height);

        // Draw background image
        const bgImageUrl = document.getElementById('bgImage').value;
        if (bgImageUrl) {
            const bgImage = new Image();
            bgImage.src = bgImageUrl;
            ctx.drawImage(bgImage, 0, 0, clonedCanvas.width, clonedCanvas.height);
        }

        // Draw gradient fill, vertically from transparent to 50% black
        const gradient = ctx.createLinearGradient(0, 0, 0, clonedCanvas.height);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)'); // Transparent
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)'); // 50% black
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, clonedCanvas.width, clonedCanvas.height);

        // Draw the original waveform
        ctx.drawImage(waveformCanvas, 0, 0);

        // Calculate progress
        const progress = wavesurfer.getCurrentTime() / wavesurfer.getDuration();
        const playheadX = progress * waveformCanvas.width;

        // Draw progress
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, playheadX, waveformCanvas.height);
        ctx.clip();
        ctx.drawImage(progressCanvas, 0, 0);
        ctx.restore();

        // Draw text overlay
        ctx.drawImage(textCanvas, 0, 0);
        
        const imageURL = clonedCanvas.toDataURL('image/png');
        resolve(imageURL);
    });
}

async function generateVideo() {
    const wavesurfer = document.querySelector('wave-surfer').wavesurfer;

    const renderBtn = document.getElementById('renderBtn');
    renderBtn.disabled = true;
    renderBtn.textContent = 'Generating...';

    const frames = [];
    const duration = wavesurfer.getDuration();
    const fps = 2;
    const frameCount = Math.ceil(duration);

    // Generate frames
    for (let i = 0; i < frameCount; i++) {
        // Calculate progress percentage
        const progress = i / frameCount;
        
        // Set the playback position and wait for seek to complete
        await new Promise(resolve => {
            wavesurfer.seekTo(progress);
            wavesurfer.on('timeupdate', resolve);
        });
        
        // Add a small delay to ensure rendering is stable
        await new Promise(resolve => setTimeout(resolve, 20));
        
        try {
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
