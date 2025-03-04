class BackgroundControls extends HTMLElement {
  constructor() {
    super();
    this.backgroundImage = null;
  }
  
  connectedCallback() {
    this.render();
  }
  
  render() {
    this.innerHTML = `
      <div class="form-group">
        <label class="form-label">Background Color</label>
        <div class="flex items-center gap-2">
          <input type="color" id="bgColor" value="${timeline[0].backgroundColor}" class="color-input">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Pick Background Image</label>
        <div class="flex items-center gap-2">
          <input type="file" id="bgImageFile" accept="image/*" class="form-input">
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">Image Input</label>
        <div class="flex items-center gap-2">
          <input type="text" id="bgImage" placeholder="Image URL" class="form-input" value="${this.backgroundImage || ''}">
        </div>
      </div>
      
      <!-- Image thumbnail preview -->
      <div class="form-group ${this.backgroundImage ? '' : 'hidden'}" id="imageThumbnailContainer">
        <div class="flex justify-between items-center mb-2">
          <label class="form-label">Background Image</label>
          <button id="removeImageBtn" class="text-xs text-red-500 hover:text-red-400">Remove</button>
        </div>
        <div class="bg-gray-800 rounded-lg p-1 border border-gray-700 overflow-hidden h-24 flex items-center justify-center">
          <img id="imageThumbnail" src="${this.backgroundImage || ''}" class="max-h-full max-w-full object-contain" />
        </div>
      </div>
      
      <!-- Image scaling options -->
      <div class="form-group ${this.backgroundImage ? '' : 'hidden'}" id="imageScaleContainer">
        <label class="form-label">Image Scale</label>
        <select id="bgImageScale" class="form-input">
          <option value="cover" ${timeline[0].backgroundScale === 'cover' ? 'selected' : ''}>Cover (fill)</option>
          <option value="contain" ${timeline[0].backgroundScale === 'contain' ? 'selected' : ''}>Contain (fit)</option>
          <option value="100%" ${timeline[0].backgroundScale === '100%' ? 'selected' : ''}>Original size</option>
          <option value="custom" ${timeline[0].backgroundScale === 'custom' ? 'selected' : ''}>Custom scale</option>
        </select>
      </div>
      
      <!-- Custom scale slider (only visible when custom scale is selected) -->
      <div class="form-group ${(this.backgroundImage && timeline[0].backgroundScale === 'custom') ? '' : 'hidden'}" id="customScaleContainer">
        <label class="form-label">Custom Scale: <span id="scaleValue">${timeline[0].backgroundCustomScale || 50}%</span></label>
        <input type="range" id="customScaleSlider" min="1" max="100" value="${timeline[0].backgroundCustomScale || 50}" class="w-full">
      </div>
      
      <!-- Image position options -->
      <div class="form-group ${this.backgroundImage ? '' : 'hidden'}" id="imagePositionContainer">
        <label class="form-label">Image Position</label>
        <select id="bgImagePosition" class="form-input">
          <option value="center" ${timeline[0].backgroundPosition === 'center' ? 'selected' : ''}>Center</option>
          <option value="top" ${timeline[0].backgroundPosition === 'top' ? 'selected' : ''}>Top</option>
          <option value="bottom" ${timeline[0].backgroundPosition === 'bottom' ? 'selected' : ''}>Bottom</option>
          <option value="left" ${timeline[0].backgroundPosition === 'left' ? 'selected' : ''}>Left</option>
          <option value="right" ${timeline[0].backgroundPosition === 'right' ? 'selected' : ''}>Right</option>
        </select>
      </div>
      
      <div class="form-group">
        <div class="flex justify-between align-center">
          <label class="toggle-label">Shadow Overlay</label>
          <input type="checkbox" id="shadowEnabled" class="toggle-switch" ${timeline[0].shadowEnabled ? 'checked' : ''}>
        </div>
      </div>
    `;
    
    // Add event listeners
    document.getElementById('bgColor').addEventListener('input', this.updateBackground.bind(this));
    document.getElementById('bgImage').addEventListener('input', this.updateBackground.bind(this));
    document.getElementById('shadowEnabled').addEventListener('change', (e) => {
      timeline[0].shadowEnabled = e.target.checked;
      const shadowOverlay = document.querySelector('.background-shadow-overlay');
      if (e.target.checked) {
        shadowOverlay.style.display = 'block';
      } else {
        shadowOverlay.style.display = 'none';
      }
    });

    document.getElementById('bgImageFile').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.updateBackground(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    });

    // Add listeners for new controls
    document.getElementById('removeImageBtn')?.addEventListener('click', this.removeBackgroundImage.bind(this));
    document.getElementById('bgImageScale')?.addEventListener('change', this.updateImageScaling.bind(this));
    document.getElementById('bgImagePosition')?.addEventListener('change', this.updateImagePosition.bind(this));
    
    // Add listener for custom scale slider
    document.getElementById('customScaleSlider')?.addEventListener('input', this.updateCustomScale.bind(this));
  }
  
  removeBackgroundImage() {
    this.backgroundImage = null;
    timeline[0].backgroundImage = null;
    document.getElementById('bgImage').value = '';
    document.querySelector('.waveform-container').style.backgroundImage = 'none';
    
    // Hide image-related controls
    document.getElementById('imageThumbnailContainer').classList.add('hidden');
    document.getElementById('imageScaleContainer').classList.add('hidden');
    document.getElementById('imagePositionContainer').classList.add('hidden');
  }
  
  updateImageScaling() {
    const scaleMode = document.getElementById('bgImageScale').value;
    timeline[0].backgroundScale = scaleMode;
    
    // Show/hide custom scale slider based on selection
    const customScaleContainer = document.getElementById('customScaleContainer');
    if (scaleMode === 'custom') {
      customScaleContainer.classList.remove('hidden');
      // Initialize custom scale if not set
      if (!timeline[0].backgroundCustomScale) {
        timeline[0].backgroundCustomScale = 50;
        document.getElementById('customScaleSlider').value = 50;
        document.getElementById('scaleValue').textContent = '50%';
      }
    } else {
      customScaleContainer.classList.add('hidden');
    }
    
    this.applyBackgroundStyles();
  }
  
  updateCustomScale(event) {
    const scaleValue = event.target.value;
    timeline[0].backgroundCustomScale = parseInt(scaleValue);
    document.getElementById('scaleValue').textContent = `${scaleValue}%`;
    this.applyBackgroundStyles();
  }
  
  updateImagePosition() {
    const positionMode = document.getElementById('bgImagePosition').value;
    timeline[0].backgroundPosition = positionMode;
    this.applyBackgroundStyles();
  }
  
  applyBackgroundStyles() {
    if (!this.backgroundImage) return;
    
    const waveformContainer = document.querySelector('.waveform-container');
    const scaleMode = timeline[0].backgroundScale;
    const positionMode = timeline[0].backgroundPosition;
    
    // Set background image
    waveformContainer.style.backgroundImage = `url(${this.backgroundImage})`;
    waveformContainer.style.backgroundRepeat = 'no-repeat';
    
    // Apply scaling based on mode
    if (scaleMode === 'custom') {
      const scale = timeline[0].backgroundCustomScale || 50;
      waveformContainer.style.backgroundSize = `${scale}%`;
    } else {
      waveformContainer.style.backgroundSize = scaleMode;
    }
    
    // Apply positioning
    waveformContainer.style.backgroundPosition = positionMode;
  }
  
  updateBackground(imageUrl) {
    const bgColor = document.getElementById('bgColor').value;
    document.querySelector('.waveform-container').style.backgroundColor = bgColor;
    timeline[0].backgroundColor = bgColor;
    
    // Don't require audio to be loaded to use a background image
    const bgImageInput = document.getElementById('bgImage');
    const bgImageUrl = imageUrl || bgImageInput.value;
    
    if (bgImageUrl) {
      // Update the stored image URL
      this.backgroundImage = bgImageUrl;
      timeline[0].backgroundImage = bgImageUrl;
      
      // Update the image thumbnail
      const imageThumbnail = document.getElementById('imageThumbnail');
      imageThumbnail.src = bgImageUrl;
      document.getElementById('imageThumbnailContainer').classList.remove('hidden');
      
      // Show the image controls
      document.getElementById('imageScaleContainer').classList.remove('hidden');
      document.getElementById('imagePositionContainer').classList.remove('hidden');
      
      // Initialize timeline properties if not set
      if (!timeline[0].backgroundScale) timeline[0].backgroundScale = 'cover';
      if (!timeline[0].backgroundPosition) timeline[0].backgroundPosition = 'center';
      if (!timeline[0].backgroundCustomScale) timeline[0].backgroundCustomScale = 50;
      
      // Update custom scale container visibility
      const customScaleContainer = document.getElementById('customScaleContainer');
      if (timeline[0].backgroundScale === 'custom') {
        customScaleContainer.classList.remove('hidden');
        document.getElementById('customScaleSlider').value = timeline[0].backgroundCustomScale;
        document.getElementById('scaleValue').textContent = `${timeline[0].backgroundCustomScale}%`;
      } else {
        customScaleContainer.classList.add('hidden');
      }
      
      // Apply all background styles
      this.applyBackgroundStyles();
    } else if (!bgImageUrl) {
      // No image URL provided, remove the background image
      this.removeBackgroundImage();
    }
  }
}

// Define the custom element if not already defined
if (!customElements.get('background-controls')) {
  customElements.define('background-controls', BackgroundControls);
}
