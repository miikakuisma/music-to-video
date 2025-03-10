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
    // Initialize IndexedDB connection
    this.dbPromise = this.openDB();
  }
  
  connectedCallback() {
    this.render();
    document.addEventListener('DOMContentLoaded', () => {
      this.initWaveSurfer();
      // When the app is loaded, check for a stored audio file in IndexedDB.
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
    };

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
      document.querySelector('wr-preview-controls').createEventListeners();
      // Initialize property for tracking visibility
      this.waveformVisible = true;
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
          
          // Store the audio file into IndexedDB
          this.storeAudioFile(file).catch(err => console.error("Error storing audio file:", err));
          
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  zoomIn() {
    this.zoom = Math.min(this.maxZoom, this.zoom + 0.25);
    this.applyZoom();
    return this.zoom;
  }
  
  zoomOut() {
    this.zoom = Math.max(this.minZoom, this.zoom - 0.25);
    this.applyZoom();
    return this.zoom;
  }
  
  resetZoom() {
    this.zoom = 1;
    this.applyZoom();
    return this.zoom;
  }

  zoomToFit() {
    const previewElement = document.querySelector('.preview');
    if (previewElement) {
      const previewWidth = previewElement.clientWidth;
      const previewHeight = previewElement.clientHeight;
      let effectiveWidth = this.width;
      let effectiveHeight = this.height;
      
      // Support vertical (portrait) videos:
      // If the video is vertical but the preview area is horizontal,
      // swap the dimensions so that the rotated video fits better.
      if (this.height > this.width && previewWidth > previewHeight) {
        effectiveWidth = this.height;
        effectiveHeight = this.width;
      }
      
      if (effectiveWidth > previewWidth || effectiveHeight > previewHeight) {
        const zoomFactor = Math.min(previewWidth / effectiveWidth, previewHeight / effectiveHeight);
        this.zoom = zoomFactor;
      } else {
        this.zoom = 1;
      }
      this.applyZoom();
    }
  }
  
  applyZoom() {
    const container = this.querySelector('.waveform-container');
    container.style.zoom = this.zoom;
    
    // Dispatch an event so other components can react to zoom changes
    this.dispatchEvent(new CustomEvent('zoom-changed', { 
      detail: { zoom: this.zoom }, 
      bubbles: true 
    }));
  }
  
  // IndexedDB: Open database connection
  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('WaveSurferDB', 1);
      request.onerror = function(event) {
        console.error('IndexedDB error:', event);
        reject(event);
      };
      request.onsuccess = function(event) {
        resolve(event.target.result);
      };
      request.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('audioFiles')) {
          db.createObjectStore('audioFiles', { keyPath: 'id' });
        }
      };
    });
  }
  
  // IndexedDB: Store audio file
  storeAudioFile(file) {
    return this.dbPromise.then(db => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('audioFiles', 'readwrite');
        const store = tx.objectStore('audioFiles');
        const data = { id: 'latest', file: file, timestamp: Date.now() };
        const request = store.put(data);
        request.onsuccess = function() {
          resolve();
        };
        request.onerror = function(event) {
          reject(event.target.error);
        };
      });
    });
  }
  
  // IndexedDB: Load stored audio file if available
  async loadStoredAudio() {
    try {
      const db = await this.dbPromise;
      const tx = db.transaction('audioFiles', 'readonly');
      const store = tx.objectStore('audioFiles');
      const request = store.get('latest');
      request.onsuccess = (event) => {
        const result = event.target.result;
        if (result && result.file) {
          this.audiofile = result.file;
          const url = URL.createObjectURL(result.file);
          this.wavesurfer.load(url);
          this.wavesurfer.once('ready', () => {
            document.querySelector('background-controls').updateBackground();
            document.querySelector('waveform-controls').updateWaveform();
            document.querySelector('text-controls').renderText();
            document.querySelector('video-controls').updateVideo();
            document.querySelector('wr-spinner').setAttribute('visible', 'false');
            document.querySelector('.progress-text').innerText = '';
            document.querySelector('button[play]').disabled = false;
            this.querySelector('.waveform-container').classList.add('file-loaded');
          });
        }
      };
      request.onerror = (event) => {
        console.error('Failed to load stored audio file:', event.target.error);
      };
    } catch (error) {
      console.error('Error loading stored audio:', error);
    }
  }
}

// Define the custom element if not already defined
if (!customElements.get('wr-wavesurfer')) {
  customElements.define('wr-wavesurfer', WaveSurferWrapper);
}
