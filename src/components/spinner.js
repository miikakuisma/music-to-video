class Spinner extends HTMLElement {
  constructor() {
    super();
    this.visible = false;
  }
  
  connectedCallback() {
    this.render();
  }

  static get observedAttributes() {
		return ['visible']
	}

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'visible') {
      this.visible = newValue === 'true';
      this.render();
    }
  }
  
  render() {
    this.innerHTML = `
      <div class="spinner ${this.visible ? 'flex' : 'hidden'} absolute z-40 w-full h-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 justify-center items-center bg-black/80">
          <div class="w-10 h-10 border-4 border-gray-500 border-t-gray-300 rounded-full animate-spin"></div>
      </div>
    `;
  }
}

// Define the custom element if not already defined
if (!customElements.get('wr-spinner')) {
  customElements.define('wr-spinner', Spinner);
}
