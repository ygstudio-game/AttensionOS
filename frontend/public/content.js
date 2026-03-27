/**
 * FogOfWar Content Script
 * bridges AttentionOS Side Panel state to the host web page.
 * Uses Shadow DOM for style isolation and hardware-accelerated CSS for performance.
 */

class FogOfWar {
  constructor() {
    this.overlay = null;
    this.shadowRoot = null;
    this.isFocused = true;
    this.blurIntensity = 20;
    this.transitionDuration = '600ms';
    this.port = null;
    
    this.init();
  }

  init() {
    // Listen for messages from the Side Panel / Background
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'UPDATE_FOCUS_STATE') {
        this.updateState(message.isFocused);
      }
    });

    // Handle connection from Side Panel to detect closure
    this.setupPresenceCheck();

    // Handle SPA navigation or DOM changes
    this.observeNavigation();
    
    // Initial setup if needed
    console.log('AttentionOS: Fog of War content script initialized.');
  }

  setupPresenceCheck() {
    // We check periodically if the sidepanel is still alive
    // because chrome.runtime.onMessage is fire-and-forget.
    setInterval(() => {
      try {
        // If this fails or we can't ping, we should unblur
        chrome.runtime.sendMessage({ type: 'HEARTBEAT' }, (response) => {
          if (chrome.runtime.lastError) {
            // Extension context invalidated or sidepanel closed
            this.updateState(true); 
          }
        });
      } catch (e) {
        this.updateState(true);
      }
    }, 5000); // 5 second check
  }

  createOverlay() {
    if (this.overlay) return;

    // Create container for Shadow DOM
    this.overlay = document.createElement('div');
    this.overlay.id = 'attention-os-fog-container';
    this.overlay.style.position = 'fixed';
    this.overlay.style.top = '0';
    this.overlay.style.left = '0';
    this.overlay.style.width = '100vw';
    this.overlay.style.height = '100vh';
    this.overlay.style.pointerEvents = 'none';
    this.overlay.style.zIndex = '2147483647'; // Max Z-index
    
    // Attach Shadow DOM
    this.shadowRoot = this.overlay.attachShadow({ mode: 'closed' });

    // Create the actual blur element inside Shadow DOM
    const blurElement = document.createElement('div');
    blurElement.id = 'fog-overlay';
    
    // Internal styles for the Shadow DOM
    const style = document.createElement('style');
    style.textContent = `
      #fog-overlay {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        backdrop-filter: blur(0px);
        background-color: rgba(15, 23, 42, 0);
        transition: backdrop-filter ${this.transitionDuration} ease, 
                    background-color ${this.transitionDuration} ease;
        pointer-events: none;
        will-change: backdrop-filter, background-color;
      }

      #fog-overlay.active {
        backdrop-filter: blur(${this.blurIntensity}px);
        background-color: rgba(15, 23, 42, 0.4);
      }
    `;

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(blurElement);
    document.documentElement.appendChild(this.overlay);
  }

  updateState(isFocused) {
    this.isFocused = isFocused;
    
    if (!this.overlay) {
      this.createOverlay();
    }

    const blurElement = this.shadowRoot.getElementById('fog-overlay');
    if (isFocused) {
      blurElement.classList.remove('active');
    } else {
      blurElement.classList.add('active');
    }
  }

  observeNavigation() {
    // For SPAs (YouTube, Twitter, etc), the body might change but the script persists
    // We ensure our overlay is still in the DOM
    const observer = new MutationObserver(() => {
      if (this.overlay && !document.getElementById('attention-os-fog-container')) {
        document.documentElement.appendChild(this.overlay);
      }
    });

    observer.observe(document.documentElement, { childList: true });
  }
}

// Instantiate the singleton
if (!window.attentionOSFog) {
  window.attentionOSFog = new FogOfWar();
}
console.log("AttentionOS Content Script injected successfully!");
// We will add the Fog of War blur logic here next