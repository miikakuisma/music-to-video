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
      <details open>
        <summary class="mb-2 text-sm text-gray-500">Text</summary>
        <div class="form-group">
          <input type="text" id="songTitleInput" placeholder="Song Title" class="form-input">
        </div>
      
        <div class="form-group">
          <input type="text" id="artistNameInput" placeholder="Artist Name" class="form-input">
        </div>
        
        <div class="flex gap-2 items-center">
          <select id="fontSelect" class="form-input flex-grow">
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
          </select>
          <input type="number" id="fontSize" value="30" min="12" max="128" 
            class="form-input w-20">
            <input type="color" id="textColor" value="#ffffff" class="color-input">
          </div>
        </div>
      </details>
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
    textCanvas.width = document.querySelector('wave-surfer').width;
    textCanvas.height = document.querySelector('wave-surfer').height;
    
    // Initial render
    this.renderText();
  }

  renderText() {
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
