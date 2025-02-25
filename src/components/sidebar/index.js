import './text.js';
import './background.js';
import './waveform.js';
import './video.js';

class SideBar extends HTMLElement {
  constructor() {
    super();
  }
  
  connectedCallback() {
    this.render();
  }
  
  render() {
    this.innerHTML = `
      <div class="p-6 w-[300px]">
        <div class="space-y-6">
          <text-controls></text-controls>
          <background-controls></background-controls>
          <waveform-controls></waveform-controls>
          <video-controls></video-controls>
        </div>
      </div>
    `;
  }

  
}

// Define the custom element if not already defined
if (!customElements.get('side-bar')) {
  customElements.define('side-bar', SideBar);
}
