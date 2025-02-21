class ColorControls extends HTMLElement {
  constructor() {
    super();
  }
  
  connectedCallback() {
    this.render();
  }
  
  render() {
    console.log('color-controls: render');
    this.innerHTML = `
      <div class="p-6">
        <div class="space-y-6">
          <details>
            <summary class="mb-2 text-sm text-gray-500">Background</summary>
            <div class="flex justify-between align-center">
              <div class="form-group">
                <label class="form-label">Color</label>
                <div class="flex items-center gap-2">
                  <input type="color" id="bgColor" value="#111111" class="color-input">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="bgImage">Image</label>
                <input type="text" id="bgImage" placeholder="paste URL" class="form-input">
              </div>
            </div>
          </details>

          <details open>
            <summary class="mb-2 text-sm text-gray-500">Waveform</summary>

            <div class="flex justify-between align-center">
              <div class="form-group w-1/2 mr-2">
                <label class="form-label">Wave Color</label>
                <div class="flex items-center gap-2">
                  <input type="color" id="waveformColor" value="#999999" class="color-input">
                </div>
              </div>
              <div class="form-group w-1/2 ml-2">
                <label class="form-label">Progress Color</label>
                <div class="flex items-center gap-2">
                  <input type="color" id="progressColor" value="#ffffff" class="color-input">
                </div>
              </div>
            </div>

            <div class="flex justify-between align-center">
              <div class="form-group w-1/2 mr-2">
                <label class="form-label">Bar Width</label>
                <div class="flex items-center gap-2">
                  <input type="number" id="barWidth" value="4" class="form-input">
                </div>
              </div>
              <div class="form-group w-1/2 ml-2">
                <label class="form-label">Bar Gap</label>
                <div class="flex items-center gap-2">
                  <input type="number" id="barGap" value="2" class="form-input">
                </div>
              </div>
            </div>

            <div class="flex justify-between align-center">
              <div class="form-group w-1/2 mr-2">
                <label class="form-label">Cursor Width</label>
                <div class="flex items-center gap-2">
                  <input type="number" id="cursorWidth" value="0" class="form-input">
                </div>
              </div>
              <div class="form-group w-1/2 ml-2">
                <label class="form-label">Bar Align</label>
                <div class="flex items-center gap-2">
                  <select id="barAlign" class="form-input">
                    <option value="top">Top</option>
                    <option value="center">Center</option>
                    <option value="bottom" selected>Bottom</option>
                  </select>
                </div>
              </div>
            </div>
          </details>

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
        </div>
      </div>
    `;

    document.getElementById('bgColor').addEventListener('change', this.updateColors);
    document.getElementById('waveformColor').addEventListener('change', this.updateColors);
    document.getElementById('progressColor').addEventListener('change', this.updateColors);
    document.getElementById('bgImage').addEventListener('change', this.updateColors);

    document.getElementById('barWidth').addEventListener('change', this.updateColors);
    document.getElementById('barGap').addEventListener('change', this.updateColors);
    document.getElementById('cursorWidth').addEventListener('change', this.updateColors);
    document.getElementById('barAlign').addEventListener('change', this.updateColors);

    document.getElementById('sizeMenu').addEventListener('change', () => {
        // determine the size of the video
      const size = document.getElementById('sizeMenu').value;
      const width = size === '1080p' ? 1920 : size === '720p' ? 1280 : size === '480p' ? 960 : 640;
      const height = size === '1080p' ? 1080 : size === '720p' ? 720 : size === '480p' ? 480 : 360;

      const wavesurfer = document.querySelector('wave-surfer').wavesurfer;

      try {
        wavesurfer.setOptions({
          width: width,
          height: height
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
    });

    setTimeout(() => {
      this.updateColors();
    }, 500);
  }

  updateColors() {
    console.log('color-controls: updateColors');
    const bgColor = document.getElementById('bgColor').value;
    const waveformColor = document.getElementById('waveformColor').value;
    const progressColor = document.getElementById('progressColor').value;
    const barWidth = document.getElementById('barWidth').value;
    const barGap = document.getElementById('barGap').value;
    const cursorWidth = document.getElementById('cursorWidth').value;
    const barAlign = document.getElementById('barAlign').value;

    document.querySelector('.waveform-container').style.backgroundColor = bgColor;

    const wavesurfer = document.querySelector('wave-surfer').wavesurfer;

    try {
      wavesurfer.setOptions({
        waveColor: waveformColor,
        progressColor: progressColor,
        barWidth: barWidth,
        barGap: barGap,
        cursorWidth: cursorWidth,
        barAlign: barAlign
      });
    } catch (error) {
      console.error('Error setting waveform options:', error);
    }
    
    const audioLoaded = document.querySelector('wave-surfer').audiofile !== null;
    const bgImageInput = document.getElementById('bgImage');
    const waveformContainer = document.querySelector('.waveform-container');
    const bgImageUrl = bgImageInput.value;
    if (bgImageUrl && audioLoaded) {
        waveformContainer.style.backgroundImage = `url(${bgImageUrl})`;
        waveformContainer.style.backgroundSize = '100% 100%';
    } else {
        waveformContainer.style.backgroundImage = 'none'; // Remove background if no URL
    }

    document.querySelector('wave-surfer').waveformCanvas = wavesurfer.renderer.canvasWrapper.querySelector('canvas');
    document.querySelector('wave-surfer').progressCanvas = wavesurfer.renderer.progressWrapper.querySelector('canvas');
  }
}

// Define the custom element if not already defined
if (!customElements.get('color-controls')) {
  customElements.define('color-controls', ColorControls);
}
