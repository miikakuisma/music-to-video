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
      <div class="color-controls">
        <label>Background Color:
          <input type="color" id="bgColor" value="#333333">
        </label>
        <label>Waveform Color:
          <input type="color" id="waveformColor" value="#b47dfd">
        </label>
        <label>Progress Color:
          <input type="color" id="progressColor" value="#ffffff">
        </label>
        <div>
          <label for="bgImage">Background Image URL:</label>
          <input type="text" id="bgImage" placeholder="Enter background image URL" value="https://images.unsplash.com/photo-1614852206732-6728910dc175?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjR8fGdyYWRpZW50JTIwZGFya3xlbnwwfHwwfHx8MA%3D%3D">
        </div>
        <div>
          <label for="sizeMenu">Size:</label>
          <select id="sizeMenu">
            <option value="1080p">1080p</option>
            <option value="720p" selected>720p</option>
            <option value="480p">480p</option>
          </select>
        </div>
        <button id="renderBtn" disabled>Render Video</button>
      </div>
    `;

    document.getElementById('bgColor').addEventListener('input', this.updateColors);
    document.getElementById('waveformColor').addEventListener('input', this.updateColors);
    document.getElementById('progressColor').addEventListener('input', this.updateColors);
    document.getElementById('bgImage').addEventListener('change', this.updateColors);

    setTimeout(() => {
      this.updateColors();
    }, 500);
  }

  updateColors() {
    console.log('color-controls: updateColors');
    const bgColor = document.getElementById('bgColor').value;
    const waveformColor = document.getElementById('waveformColor').value;
    const progressColor = document.getElementById('progressColor').value;

    document.querySelector('.waveform-container').style.backgroundColor = bgColor;
    try {
      document.querySelector('wave-surfer').wavesurfer.setOptions({
        waveColor: waveformColor,
        progressColor: progressColor
      });
    } catch (error) {
      console.error('Error setting waveform options:', error);
    }
    
    const bgImageInput = document.getElementById('bgImage');
    const waveformContainer = document.querySelector('.waveform-container');
    const bgImageUrl = bgImageInput.value;
    if (bgImageUrl) {
        waveformContainer.style.backgroundImage = `url(${bgImageUrl})`;
        waveformContainer.style.backgroundSize = 'cover'; // Adjust as needed
    } else {
        waveformContainer.style.backgroundImage = 'none'; // Remove background if no URL
    }
  }
}

// Define the custom element if not already defined
if (!customElements.get('color-controls')) {
  customElements.define('color-controls', ColorControls);
}
