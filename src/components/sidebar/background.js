class BackgroundControls extends HTMLElement {
  constructor() {
    super();
    this.shadowOverLay = true;
    this.backgroundImage = null;
  }
  
  connectedCallback() {
    this.render();
  }
  
  render() {
    this.innerHTML = `
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

        <div class="flex justify-between align-center">
          <div class="form-group w-full mr-2 flex justify-between items-center">
            <label class="toggle-label">Shadow</label>
            <input type="checkbox" id="shadowEnabled" class="toggle-switch" ${this.shadowOverLay === true ? 'checked' : ''}>
          </div>
        </div>
      </details>
    `;

    document.getElementById('bgColor').addEventListener('input', this.updateBackground);
    document.getElementById('bgImage').addEventListener('change', this.updateBackground);
    document.getElementById('shadowEnabled').addEventListener('change', (e) => {
      this.shadowOverLay = e.target.checked;
      if (this.shadowOverLay === true) {
        document.querySelector('.background-shadow-overlay').style.display = 'block';
      } else {
        document.querySelector('.background-shadow-overlay').style.display = 'none';
      }  
    });

    setTimeout(() => {
      this.updateBackground();
    }, 500);
  }

  updateBackground(imageUrl) {
    const bgColor = document.getElementById('bgColor').value;
    document.querySelector('.waveform-container').style.backgroundColor = bgColor;
    const audioLoaded = document.querySelector('wave-surfer').audiofile !== null;
    const bgImageInput = document.getElementById('bgImage');
    const waveformContainer = document.querySelector('.waveform-container');
    const bgImageUrl = imageUrl || bgImageInput.value;
    if (bgImageUrl && audioLoaded) {
        waveformContainer.style.backgroundImage = `url(${bgImageUrl})`;
        waveformContainer.style.backgroundSize = 'cover';
        waveformContainer.style.backgroundPosition = 'center';
    } else {
        waveformContainer.style.backgroundImage = 'none'; // Remove background if no URL
    }
  }
}

// Define the custom element if not already defined
if (!customElements.get('background-controls')) {
  customElements.define('background-controls', BackgroundControls);
}
