class TextControls extends HTMLElement {
  constructor() {
    super();
  }
  
  connectedCallback() {
    this.render();
  }
  
  render() {
    this.innerHTML = `
      <div class="text-controls">
        <div class="text-input-group">
          <input type="text" id="songTitleInput" placeholder="Song Title">
          <input type="text" id="artistNameInput" placeholder="Artist Name">
          <select id="fontSelect">
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
          </select>
          <input type="color" id="textColor" value="#ffffff">
          <input type="number" id="fontSize" value="36" min="12" max="128">
        </div>
      </div>
    `;

    
  }
}

// Define the custom element if not already defined
if (!customElements.get('text-controls')) {
  customElements.define('text-controls', TextControls);
}
