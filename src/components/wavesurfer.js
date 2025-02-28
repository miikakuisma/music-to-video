class WaveSurferWrapper extends HTMLElement {
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
      waveColor: timeline[0].waveformColor,
      progressColor: timeline[0].progressColor,
      width: this.width,
      height: this.height,
      cursorWidth: timeline[0].cursorWidth,
      barWidth: timeline[0].barWidth,
      barHeight: timeline[0].barHeight,
      barGap: timeline[0].barGap,
      barAlign: timeline[0].barAlign,
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
      document.querySelector('wr-preview-controls').createEventListeners()
      // Initialize property for tracking visibility
      this.waveformVisible = true;
    });

    // Add error handling for WaveSurfer initialization
    this.wavesurfer.on('error', err => {
      console.error('WaveSurfer error:', err);
      alert('Error initializing audio visualization. Please try again.');
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
if (!customElements.get('wr-wavesurfer')) {
  customElements.define('wr-wavesurfer', WaveSurferWrapper);
}
