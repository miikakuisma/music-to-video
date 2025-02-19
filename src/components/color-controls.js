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
        <label>Background:
          <input type="color" id="bgColor" value="#666666">
        </label>
        <label>Waveform:
          <input type="color" id="waveformColor" value="#b47dfd">
        </label>
        <label>Progress:
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
            <option value="720p">720p</option>
            <option value="480p">480p</option>
            <option value="360p" selected>360p</option>
          </select>
        </div>
        <button id="renderBtn" disabled>Render Video</button>
      </div>
    `;

    document.getElementById('bgColor').addEventListener('input', this.updateColors);
    document.getElementById('waveformColor').addEventListener('input', this.updateColors);
    document.getElementById('progressColor').addEventListener('input', this.updateColors);
    document.getElementById('bgImage').addEventListener('change', this.updateColors);
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

    document.querySelector('.waveform-container').style.backgroundColor = bgColor;

    try {
      document.querySelector('wave-surfer').wavesurfer.setOptions({
        waveColor: waveformColor,
        progressColor: progressColor
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
