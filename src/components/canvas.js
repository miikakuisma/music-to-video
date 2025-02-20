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
      height: this.height / 1.5,
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
      document.querySelector('color-controls').updateColors();
    });

    // Add error handling for WaveSurfer initialization
    this.wavesurfer.on('error', err => {
      console.error('WaveSurfer error:', err);
      alert('Error initializing audio visualization. Please try again.');
    });
  }

  loadFile(file) {
    this.querySelector('.waveform-container').classList.add('file-loaded');
    this.wavesurfer.loadBlob(file);
    this.wavesurfer.on('ready', () => {
      setTimeout(() => {
        document.querySelector('text-controls').renderText();
        document.querySelector('color-controls').updateColors();
      }, 0);
    });
  }
}

// Define the custom element if not already defined
if (!customElements.get('wave-surfer')) {
  customElements.define('wave-surfer', WaveSurferCanvas);
}
