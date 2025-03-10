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
        <input type="text" id="songTitleInput" placeholder="Song Title" value="${timeline[0].text.songTitle}" class="form-input">
      </div>
    
      <div class="form-group">
        <input type="text" id="artistNameInput" placeholder="Artist Name" value="${timeline[0].text.artistName}" class="form-input">
      </div>
      
      <div class="flex gap-2 items-center">
        <select id="fontSelect" class="form-input flex-grow">
          <option value="Arial" ${timeline[0].text.font === 'Arial' ? 'selected' : ''}>Arial</option>
          <option value="Helvetica" ${timeline[0].text.font === 'Helvetica' ? 'selected' : ''}>Helvetica</option>
          <option value="Times New Roman" ${timeline[0].text.font === 'Times New Roman' ? 'selected' : ''}>Times New Roman</option>
        </select>
        <input type="number" id="fontSize" value="${timeline[0].text.fontSize}" min="12" max="128" class="form-input w-20">
        <input type="color" id="textColor" value="${timeline[0].text.color}" class="color-input">
      </div>

      <div class="form-group mt-4">
        <select id="textAlign" class="form-input">
          <option value="top-left" ${timeline[0].text.align === 'top-left' ? 'selected' : ''}>Top Left</option>
          <option value="top-center" ${timeline[0].text.align === 'top-center' ? 'selected' : ''}>Top Center</option>
          <option value="top-right" ${timeline[0].text.align === 'top-right' ? 'selected' : ''}>Top Right</option>
          <option value="center-left" ${timeline[0].text.align === 'center-left' ? 'selected' : ''}>Center Left</option>
          <option value="center-center" ${timeline[0].text.align === 'center-center' ? 'selected' : ''}>Center Center</option>
          <option value="center-right" ${timeline[0].text.align === 'center-right' ? 'selected' : ''}>Center Right</option>
          <option value="bottom-left" ${timeline[0].text.align === 'bottom-left' ? 'selected' : ''}>Bottom Left</option>
          <option value="bottom-center" ${timeline[0].text.align === 'bottom-center' ? 'selected' : ''}>Bottom Center</option>
          <option value="bottom-right" ${timeline[0].text.align === 'bottom-right' ? 'selected' : ''}>Bottom Right</option>
        </select>
      </div>

      <div class="flex justify-between align-center mt-4 pr-10">
        <div class="form-group">
          <label class="form-label">X Offset</label>
          <div class="flex items-center">
            <input type="range" id="textOffsetX" min="-100" max="100" value="${timeline[0].text.offsetX}" class="form-range">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Y Offset</label>
          <div class="flex items-center">
            <input type="range" id="textOffsetY" min="-100" max="100" value="${timeline[0].text.offsetY}" class="form-range">
          </div>
        </div>
      </div>
    `;

    document.getElementById('songTitleInput').addEventListener('input', (e) => {
      timeline[0].text.songTitle = e.target.value;
      this.renderText();
    });
    document.getElementById('artistNameInput').addEventListener('input', (e) => {
      timeline[0].text.artistName = e.target.value;
      this.renderText();
    });
    document.getElementById('fontSelect').addEventListener('change', (e) => {
      timeline[0].text.font = e.target.value;
      this.renderText();
    });
    document.getElementById('textColor').addEventListener('input', (e) => {
      timeline[0].text.color = e.target.value;
      this.renderText();
    });
    document.getElementById('fontSize').addEventListener('input', (e) => {
      timeline[0].text.fontSize = e.target.value;
      this.renderText();
    });
    document.getElementById('textAlign').addEventListener('change', (e) => {
      timeline[0].text.align = e.target.value;
      this.renderText();
    });
    document.getElementById('textOffsetX').addEventListener('input', (e) => {
      timeline[0].text.offsetX = e.target.value;
      this.renderText();
    });
    document.getElementById('textOffsetY').addEventListener('input', (e) => {
      timeline[0].text.offsetY = e.target.value;
      this.renderText();
    });
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
    
    // Read text properties from timeline data
    const { songTitle, artistName, font, color, fontSize, align, offsetX, offsetY } = timeline[0].text;
    
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
    x += parseInt(offsetX, 10);
    y += parseInt(offsetY, 10);
    
    // Render song title
    textCtx.font = `bold ${fontSize}px ${font}`;
    textCtx.fillText(songTitle, x, y);
    
    // Render artist name below title
    textCtx.font = `${fontSize * 0.6}px ${font}`;
    textCtx.fillText(artistName, x, y + fontSize * 1.2);
  }
}

// Define the custom element if not already defined
if (!customElements.get('text-controls')) {
  customElements.define('text-controls', TextControls);
}
