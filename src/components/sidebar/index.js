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
      <div class="right w-[300px] h-full flex z-99 p-0 flex-col justify-start items-center bg-gray-800 border-l-2 border-gray-700 overflow-y-auto overflow-x-hidden">
        <div class="p-6 w-[300px]">
          <div class="space-y-6">
            <text-controls></text-controls>
            <background-controls></background-controls>
            <waveform-controls></waveform-controls>
            <video-controls></video-controls>
          </div>
        </div>
      </div>
    `;
  }
}

// Define the custom element if not already defined
if (!customElements.get('wr-sidebar')) {
  customElements.define('wr-sidebar', SideBar);
}
