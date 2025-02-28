import './text.js';
import './background.js';
import './waveform.js';
import './video.js';

class Sidebar extends HTMLElement {
  constructor() {
    super();
    this.activeTab = 'background'; // Default active tab
  }
  
  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }
  
  render() {
    this.innerHTML = `
      <div class="w-[300px] h-full flex z-99 p-0 flex-col justify-start items-center bg-gray-800 border-l-2 border-gray-700 overflow-hidden">
        <!-- Tab Navigation -->
        <div class="w-full h-12 flex justify-between items-center bg-gray-900 border-b border-gray-700">
          <button class="tab-button ${this.activeTab === 'background' ? 'active' : ''}" data-tab="background">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tab-icon">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="9" cy="9" r="2"></circle>
              <path d="M21 15l-5-5L5 21"></path>
            </svg>
            <span class="tab-tooltip">Background</span>
          </button>
          <button class="tab-button ${this.activeTab === 'waveform' ? 'active' : ''}" data-tab="waveform">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tab-icon">
              <path d="M2 12h2a2 2 0 0 0 2-2V8a2 2 0 0 1 2-2h2"></path>
              <path d="M10 6h2a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2"></path>
              <path d="M18 12h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h2"></path>
            </svg>
            <span class="tab-tooltip">Waveform</span>
          </button>
          <button class="tab-button ${this.activeTab === 'text' ? 'active' : ''}" data-tab="text">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tab-icon">
              <polyline points="4 7 4 4 20 4 20 7"></polyline>
              <line x1="9" y1="20" x2="15" y2="20"></line>
              <line x1="12" y1="4" x2="12" y2="20"></line>
            </svg>
            <span class="tab-tooltip">Text</span>
          </button>
          <button class="tab-button ${this.activeTab === 'video' ? 'active' : ''}" data-tab="video">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tab-icon">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
              <line x1="7" y1="2" x2="7" y2="22"></line>
              <line x1="17" y1="2" x2="17" y2="22"></line>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <line x1="2" y1="7" x2="7" y2="7"></line>
              <line x1="2" y1="17" x2="7" y2="17"></line>
              <line x1="17" y1="17" x2="22" y2="17"></line>
              <line x1="17" y1="7" x2="22" y2="7"></line>
            </svg>
            <span class="tab-tooltip">Video</span>
          </button>
        </div>
        
        <!-- Tab Content -->
        <div class="w-full h-[calc(100%-48px)] overflow-y-auto overflow-x-hidden p-4">
          <div id="background-tab" class="tab-content ${this.activeTab === 'background' ? 'block' : 'hidden'}">
            <background-controls></background-controls>
          </div>
          <div id="waveform-tab" class="tab-content ${this.activeTab === 'waveform' ? 'block' : 'hidden'}">
            <waveform-controls></waveform-controls>
          </div>
          <div id="text-tab" class="tab-content ${this.activeTab === 'text' ? 'block' : 'hidden'}">
            <text-controls></text-controls>
          </div>
          <div id="video-tab" class="tab-content ${this.activeTab === 'video' ? 'block' : 'hidden'}">
            <video-controls></video-controls>
          </div>
        </div>
      </div>

      <div class="fixed bottom-0 right-0 p-4 w-[300px] flex justify-center items-center bg-gray-800 border-t-2 border-gray-700">
        <button id="renderBtn" disabled class="btn-primary">
          Export Video
        </button>
      </div>
    `;
  }

  attachEventListeners() {
    const tabButtons = this.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.switchTab(button.dataset.tab);
      });
    });
  }

  switchTab(tabName) {
    // Update active state
    this.activeTab = tabName;
    
    // Update button states
    const tabButtons = this.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      if (button.dataset.tab === tabName) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
    
    // Show/hide content
    const tabContents = this.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
      if (content.id === `${tabName}-tab`) {
        content.classList.remove('hidden');
        content.classList.add('block');
      } else {
        content.classList.remove('block');
        content.classList.add('hidden');
      }
    });
  }
}

// Define the custom element if not already defined
if (!customElements.get('wr-sidebar')) {
  customElements.define('wr-sidebar', Sidebar);
}
