class PreviewControls extends HTMLElement {
  constructor() {
    super();
  }
  
  connectedCallback() {
    this.render();
  }
  
  createEventListeners() {
    const wavesurferComponent = document.querySelector('wr-wavesurfer');
    const wavesurfer = wavesurferComponent.wavesurfer;

    // Clear any existing listeners on the play button to prevent duplicates
    const playButton = this.querySelector('button[play]');
    const newPlayButton = playButton.cloneNode(true);
    playButton.parentNode.replaceChild(newPlayButton, playButton);

    // Set up play/pause button with fresh listeners
    newPlayButton.addEventListener('click', () => {
      wavesurfer.playPause();
      if (wavesurfer.isPlaying()) {
        // pause icon
        newPlayButton.innerHTML = '<svg width="24px" height="24px" viewBox="0 0 512 512" fill="white" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><rect height="320" width="79" x="128" y="96"/><rect height="320" width="79" x="305" y="96"/></g></svg>';
      } else {
        // play icon
        newPlayButton.innerHTML = '<svg width="24px" height="24px" viewBox="0 0 512 512" fill="white" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M128,96v320l256-160L128,96L128,96z"/></svg>';
      }
    });

    // Add event listener for progress handle dragging
    this.querySelector('.progress-handle').addEventListener('mousedown', (e) => {
      e.preventDefault();
      
      const handleMouseMove = (e) => {
        const canvasRect = wavesurfer.renderer.canvasWrapper.getBoundingClientRect();
        let relativeX = e.clientX - canvasRect.left;
        relativeX = Math.max(0, Math.min(relativeX, canvasRect.width));
        const newTime = (relativeX / canvasRect.width) * wavesurfer.getDuration();
        wavesurfer.setTime(newTime);
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    });

    // Get elements and store references
    const progressBar = this.querySelector('.progress-bar');
    const progressHandle = this.querySelector('.progress-handle');
    const progressBarFill = this.querySelector('.progress-bar-fill');
    
    // Clear existing listeners from progress elements
    const newProgressBar = progressBar.cloneNode(true);
    progressBar.parentNode.replaceChild(newProgressBar, progressBar);

    const newProgressHandle = progressHandle.cloneNode(true);
    progressHandle.parentNode.replaceChild(newProgressHandle, progressHandle);
    
    // Re-attach event listeners for progress bar clicks
    newProgressBar.addEventListener('click', (e) => {
      // If waveform is hidden, use the progress bar itself for calculations
      let rect;
      if (!wavesurferComponent.waveformVisible && newProgressBar) {
        rect = newProgressBar.getBoundingClientRect();
      } else {
        rect = wavesurfer.renderer.canvasWrapper.getBoundingClientRect();
      }
      
      let relativeX = e.clientX - rect.left;
      relativeX = Math.max(0, Math.min(relativeX, rect.width));
      const newPosition = relativeX / rect.width;
      
      // Update UI elements
      progressBarFill.style.width = `${newPosition * 100}%`;
      newProgressHandle.style.left = `${newPosition * 100}%`;
      
      // Update time
      if (wavesurfer && wavesurfer.getDuration()) {
        const newTime = newPosition * wavesurfer.getDuration();
        wavesurfer.setTime(newTime);
      }
    });
    
    // Handler for drag operations on progress handle
    newProgressHandle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      
      const handleMouseMove = (e) => {
        // Use progress bar for position calculation when waveform is hidden
        let rect;
        if (!wavesurferComponent.waveformVisible && newProgressBar) {
          rect = newProgressBar.getBoundingClientRect();
        } else {
          rect = wavesurfer.renderer.canvasWrapper.getBoundingClientRect();
        }
        
        let relativeX = e.clientX - rect.left;
        relativeX = Math.max(0, Math.min(relativeX, rect.width));
        const newPosition = relativeX / rect.width;
        
        // Update UI
        progressBarFill.style.width = `${newPosition * 100}%`;
        newProgressHandle.style.left = `${newPosition * 100}%`;
        
        // Update audio if available
        if (wavesurfer && wavesurfer.getDuration()) {
          const newTime = newPosition * wavesurfer.getDuration();
          wavesurfer.setTime(newTime);
        }
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    });
    
    // Clear existing timeupdate listeners
    if (this._timeUpdateHandler) {
      wavesurfer.un('timeupdate', this._timeUpdateHandler);
    }
    
    // Add timeupdate event listener to keep UI elements in sync
    this._timeUpdateHandler = (seconds) => {
      const progress = (seconds / wavesurfer.getDuration()) * 100;
      progressBarFill.style.width = `${progress}%`;
      newProgressHandle.style.left = `${progress}%`;
      
      // Update time display
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      this.querySelector('.time-display').textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    
    wavesurfer.on('timeupdate', this._timeUpdateHandler);
    
    // Enable play button explicitly
    newPlayButton.disabled = false;
    
    console.log('Preview controls event listeners attached successfully');
  }

  render() {
    this.innerHTML = `
      <div class="progress-bar absolute bottom-0 left-0 w-full h-1 bg-gray-700 rounded-full cursor-pointer"></div>
      <div class="progress-bar-fill pointer-events-none absolute bottom-0 left-0 w-0 h-1 bg-gray-500 rounded-full"></div>
      <div class="progress-handle absolute bottom-0 z-50 left-0 w-[16px] h-[16px] translate-x-[-6px] translate-y-[6px] bg-gray-500 rounded-full cursor-pointer hover:bg-gray-400"></div>

      <div class="absolute bottom-0 left-0 right-0 flex justify-between items-center translate-y-8">
          <div class="time-display text-sm text-gray-500">0:00</div>
          <button play disabled class="text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <svg width="24px" height="24px" viewBox="0 0 512 512" fill="white" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M128,96v320l256-160L128,96L128,96z"/></svg>
          </button>
      </div>

      <div class="progress-text fixed bottom-8 left-0 right-[300px] text-center text-sm text-gray-500">Ready</div>

      <div class="zoom-controls absolute top-3 right-3 z-30">
        <button id="zoomOut" class="p-1 bg-gray-800 text-gray-300 rounded-l hover:bg-gray-700">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <button id="resetZoom" class="p-1 bg-gray-800 text-gray-300 hover:bg-gray-700">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="7"></circle>
            <line x1="12" y1="9" x2="12" y2="15"></line>
          </svg>
        </button>
        <button id="zoomIn" class="p-1 bg-gray-800 text-gray-300 rounded-r hover:bg-gray-700">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    `;
    
    // Add event listeners for zoom buttons
    this.querySelector('#zoomIn').addEventListener('click', () => {
      document.querySelector('wr-wavesurfer').zoomIn();
    });
    
    this.querySelector('#zoomOut').addEventListener('click', () => {
      document.querySelector('wr-wavesurfer').zoomOut();
    });
    
    this.querySelector('#resetZoom').addEventListener('click', () => {
      document.querySelector('wr-wavesurfer').resetZoom();
    });
  }
}

// Define the custom element if not already defined
if (!customElements.get('wr-preview-controls')) {
  customElements.define('wr-preview-controls', PreviewControls);
}
