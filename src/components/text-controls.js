let textCanvas;
let textCtx;

class TextControls extends HTMLElement {
  constructor() {
    super();
  }
  
  connectedCallback() {
    this.render();
    setTimeout(() => {
      this.initTextCanvas();
      this.renderText();
    }, 1000);
  }
  
  render() {
    this.innerHTML = `
      <div class="text-controls">
        <div class="text-input-group">
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
      </div>
    `;

    document.getElementById('songTitleInput').addEventListener('input', this.renderText);
    document.getElementById('artistNameInput').addEventListener('input', this.renderText);
    document.getElementById('fontSelect').addEventListener('change', this.renderText);
    document.getElementById('textColor').addEventListener('input', this.renderText);
    document.getElementById('fontSize').addEventListener('input', this.renderText);
  }

  initTextCanvas() {
    textCanvas = document.getElementById('textOverlay');
    textCtx = textCanvas.getContext('2d');
    
    // Set canvas size to match waveform
    textCanvas.width = 1280;
    textCanvas.height = 720;
    
    // Initial render
    this.renderText();
  }

  renderText() {
    // Clear the canvas
    textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
    
    // Get text properties
    const songTitle = document.getElementById('songTitleInput').value;
    const artistName = document.getElementById('artistNameInput').value;
    const font = document.getElementById('fontSelect').value;
    const color = document.getElementById('textColor').value;
    const size = document.getElementById('fontSize').value;
    
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
