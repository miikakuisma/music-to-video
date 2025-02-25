class WaveformControls extends HTMLElement {
  constructor() {
    super();
  }
  
  connectedCallback() {
    this.render();
  }
  
  render() {
    this.innerHTML = `
      <details open>
        <summary class="mb-2 text-sm text-gray-500">Waveform</summary>

         <div class="flex justify-between align-center">
          <div class="form-group w-full mr-2 flex justify-between items-center">
            <label class="toggle-label">Enabled</label>
            <input type="checkbox" id="waveformEnabled" class="toggle-switch" checked>
          </div>
        </div>

        <div class="flex justify-between align-center">
          <div class="form-group w-1/2 mr-2">
            <label class="form-label">Wave Color</label>
            <div class="flex items-center gap-2">
              <input type="color" id="waveformColor" value="#999999" class="color-input">
            </div>
          </div>
          <div class="form-group w-1/2 ml-2">
            <label class="form-label">Progress Color</label>
            <div class="flex items-center gap-2">
              <input type="color" id="progressColor" value="#ffffff" class="color-input">
            </div>
          </div>
        </div>

        <div class="flex justify-between align-center">
          <div class="form-group w-1/2 mr-2">
            <label class="form-label">Bar Width</label>
            <div class="flex items-center gap-2">
              <input type="number" id="barWidth" value="4" class="form-input">
            </div>
          </div>
          <div class="form-group w-1/2 ml-2">
            <label class="form-label">Bar Gap</label>
            <div class="flex items-center gap-2">
              <input type="number" id="barGap" value="2" class="form-input">
            </div>
          </div>
        </div>

        <div class="flex justify-between align-center">
          <div class="form-group w-1/2 mr-2">
            <label class="form-label">Cursor Width</label>
            <div class="flex items-center gap-2">
              <input type="number" id="cursorWidth" value="0" class="form-input">
            </div>
          </div>
          <div class="form-group w-1/2 ml-2">
            <label class="form-label">Bar Align</label>
            <div class="flex items-center gap-2">
              <select id="barAlign" class="form-input">
                <option value="top">Top</option>
                <option value="center">Center</option>
                <option value="bottom" selected>Bottom</option>
              </select>
            </div>
          </div>
        </div>
      </details>
    `;

    document.getElementById('waveformColor').addEventListener('input', this.updateWaveform);
    document.getElementById('progressColor').addEventListener('input', this.updateWaveform);
    document.getElementById('barWidth').addEventListener('input', this.updateWaveform);
    document.getElementById('barGap').addEventListener('input', this.updateWaveform);
    document.getElementById('cursorWidth').addEventListener('input', this.updateWaveform);
    document.getElementById('barAlign').addEventListener('input', this.updateWaveform);

    setTimeout(() => {
      this.updateWaveform();
    }, 500);
  }

  updateWaveform() {
    const waveformColor = document.getElementById('waveformColor').value;
    const progressColor = document.getElementById('progressColor').value;
    const barWidth = document.getElementById('barWidth').value;
    const barGap = document.getElementById('barGap').value;
    const cursorWidth = document.getElementById('cursorWidth').value;
    const barAlign = document.getElementById('barAlign').value;
    const wavesurfer = document.querySelector('wave-surfer').wavesurfer;

    try {
      wavesurfer.setOptions({
        waveColor: waveformColor,
        progressColor: progressColor,
        barWidth: barWidth,
        barGap: barGap,
        cursorWidth: cursorWidth,
        barAlign: barAlign
      });
    } catch (error) {
      console.error('Error setting waveform options:', error);
    }

    document.querySelector('wave-surfer').waveformCanvas = wavesurfer.renderer.canvasWrapper.querySelector('canvas');
    document.querySelector('wave-surfer').progressCanvas = wavesurfer.renderer.progressWrapper.querySelector('canvas');
  }
}

// Define the custom element if not already defined
if (!customElements.get('waveform-controls')) {
  customElements.define('waveform-controls', WaveformControls);
}
