// src/notebooklm.ts

// ==========================================
// 1. HELPERS
// ==========================================

function setNativeValue(element: HTMLElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

  if (valueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter?.call(element, value);
  } else {
    valueSetter?.call(element, value);
  }
  element.dispatchEvent(new Event('input', { bubbles: true }));
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function waitForElement(selector: string, retries = 10): Promise<HTMLElement | null> {
  for (let i = 0; i < retries; i++) {
    const el = document.querySelector(selector);
    if (el) return el as HTMLElement;
    await sleep(500);
  }
  return null;
}

// ==========================================
// 2. AUTO-SYNC LOGIC (UPDATED WITH INSERT CLICK)
// ==========================================

async function runAutoSync() {
  // A. Find "Website" button
  const websiteBtn = Array.from(document.querySelectorAll('div, span, button'))
    .find(el => el.textContent?.trim() === 'Website') as HTMLElement;
  
  if (websiteBtn) {
    websiteBtn.click();
    await sleep(1000); 
  } else {
    alert('Please open the "Add Source" menu first!');
    return;
  }

  // B. Get URLs from Storage
  chrome.storage.local.get(['allUrls'], async (result) => {
    const allUrls = result.allUrls as string;

    if (!allUrls) {
      alert("No links found in storage.");
      return;
    }

    // C. Wait for Input Box
    const input = await waitForElement('textarea[formcontrolname="newUrl"]') || 
                  await waitForElement('textarea') || 
                  await waitForElement('input[type="text"]');

    if (input) {
      // D. PASTE TEXT
      input.focus();
      await sleep(200);

      // Try native clipboard command first (most reliable)
      const success = document.execCommand('insertText', false, allUrls);
      
      // Fallback to React Hack if needed
      if (!success) {
        setNativeValue(input as HTMLInputElement, allUrls);
      }
      
      // Fire extra events to wake up the "Insert" button
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await sleep(500); // Wait for the UI to validate the links

      // E. FIND AND CLICK "INSERT"
      // We look for a button with class "submit-button" OR text "Insert"
      let insertBtn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent?.trim() === 'Insert') as HTMLElement;
      
      // Fallback search by text if class name changed
      if (!insertBtn) {
        insertBtn = Array.from(document.querySelectorAll('button'))
          .find(b => b.textContent?.trim() === 'Insert') as HTMLElement;
      }

      if (insertBtn) {
        // Wait up to 1 second for button to become enabled
        for (let i = 0; i < 5; i++) {
           if (!(insertBtn as HTMLButtonElement).disabled) break;
           await sleep(200);
        }

        insertBtn.click();
      } else {
        // Fallback: Try hitting Enter if we couldn't find the button
        console.warn("Minerva: Could not find 'Insert' button, trying Enter key.");
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      }

    } else {
      console.error("Minerva Extension: Could not find textarea or input.");
      alert("Error: The text box did not appear in time.");
    }
  });
}

// ==========================================
// 3. UI INJECTION (FULL SCREEN WRAPPER)
// ==========================================

function createLoomLikeDock(links: { title: string; url: string }[]) {
  const oldHost = document.getElementById('minerva-loom-host');
  if (oldHost) oldHost.remove();

  const host = document.createElement('div');
  host.id = 'minerva-loom-host';
  host.popover = "manual"; 
  host.style.cssText = `
    position: fixed; inset: 0; width: 100vw; height: 100vh;
    background: transparent; pointer-events: none; z-index: 2147483647;
    margin: 0; padding: 0; border: none;
  `;

  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = `
    .dock-positioner {
      position: absolute; bottom: 20px; right: 20px; pointer-events: auto;
    }
    .dock-container {
      background: #1e1e1e; color: white; border: 1px solid #444; border-radius: 12px;
      padding: 16px; font-family: system-ui, sans-serif; box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      display: flex; flex-direction: column; gap: 12px; width: 250px;
    }
    .title { font-size: 14px; font-weight: 600; color: #60a5fa; margin: 0; }
    .btn {
      background: #2563eb; color: white; border: none; padding: 10px; border-radius: 6px;
      font-weight: 600; cursor: pointer; transition: background 0.2s;
    }
    .btn:hover { background: #1d4ed8; }
    .status { font-size: 11px; color: #9ca3af; text-align: center; }
  `;
  shadow.appendChild(style);

  const positioner = document.createElement('div');
  positioner.className = 'dock-positioner';
  const container = document.createElement('div');
  container.className = 'dock-container';
  container.innerHTML = `
    <h3 class="title">Minerva Links</h3>
    <button class="btn">⚡ Sync ${links.length} Links</button>
    <div class="status">Click "Add Source" first</div>
  `;
  
  container.querySelector('button')!.onclick = () => runAutoSync();
  
  positioner.appendChild(container);
  shadow.appendChild(positioner);
  document.body.appendChild(host);
  host.showPopover(); 

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
          if (node.hasAttribute('popover') || node.classList.contains('cdk-overlay-container')) {
            host.hidePopover();
            host.showPopover();
          }
        }
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// ==========================================
// 4. INITIALIZATION
// ==========================================

chrome.storage.local.get(['links'], (result) => {
  const data = result as { links?: { title: string; url: string }[] };
  if (data.links && data.links.length > 0) {
    const interval = setInterval(() => {
      if (document.body) {
        createLoomLikeDock(data.links!);
        clearInterval(interval);
      }
    }, 500);
  }
});