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

    // Set up play/pause button
    this.querySelector('button[play]').addEventListener('click', () => {
      wavesurfer.playPause();
      if (wavesurfer.isPlaying()) {
        // pause icon
        this.querySelector('button[play]').innerHTML = '<svg width="24px" height="24px" viewBox="0 0 512 512" fill="white" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><rect height="320" width="79" x="128" y="96"/><rect height="320" width="79" x="305" y="96"/></g></svg>';
      } else {
        // play icon
        this.querySelector('button[play]').innerHTML = '<svg width="24px" height="24px" viewBox="0 0 512 512" fill="white" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M128,96v320l256-160L128,96L128,96z"/></svg>';
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
    
    // Handler for progress bar clicks
    progressBar.addEventListener('click', (e) => {
      // If waveform is hidden, use the progress bar itself for calculations
      let rect;
      if (!wavesurferComponent.waveformVisible && progressBar) {
        rect = progressBar.getBoundingClientRect();
      } else {
        rect = wavesurfer.renderer.canvasWrapper.getBoundingClientRect();
      }
      
      let relativeX = e.clientX - rect.left;
      relativeX = Math.max(0, Math.min(relativeX, rect.width));
      const newPosition = relativeX / rect.width;
      
      // Update UI elements
      progressBarFill.style.width = `${newPosition * 100}%`;
      progressHandle.style.left = `${newPosition * 100}%`;
      
      // Update time
      if (wavesurfer && wavesurfer.getDuration()) {
        const newTime = newPosition * wavesurfer.getDuration();
        wavesurfer.setTime(newTime);
      }
    });
    
    // Handler for drag operations on progress handle
    progressHandle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      
      const handleMouseMove = (e) => {
        // Use progress bar for position calculation when waveform is hidden
        let rect;
        if (!wavesurferComponent.waveformVisible && progressBar) {
          rect = progressBar.getBoundingClientRect();
        } else {
          rect = wavesurfer.renderer.canvasWrapper.getBoundingClientRect();
        }
        
        let relativeX = e.clientX - rect.left;
        relativeX = Math.max(0, Math.min(relativeX, rect.width));
        const newPosition = relativeX / rect.width;
        
        // Update UI
        progressBarFill.style.width = `${newPosition * 100}%`;
        progressHandle.style.left = `${newPosition * 100}%`;
        
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
    
    // Add timeupdate event listener to keep UI elements in sync
    wavesurfer.on('timeupdate', (seconds) => {
      const progress = (seconds / wavesurfer.getDuration()) * 100;
      progressBarFill.style.width = `${progress}%`;
      progressHandle.style.left = `${progress}%`;
      
      // Update time display
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      this.querySelector('.time-display').textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    });
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
    `;
  }
}

// Define the custom element if not already defined
if (!customElements.get('wr-preview-controls')) {
  customElements.define('wr-preview-controls', PreviewControls);
}
