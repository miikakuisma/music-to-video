class WaveSurferCanvas extends HTMLElement {
  constructor() {
    super();
    this.wavesurfer = null;
    this.audiofile = null;
    this.waveformCanvas = null;
    this.progressCanvas = null;
    this.width = 640;
    this.height = 360;
  }
  
  connectedCallback() {
    this.render();
    document.addEventListener('DOMContentLoaded', () => {
      this.initWaveSurfer();
    });
  }
  
  render() {
    this.innerHTML = `
      <div class="waveform-container" style="width: ${this.width}px; height: ${this.height}px;">
        <div class="canvas-stack">
          <canvas id="textOverlay"></canvas>
          <div id="waveform"></div>
          <div class="background-shadow-overlay"></div>
        </div>
      </div>
    `;
  }

  initWaveSurfer() {

    const settings = {
      container: this.querySelector('#waveform'),
      waveColor: document.getElementById('waveformColor').value,
      progressColor: document.getElementById('progressColor').value,
      width: this.width,
      height: this.height / 2,
      // barHeight: 1,
      cursorWidth: 0,
      barWidth: parseInt(document.getElementById('barWidth').value) || 4,
      barGap: parseInt(document.getElementById('barGap').value) || 2,
      barAlign: document.getElementById('barAlign').value || 'bottom',
      responsive: true,
      normalize: false,
      partialRender: false,
    }

    this.wavesurfer = WaveSurfer.create(settings);

    // Store current settings
    this.waveformSettings = settings;

    this.wavesurfer.on('ready', () => {
      // Get canvas elements once after wavesurfer is ready
      this.waveformCanvas = this.wavesurfer.renderer.canvasWrapper.querySelector('canvas');
      this.progressCanvas = this.wavesurfer.renderer.progressWrapper.querySelector('canvas');
      document.querySelector('background-controls').updateBackground();
      document.querySelector('waveform-controls').updateWaveform();
      document.querySelector('text-controls').renderText();
      document.querySelector('video-controls').updateVideo();

      // Set up play/pause button
      document.querySelector('button[play]').addEventListener('click', () => {
        this.wavesurfer.playPause();
        if (this.wavesurfer.isPlaying()) {
          // pause icon
          document.querySelector('button[play]').innerHTML = '<svg width="24px" height="24px" viewBox="0 0 512 512" fill="white" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><rect height="320" width="79" x="128" y="96"/><rect height="320" width="79" x="305" y="96"/></g></svg>';
        } else {
          document.querySelector('button[play]').innerHTML = '<svg width="24px" height="24px" viewBox="0 0 512 512" fill="white" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M128,96v320l256-160L128,96L128,96z"/></svg>';
        }
      });
      // Set up progress bar
      this.wavesurfer.on('timeupdate', (seconds) => {
        const progress = (seconds / this.wavesurfer.getDuration()) * 100;
        document.querySelector('.progress-bar-fill').style.width = `${progress}%`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        document.querySelector('.time-display').textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;

        document.querySelector('.progress-handle').style.left = `${progress}%`;
      });
    });

    // Add error handling for WaveSurfer initialization
    this.wavesurfer.on('error', err => {
      console.error('WaveSurfer error:', err);
      alert('Error initializing audio visualization. Please try again.');
    });

    // Add event listener for progress handle dragging
    document.querySelector('.progress-handle').addEventListener('mousedown', (e) => {
      e.preventDefault();
      const currentTime = this.wavesurfer.getCurrentTime();
      const progress = (currentTime / this.wavesurfer.getDuration()) * 100;
      const startX = e.clientX;
      
      const handleMouseMove = (e) => {
        const canvasRect = this.wavesurfer.renderer.canvasWrapper.getBoundingClientRect();
        let relativeX = e.clientX - canvasRect.left;
        relativeX = Math.max(0, Math.min(relativeX, canvasRect.width));
        const newTime = (relativeX / canvasRect.width) * this.wavesurfer.getDuration();
        this.wavesurfer.setTime(newTime);
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    });
  }

  loadFile(file) {
    return new Promise((resolve, reject) => {
      try {
        this.querySelector('.waveform-container').classList.add('file-loaded');
        this.wavesurfer.loadBlob(file);
        this.wavesurfer.on('ready', () => {
          setTimeout(() => {
            document.querySelector('background-controls').updateBackground();
            document.querySelector('waveform-controls').updateWaveform();
            document.querySelector('text-controls').renderText();
            document.querySelector('video-controls').updateVideo();
            resolve();
          }, 0);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

// Define the custom element if not already defined
if (!customElements.get('wave-surfer')) {
  customElements.define('wave-surfer', WaveSurferCanvas);
}
