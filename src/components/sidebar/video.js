class VideoControls extends HTMLElement {
  constructor() {
    super();
  }
  
  connectedCallback() {
    this.render();
  }
  
  render() {
    this.innerHTML = `
      <details>
        <summary class="mb-2 text-sm text-gray-500">Video options</summary>
        <div class="form-group">
          <label class="form-label" for="sizeMenu">Size</label>
          <select id="sizeMenu" class="form-input">
            <option value="1080p">1080p</option>
            <option value="720p">720p</option>
            <option value="480p">480p</option>
            <option value="360p" selected>360p</option>
          </select>
        </div>
      </details>

      <div class="h-20"></div>

      <div class="fixed bottom-0 right-0 p-4 w-[300px] flex justify-center items-center bg-gray-800 border-t-2 border-gray-700">
        <button id="renderBtn" disabled class="btn-primary">
          Render Video
        </button>
      </div>
    `;

    document.getElementById('sizeMenu').addEventListener('change', () => {
      // determine the size of the video
      const size = document.getElementById('sizeMenu').value;
      const width = size === '1080p' ? 1920 : size === '720p' ? 1280 : size === '480p' ? 960 : 640;
      const height = size === '1080p' ? 1080 : size === '720p' ? 720 : size === '480p' ? 480 : 360;

      const wavesurfer = document.querySelector('wave-surfer').wavesurfer;

      try {
        wavesurfer.setOptions({
          width: width,
          height: height / 2
        });
      } catch (error) {
        console.error('Error setting waveform options:', error);
      }

      // set the size of the waveform container
      document.querySelector('wave-surfer').width = width;
      document.querySelector('wave-surfer').height = height;
      document.querySelector('.waveform-container').style.width = width + 'px';
      document.querySelector('.waveform-container').style.height = height + 'px';
      document.querySelector('#textOverlay').setAttribute('width', width + 'px');
      document.querySelector('#textOverlay').setAttribute('height', height + 'px');

      document.querySelector('text-controls').renderText();

      // After updating the container size, explicitly update the waveform
      setTimeout(() => {
        // Call our new function to update the waveform for the new size
        if (typeof window.updateWaveformForOutputSize === 'function') {
          window.updateWaveformForOutputSize();
        } else {
          // Fallback direct implementation
          const wsElement = document.querySelector('wave-surfer');
          const wavesurfer = wsElement.wavesurfer;
          const videoWidth = wsElement.width;
          const videoHeight = wsElement.height;
          const heightValue = document.getElementById('waveHeight').value;
          
          try {
            wavesurfer.setOptions({
              width: videoWidth,
              height: videoHeight / parseFloat(heightValue || 2.0)
            });
            
            // Update canvas references
            wsElement.waveformCanvas = wavesurfer.renderer.canvasWrapper.querySelector('canvas');
            wsElement.progressCanvas = wavesurfer.renderer.progressWrapper.querySelector('canvas');
            
            // Re-render text
            document.querySelector('text-controls').renderText();
          } catch (error) {
            console.error('Error updating wavesurfer for size change:', error);
          }
        }
      }, 200);
    });

    setTimeout(() => {
      this.updateVideo();
    }, 500);
  }

  updateVideo() {
    const size = document.getElementById('sizeMenu').value;
    const width = size === '1080p' ? 1920 : size === '720p' ? 1280 : size === '480p' ? 960 : 640;
    const height = size === '1080p' ? 1080 : size === '720p' ? 720 : size === '480p' ? 480 : 360;

    const wavesurfer = document.querySelector('wave-surfer').wavesurfer;

    try {
      wavesurfer.setOptions({
        width: width,
        height: height / 2
      });
    } catch (error) {
      console.error('Error setting waveform options:', error);
    }
  }
}

// Define the custom element if not already defined
if (!customElements.get('video-controls')) {
  customElements.define('video-controls', VideoControls);
}
