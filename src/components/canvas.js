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
        </div>
      </div>
    `;
  }

  initWaveSurfer() {
    this.wavesurfer = WaveSurfer.create({
      container: this.querySelector('#waveform'),
      waveColor: document.getElementById('waveformColor').value,
      progressColor: document.getElementById('progressColor').value,
      width: this.width,
      height: this.height,
      barHeight: 1,
      barWidth: 2,
      barGap: 2,
      barAlign: 'bottom',
      responsive: true,
      normalize: false,
      partialRender: false, // Ensure full waveform is rendered
    });

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
    this.wavesurfer.loadBlob(file);
    this.wavesurfer.on('ready', () => {
      setTimeout(() => {
          document.querySelector('text-controls').renderText();
      }, 0);
  });
  }
}

// Define the custom element if not already defined
if (!customElements.get('wave-surfer')) {
  customElements.define('wave-surfer', WaveSurferCanvas);
}
