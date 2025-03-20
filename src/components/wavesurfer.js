class WaveSurferWrapper extends HTMLElement {
  constructor() {
    super();
    this.wavesurfer = null;
    this.audiofile = null;
    this.waveformCanvas = null;
    this.progressCanvas = null;
    this.width = 640;
    this.height = 360;
    this.zoom = 1;
    this.maxZoom = 3;
    this.minZoom = 0.5;
  }
  
  connectedCallback() {
    this.render();
    document.addEventListener('DOMContentLoaded', () => {
      this.initWaveSurfer();
      // When the app is loaded, check for a stored audio file
      this.loadStoredAudio();
    });
  }
  
  render() {
    this.innerHTML = `
      <div class="waveform-container" style="width: ${this.width}px; height: ${this.height}px; zoom: ${this.zoom};">
        <div class="canvas-stack">
          <canvas id="textOverlay"></canvas>
          <div id="waveform"></div>
          <div class="background-shadow-overlay"></div>
        </div>
      </div>
    `;
  }

  initWaveSurfer() {
    // Ensure barHeight is properly set
    if (!timeline[0].barHeight && timeline[0].barHeight !== 0) {
      timeline[0].barHeight = 0.5;
    }

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
      
      // Make sure the render button is enabled
      document.getElementById('renderBtn').disabled = false;
      
      // Dispatch audio-loaded event
      document.dispatchEvent(new CustomEvent('audio-loaded', {
        detail: { audioElement: this.wavesurfer.media }
      }));
    });

    // Add error handling for WaveSurfer initialization
    this.wavesurfer.on('error', err => {
      console.error('WaveSurfer error:', err);
      alert('Error initializing audio visualization. Please try again.');
    });    
  }

  async loadFile(file) {
    // Set the audiofile property
    this.audiofile = file;
    
    return new Promise((resolve, reject) => {
      try {
        // Create a URL for the file
        const url = URL.createObjectURL(file);
        
        // Load the audio file
        this.wavesurfer.load(url);
        
        // Wait for the waveform to be ready
        this.wavesurfer.once('ready', () => {
          document.querySelector('background-controls').updateBackground();
          document.querySelector('waveform-controls').updateWaveform();
          document.querySelector('text-controls').renderText();
          document.querySelector('video-controls').updateVideo();
          
          // Hide the spinner and update UI
          document.querySelector('wr-spinner').setAttribute('visible', 'false');
          document.querySelector('.progress-text').innerText = '';
          document.querySelector('button[play]').disabled = false;

          this.querySelector('.waveform-container').classList.add('file-loaded');
          
          // Store the audio file into IndexedDB using the new module
          import('./audio-storage.js').then(module => {
            const audioStorage = module.default;
            audioStorage.saveAudioFile(file).catch(err => {
              console.error("Error storing audio file:", err);
            });
          });
          
          // Make sure the render button is enabled
          document.getElementById('renderBtn').disabled = false;
          
          // Dispatch audio-loaded event
          document.dispatchEvent(new CustomEvent('audio-loaded', {
            detail: { audioElement: this.wavesurfer.media }
          }));
          
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Load stored audio file from IndexedDB
  async loadStoredAudio() {
    try {
      const { default: audioStorage } = await import('./audio-storage.js');
      const file = await audioStorage.getAudioFile();
      
      if (file) {
        this.audiofile = file;
        const url = URL.createObjectURL(file);
        this.wavesurfer.load(url);
        
        this.wavesurfer.once('ready', () => {
          document.querySelector('background-controls').updateBackground();
          document.querySelector('waveform-controls').updateWaveform();
          document.querySelector('text-controls').renderText();
          document.querySelector('video-controls').updateVideo();
          
          // Explicitly recreate event listeners for the play button
          const previewControls = document.querySelector('wr-preview-controls');
          if (previewControls) {
            console.log('Reattaching preview controls event listeners');
            previewControls.createEventListeners();
          }
          
          document.querySelector('wr-spinner').setAttribute('visible', 'false');
          document.querySelector('.progress-text').innerText = '';
          document.querySelector('button[play]').disabled = false;
          this.querySelector('.waveform-container').classList.add('file-loaded');
          
          // Make sure the render button is enabled
          document.getElementById('renderBtn').disabled = false;
          
          // Dispatch audio-loaded event
          document.dispatchEvent(new CustomEvent('audio-loaded', {
            detail: { audioElement: this.wavesurfer.media }
          }));
        });
      }
    } catch (error) {
      console.error('Error loading stored audio:', error);
    }
  }

  // Zoom methods
  zoomIn() {
    if (this.zoom < this.maxZoom) {
      this.zoom = Math.min(this.maxZoom, this.zoom + 0.1);
      this.updateZoom();
    }
  }

  zoomOut() {
    if (this.zoom > this.minZoom) {
      this.zoom = Math.max(this.minZoom, this.zoom - 0.1);
      this.updateZoom();
    }
  }

  zoomToFit() {
    this.zoom = 1;
    this.updateZoom();
  }

  updateZoom() {
    this.querySelector('.waveform-container').style.zoom = this.zoom;
  }
}

// Define the custom element
customElements.define('wr-wavesurfer', WaveSurferWrapper);
