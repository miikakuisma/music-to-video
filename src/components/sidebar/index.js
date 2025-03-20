import './text.js';
import './background.js';
import './waveform.js';
import './video.js';

class Sidebar extends HTMLElement {
  constructor() {
    super();
    this.activeTab = 'waveform'; // Default active tab
  }
  
  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }
  
  render() {
    this.innerHTML = `
      <div class="sidebar-container w-[300px] h-full flex flex-col bg-gray-800 border-l-2 border-gray-700 overflow-hidden">
        <!-- Fixed Tab Navigation -->
        <header class="tab-bar-container">
          <div class="tab-bar w-full h-12 flex justify-between items-center bg-gray-900 border-b border-gray-700">
            <button class="tab-button ${this.activeTab === 'waveform' ? 'active' : ''}" data-tab="waveform">
              <svg width="24" height="24" color="#ccc" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg"><title/><g fill="none" fill-rule="evenodd" id="finder-copy-2" stroke="none" stroke-width="1"><rect fill="currentColor" height="16" id="Rectangle" rx="2.5" width="5" x="5" y="20"/><rect fill="currentColor" height="32" id="Rectangle-Copy" rx="2.5" width="5" x="13" y="12"/><rect fill="currentColor" height="24" id="Rectangle-Copy-2" rx="2.5" width="5" x="21" y="16"/><rect fill="currentColor" height="12" id="Rectangle-Copy-3" rx="2.5" width="5" x="29" y="22"/><rect fill="currentColor" height="38" id="Rectangle-Copy-4" rx="2.5" width="5" x="37" y="9"/><rect fill="currentColor" height="22" id="Rectangle-Copy-5" rx="2.5" width="5" x="45" y="17"/></g></svg>
            </button>
            <button class="tab-button ${this.activeTab === 'background' ? 'active' : ''}" data-tab="background">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" color="#ccc" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tab-icon">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="9" cy="9" r="2"></circle>
                <path d="M21 15l-5-5L5 21"></path>
              </svg>
            </button>
            <button class="tab-button ${this.activeTab === 'text' ? 'active' : ''}" data-tab="text">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" color="#ccc" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tab-icon">
                <polyline points="4 7 4 4 20 4 20 7"></polyline>
                <line x1="9" y1="20" x2="15" y2="20"></line>
                <line x1="12" y1="4" x2="12" y2="20"></line>
              </svg>
            </button>
            <button class="tab-button ${this.activeTab === 'video' ? 'active' : ''}" data-tab="video">
              <svg width="24" height="24" color="#ccc" viewBox="0 0 20 16" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke="none" stroke-width="1"><g fill="currentColor" transform="translate(-548.000000, -172.000000)"><g transform="translate(548.000000, 172.000000)"><path d="M16,0 L18,4 L15,4 L13,0 L11,0 L13,4 L10,4 L8,0 L6,0 L8,4 L5,4 L3,0 L2,0 C0.9,0 0,0.9 0,2 L0,14 C0,15.1 0.9,16 2,16 L18,16 C19.1,16 20,15.1 20,14 L20,0 L16,0 L16,0 Z" /></g></g></g></svg>
            </button>
          </div>
        </header>
        
        <!-- Scrollable Tab Content -->
        <main class="tab-content-container w-full flex-grow overflow-y-auto overflow-x-hidden p-4">
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
        </main>
        
        <!-- Export Button - fixed at bottom -->
        <footer class="export-button-container p-4 w-full flex justify-center items-center bg-gray-800 border-t-2 border-gray-700">
          <button id="renderBtn" disabled class="btn-primary">
            Export Video
          </button>
        </footer>
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
