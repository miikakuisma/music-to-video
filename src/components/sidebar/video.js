class VideoControls extends HTMLElement {
  constructor() {
    super();
    this.sizes = {
      '1080p': { width: 1920, height: 1080 },
      '720p': { width: 1280, height: 720 },
      '480p': { width: 960, height: 480 },
      '360p': { width: 640, height: 360 }
    };
    this.currentSize = '360p';
    this.currentOrientation = 'landscape';
  }
  
  connectedCallback() {
    this.render();
    this.attachEventListeners();
    
    // Initial setup
    setTimeout(() => {
      this.updateDimensions();
    }, 500);
  }
  
  render() {
    this.innerHTML = `
      <div class="form-group">
        <label class="form-label" for="sizeMenu">Video Size</label>
        <select id="sizeMenu" class="form-input">
          <option value="1080p">1080p</option>
          <option value="720p">720p</option>
          <option value="480p">480p</option>
          <option value="360p" selected>360p</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="orientationMenu">Orientation</label>
        <select id="orientationMenu" class="form-input">
          <option value="landscape" selected>Landscape</option>
          <option value="portrait">Portrait</option>
        </select>
      </div>
    `;
  }
  
  attachEventListeners() {
    // Add event listeners for size and orientation changes
    document.getElementById('sizeMenu').addEventListener('change', (e) => {
      this.currentSize = e.target.value;
      this.updateDimensions();
    });

    document.getElementById('orientationMenu').addEventListener('change', (e) => {
      this.currentOrientation = e.target.value;
      this.updateDimensions();
    });
  }
  
  /**
   * Calculate current dimensions based on size and orientation
   * @returns {Object} width and height values
   */
  calculateDimensions() {
    const baseSize = this.sizes[this.currentSize];
    if (!baseSize) return { width: 640, height: 360 }; // Default fallback
    
    if (this.currentOrientation === 'landscape') {
      return { width: baseSize.width, height: baseSize.height };
    } else {
      return { width: baseSize.height, height: baseSize.width };
    }
  }
  
  /**
   * Update all UI elements with the new dimensions
   */
  updateDimensions() {
    const { width, height } = this.calculateDimensions();
    const wsElement = document.querySelector('wr-wavesurfer');
    const wavesurfer = wsElement.wavesurfer;
    
    // Update wavesurfer dimensions
    try {
      wavesurfer.setOptions({
        width: width,
        height: height
      });
    } catch (error) {
      console.error('Error setting waveform dimensions:', error);
    }
        
    // Update container dimensions
    wsElement.width = width;
    wsElement.height = height;
    wsElement.zoomToFit();
    document.querySelector('.waveform-container').style.width = `${width}px`;
    document.querySelector('.waveform-container').style.height = `${height}px`;
    
    // Update text overlay
    const textOverlay = document.querySelector('#textOverlay');
    textOverlay.setAttribute('width', `${width}px`);
    textOverlay.setAttribute('height', `${height}px`);
    
    // Update text and refresh waveform
    this.updateWaveformAndText();

  }
  
  /**
   * Update text and waveform elements after dimension changes
   */
  updateWaveformAndText() {
    // Update waveform with new dimensions
    this.updateWaveform();
    // Render text with new dimensions
    document.querySelector('text-controls').renderText();
  }
  
  /**
   * Update wavesurfer for new dimensions
   */
  updateWaveform() {
    const wsElement = document.querySelector('wr-wavesurfer');
    const wavesurfer = wsElement.wavesurfer;
    
    if (!wavesurfer) return;
    
    try {
      // Get current height settings
      const { width, height } = this.calculateDimensions();
      
      wavesurfer.setOptions({
        width: width,
        height: height
      });
      
      // Adjust waveform container proportions if needed
      const container = document.querySelector('.waveform-container');
      if (container) {
        // Ensure the waveform container takes the full height
        container.style.width = `${width}px`;
        container.style.height = `${height}px`;
      }
      
      // Update canvas references
      wsElement.waveformCanvas = wavesurfer.renderer.canvasWrapper.querySelector('canvas');
      wsElement.progressCanvas = wavesurfer.renderer.progressWrapper.querySelector('canvas');
      
      // Make sure position alignment is respected
      const barAlign = document.getElementById('barAlign');
      if (barAlign) {
        wavesurfer.setOptions({
          barAlign: barAlign.value
        });
      }
    } catch (error) {
      console.error('Error updating waveform after dimension change:', error);
    }
  }
  
  /**
   * Public method to update video settings
   */
  updateVideo() {
    this.updateDimensions();
  }
}

// Define the custom element if not already defined
if (!customElements.get('video-controls')) {
  customElements.define('video-controls', VideoControls);
}
