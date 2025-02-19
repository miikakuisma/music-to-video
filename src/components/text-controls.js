let textCanvas;
let textCtx;

class TextControls extends HTMLElement {
  constructor() {
    super();
  }
  
  connectedCallback() {
    console.log('text-controls: connectedCallback');
    this.render();
    setTimeout(() => {
      this.initTextCanvas();
      this.renderText();
    }, 0);
  }
  
  render() {
    console.log('text-controls: render');
    this.innerHTML = `
      <div class="text-controls">
        <input type="text" id="songTitleInput" placeholder="Song Title">
        <input type="text" id="artistNameInput" placeholder="Artist Name">
        <select id="fontSelect">
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
        </select>
        <input type="color" id="textColor" value="#ffffff">
        <input type="number" id="fontSize" value="60" min="12" max="256">
      </div>
    `;

    document.getElementById('songTitleInput').addEventListener('input', this.renderText);
    document.getElementById('artistNameInput').addEventListener('input', this.renderText);
    document.getElementById('fontSelect').addEventListener('change', this.renderText);
    document.getElementById('textColor').addEventListener('input', this.renderText);
    document.getElementById('fontSize').addEventListener('input', this.renderText);
  }

  initTextCanvas() {
    console.log('text-controls: initTextCanvas');
    textCanvas = document.getElementById('textOverlay');
    textCtx = textCanvas.getContext('2d');
    
    // Set canvas size to match waveform
    textCanvas.width = 1280;
    textCanvas.height = 720;
    
    // Initial render
    this.renderText();
  }

  renderText() {
    console.log('text-controls: renderText');
    // Retrieve the canvas element by its ID (as defined in your WaveSurferCanvas markup)
    const textCanvas = document.getElementById('textOverlay');
    if (!textCanvas) {
      console.error('Text overlay canvas not found.');
      return;
    }
    
    // Get the canvas 2D context
    const textCtx = textCanvas.getContext('2d');
    
    // Clear the canvas
    textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
    
    // Get text properties from input fields
    const songTitle = document.getElementById('songTitleInput').value;
    const artistName = document.getElementById('artistNameInput').value;
    const font = document.getElementById('fontSelect').value;
    const color = document.getElementById('textColor').value;
    const size = document.getElementById('fontSize').value;
    
    // Set styling
    textCtx.fillStyle = color;
    textCtx.textAlign = 'center';
    
    // Render song title
    textCtx.font = `bold ${size}px ${font}`;
    textCtx.fillText(songTitle, textCanvas.width / 2, textCanvas.height / 6);
    
    // Render artist name
    textCtx.font = `${size * 0.6}px ${font}`;
    textCtx.fillText(artistName, textCanvas.width / 2, (textCanvas.height / 6) + size * 1.2);
  }
}

// Define the custom element if not already defined
if (!customElements.get('text-controls')) {
  customElements.define('text-controls', TextControls);
}
