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
    this.innerHTML = `
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

      <div class="form-group mt-4">
        <select id="textAlign" class="form-input">
          <option value="top-left">Top Left</option>
          <option value="top-center" selected>Top Center</option>
          <option value="top-right">Top Right</option>
          <option value="center-left">Center Left</option>
          <option value="center-center">Center Center</option>
          <option value="center-right">Center Right</option>
          <option value="bottom-left">Bottom Left</option>
          <option value="bottom-center">Bottom Center</option>
          <option value="bottom-right">Bottom Right</option>
        </select>
      </div>

      <div class="flex justify-between align-center mt-4 pr-10">
        <div class="form-group">
          <label class="form-label">X Offset</label>
          <div class="flex items-center">
            <input type="range" id="textOffsetX" min="-100" max="100" value="0" class="form-range">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Y Offset</label>
          <div class="flex items-center">
            <input type="range" id="textOffsetY" min="-100" max="100" value="0" class="form-range">
          </div>
        </div>
      </div>
    `;

    document.getElementById('songTitleInput').addEventListener('input', this.renderText);
    document.getElementById('artistNameInput').addEventListener('input', this.renderText);
    document.getElementById('fontSelect').addEventListener('change', this.renderText);
    document.getElementById('textColor').addEventListener('input', this.renderText);
    document.getElementById('fontSize').addEventListener('input', this.renderText);
    document.getElementById('textAlign').addEventListener('change', this.renderText);
    document.getElementById('textOffsetX').addEventListener('input', this.renderText);
    document.getElementById('textOffsetY').addEventListener('input', this.renderText);
  }

  initTextCanvas() {
    textCanvas = document.getElementById('textOverlay');
    textCtx = textCanvas.getContext('2d');
    
    // Set canvas size to match waveform
    textCanvas.width = document.querySelector('wr-wavesurfer').width;
    textCanvas.height = document.querySelector('wr-wavesurfer').height;
    
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
    const align = document.getElementById('textAlign').value;

    // update timeline model from input fields
    timeline[0].text.songTitle = songTitle;
    timeline[0].text.artistName = artistName;
    timeline[0].text.font = font;
    timeline[0].text.color = color;
    timeline[0].text.size = size;
    timeline[0].text.align = align;
    
    // Set styling
    textCtx.fillStyle = color;
    textCtx.textAlign = 'center'; // Default center alignment
    
    // Calculate x position based on alignment
    let x = textCanvas.width / 2; // Default center
    if (align.endsWith('-left')) {
      x = 30; // Left padding
      textCtx.textAlign = 'left';
    } else if (align.endsWith('-right')) {
      x = textCanvas.width - 30; // Right padding
      textCtx.textAlign = 'right';
    }
    
    // Calculate y position based on alignment
    let y = textCanvas.height / 6; // Default top
    if (align.startsWith('center')) {
      y = textCanvas.height / 2;
    } else if (align.startsWith('bottom')) {
      y = textCanvas.height - 70; // Bottom padding
    }

    // Apply offsets
    x += parseInt(document.getElementById('textOffsetX').value);
    y += parseInt(document.getElementById('textOffsetY').value);
    
    // Render song title
    textCtx.font = `bold ${size}px ${font}`;
    textCtx.fillText(songTitle, x, y);
    
    // Render artist name below title
    textCtx.font = `${size * 0.6}px ${font}`;
    textCtx.fillText(artistName, x, y + size * 1.2);
  }
}

// Define the custom element if not already defined
if (!customElements.get('text-controls')) {
  customElements.define('text-controls', TextControls);
}
