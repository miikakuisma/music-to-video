class WaveformControls extends HTMLElement {
  constructor() {
    super();
    this.enabled = true;
  }
  
  connectedCallback() {
    this.render();
  }
  
  render() {
    this.innerHTML = `
      <div class="form-group">
        <label class="form-label">Pick Audio File</label>
        <div class="flex items-center gap-2">
          <input type="file" id="audioFile" accept="audio/*" class="form-input">
        </div>
      </div>
  
      <div class="flex justify-between align-center">
        <div class="form-group w-full mr-2 flex justify-between items-center">
          <label class="toggle-label">Show Waveform</label>
          <input type="checkbox" id="waveformEnabled" class="toggle-switch" ${this.enabled ? 'checked' : ''}>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Height</label>
        <select id="waveHeight" class="form-input">
          <option value="1" ${Math.abs(timeline[0].barHeight - 1) < 0.001 ? 'selected' : ''}>100%</option>
          <option value="0.75" ${Math.abs(timeline[0].barHeight - 0.75) < 0.001 ? 'selected' : ''}>75%</option>
          <option value="0.5" ${Math.abs(timeline[0].barHeight - 0.5) < 0.001 ? 'selected' : ''}>50%</option>
          <option value="0.333" ${Math.abs(timeline[0].barHeight - 0.333) < 0.001 ? 'selected' : ''}>33%</option>
          <option value="0.25" ${Math.abs(timeline[0].barHeight - 0.25) < 0.001 ? 'selected' : ''}>25%</option>
          <option value="0.20" ${Math.abs(timeline[0].barHeight - 0.20) < 0.001 ? 'selected' : ''}>20%</option>
        </select>
      </div>

      <div class="flex justify-between align-center">
        <div class="form-group w-1/2 mr-1">
          <label class="form-label">Wave Color</label>
          <div class="flex items-center gap-2">
            <input type="color" id="waveformColor" value="${timeline[0].waveformColor}" class="color-input">
          </div>
        </div>
        <div class="form-group w-1/2 ml-1">
          <label class="form-label">Progress Color</label>
          <div class="flex items-center gap-2">
            <input type="color" id="progressColor" value="${timeline[0].progressColor}" class="color-input">
          </div>
        </div>
      </div>

      <div class="flex justify-between align-center">
        <div class="form-group w-1/2 mr-2">
          <label class="form-label">Bar Width</label>
          <div class="flex items-center gap-2">
            <input type="number" id="barWidth" value="${timeline[0].barWidth}" class="form-input">
          </div>
        </div>
        <div class="form-group w-1/2 ml-2">
          <label class="form-label">Bar Gap</label>
          <div class="flex items-center gap-2">
            <input type="number" id="barGap" value="${timeline[0].barGap}" class="form-input">
          </div>
        </div>
      </div>

      <div class="flex justify-between align-center">
        <div class="form-group w-1/2 mr-2">
          <label class="form-label">Cursor Width</label>
          <div class="flex items-center gap-2">
            <input type="number" id="cursorWidth" value="${timeline[0].cursorWidth}" class="form-input">
          </div>
        </div>
        <div class="form-group w-1/2 ml-2">
          <label class="form-label">Bar Align</label>
          <div class="flex items-center gap-2">
            <select id="barAlign" class="form-input" value="${timeline[0].barAlign}">
              <option value="top">Top</option>
              <option value="center">Center</option>
              <option value="bottom" selected>Bottom</option>
            </select>
          </div>
        </div>
      </div>
    `;

    document.getElementById('audioFile').addEventListener('change', handleFileDrop);

    document.getElementById('waveHeight').addEventListener('change', () => {
      const heightValue = parseFloat(document.getElementById('waveHeight').value);
      try {
        const wavesurfer = document.querySelector('wr-wavesurfer').wavesurfer;
        timeline[0].barHeight = heightValue;
        wavesurfer.setOptions({
          barHeight: heightValue
        });
      } catch (error) {
        console.error('Error setting waveform options:', error);
      }
    });

    document.getElementById('waveformEnabled').addEventListener('change', () => {
      this.enabled = !this.enabled
      if (this.enabled) {
        document.querySelector('#waveform').style.display = 'block';
      } else {
        document.querySelector('#waveform').style.display = 'none';
      }
      
      // Even when waveform is hidden, ensure progress tracking still works
      // Store display state on wavesurfer element for reference
      document.querySelector('wr-wavesurfer').waveformVisible = this.enabled;
    })

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
    const barHeight = document.getElementById('waveHeight').value;
    const wavesurfer = document.querySelector('wr-wavesurfer').wavesurfer;
    const videoControls = document.querySelector('video-controls');
    
    // update timeline model from input fields
    timeline[0].waveformColor = waveformColor;
    timeline[0].progressColor = progressColor;
    timeline[0].barWidth = barWidth;
    timeline[0].barHeight = barHeight;
    timeline[0].barGap = barGap;
    timeline[0].cursorWidth = cursorWidth;
    timeline[0].barAlign = barAlign;

    try {
      wavesurfer.setOptions({
        waveColor: waveformColor,
        progressColor: progressColor,
        barWidth: barWidth,
        barGap: barGap,
        cursorWidth: cursorWidth,
        barAlign: barAlign
      });
      // Let video controls handle dimension changes to keep them consistent
      videoControls.updateWaveform();
    } catch (error) {
      console.error('Error setting waveform options:', error);
    }

    document.querySelector('wr-wavesurfer').waveformCanvas = wavesurfer.renderer.canvasWrapper.querySelector('canvas');
    document.querySelector('wr-wavesurfer').progressCanvas = wavesurfer.renderer.progressWrapper.querySelector('canvas');
  }
}

// Define the custom element if not already defined
if (!customElements.get('waveform-controls')) {
  customElements.define('waveform-controls', WaveformControls);
}
