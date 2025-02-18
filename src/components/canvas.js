class WaveSurferCanvas extends HTMLElement {
  constructor() {
    super();
  }
  
  connectedCallback() {
    this.render();
  }
  
  render() {
    this.innerHTML = `
      <div class="waveform-container">
        <div class="canvas-stack">
          <canvas id="textOverlay"></canvas>
          <div id="waveform"></div>
        </div>
      </div>
    `;

    
  }
}

// Define the custom element if not already defined
if (!customElements.get('wave-surfer')) {
  customElements.define('wave-surfer', WaveSurferCanvas);
}
