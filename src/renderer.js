
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
        document.querySelector('wave-surfer').audiofile = file;
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
        const bgImageUrl = document.getElementById('bgImage').value;
        if (bgImageUrl) {
            const bgImage = new Image();
            bgImage.src = bgImageUrl;
            // Draw the image scaled to the output dimensions.
            ctx.drawImage(bgImage, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
        }

        // Draw gradient overlay (from transparent to 50% black) over the whole canvas.
        const gradient = ctx.createLinearGradient(0, 0, 0, OUTPUT_HEIGHT);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

        // Draw the waveform canvas
        ctx.drawImage(
            waveformCanvas,
            0, 0, waveformCanvas.width, waveformCanvas.height,
            0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT
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
            0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT
        );
        ctx.restore();

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

    const frames = [];
    const duration = wavesurfer.getDuration();
    const fps = 2;
    const frameCount = Math.ceil(duration);

    // Generate frames for the video
    for (let i = 0; i < frameCount; i++) {
        // Calculate playback progress for this frame.
        const progress = i / frameCount;
        
        // Set playback position and wait for the timeupdate event.
        await new Promise(resolve => {
            wavesurfer.seekTo(progress);
            wavesurfer.on('timeupdate', resolve);
        });
        
        // Short delay to ensure proper rendering.
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
        // Convert frames to base64 strings before sending.
        const base64Frames = frames.map(frame => frame.toString());
        const outputPath = await require('electron').ipcRenderer.invoke('generate-video', {
            frames: base64Frames,
            audioPath: document.querySelector('wave-surfer').audiofile.path
        });        
        alert(`Video generated successfully!\nSaved to: ${outputPath}`);
    } catch (error) {
        alert('Error generating video: ' + error.message);
    } finally {
        renderBtn.disabled = false;
        renderBtn.textContent = 'Render Video';
        // Reset playback position to the beginning.
        wavesurfer.seekTo(0);
    }
}
