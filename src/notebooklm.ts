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
// 2. AUTO-SYNC LOGIC
// ==========================================

async function runAutoSync() {
  console.log("Minerva: Starting Auto-Sync...");
  
  // Find the REAL "Website" chip (ignoring our own "Sync" chip)
  const allChips = Array.from(document.querySelectorAll('mat-chip, button, div[role="button"]'));
  const websiteBtn = allChips.find(el => 
    el.textContent?.includes('Website') && !el.textContent.includes('Sync')
  ) as HTMLElement;
  
  if (websiteBtn) {
    websiteBtn.click();
    await sleep(1000); 
  } else {
    alert('Could not navigate to the Website input screen.');
    return;
  }

  chrome.storage.local.get(['allUrls'], async (result) => {
    const allUrls = result.allUrls as string;

    if (!allUrls) {
      alert("No links found in storage.");
      return;
    }

    // Wait for Input Box
    const input = await waitForElement('textarea[formcontrolname="newUrl"]') || 
                  await waitForElement('textarea') || 
                  await waitForElement('input[type="text"]');

    if (input) {
      input.focus();
      await sleep(200);

      const success = document.execCommand('insertText', false, allUrls);
      if (!success) setNativeValue(input as HTMLInputElement, allUrls);
      
      input.dispatchEvent(new Event('change', { bubbles: true }));
      await sleep(500); 

      // Find Insert Button
      const insertBtn = Array.from(document.querySelectorAll('button'))
        .find(b => b.textContent?.trim() === 'Insert') as HTMLElement;

      if (insertBtn) {
        for (let i = 0; i < 10; i++) {
           if (!(insertBtn as HTMLButtonElement).disabled) break;
           await sleep(200);
        }
        insertBtn.click();
        
        const count = allUrls.split('\n').filter(line => line.trim() !== '').length;
        console.log(`Minerva: Successfully synced ${count} links.`);
      } else {
        // Fallback enter key
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      }
    } else {
      alert("Error: The input box did not appear.");
    }
  });
}

// ==========================================
// 3. AGGRESSIVE CHIP INJECTION
// ==========================================

function injectNativeSyncChip() {
  // Watch the entire body for changes
  const observer = new MutationObserver(() => {
    // If we already injected, stop.
    if (document.getElementById('minerva-sync-chip')) return;

    // 1. Find ALL chips on the page
    const allChips = Array.from(document.querySelectorAll('mat-chip'));
    
    // 2. Find the "Website" chip specifically
    const websiteChip = allChips.find(c => c.textContent?.trim().includes('Website'));

    if (websiteChip) {
      console.log("Minerva: Found Website chip, preparing to inject...");
      
      // 3. Clone it
      const newChip = websiteChip.cloneNode(true) as HTMLElement;
      newChip.id = 'minerva-sync-chip';
      
      // 4. Update Icon
      const icon = newChip.querySelector('mat-icon');
      if (icon) {
        icon.textContent = 'bolt';
        (icon as HTMLElement).style.color = '#FACC15'; // Yellow Bolt
      }

      // 5. Update Text
      // Try to find the inner text span, otherwise replace full text
      const label = newChip.querySelector('.mdc-evolution-chip__text-label');
      if (label) {
        // If there's a span inside, update that. Otherwise update the label itself.
        const innerSpan = label.querySelector('span');
        if (innerSpan) {
            innerSpan.textContent = 'Sync Minerva';
        } else {
            label.textContent = 'Sync Minerva';
        }
      }

      // 6. Add Click Listener
      newChip.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        newChip.style.opacity = '0.5';
        setTimeout(() => newChip.style.opacity = '1', 150);
        runAutoSync();
      });

      // 7. Insert it! 
      // We try to insert AFTER the website chip.
      const parent = websiteChip.parentElement;
      if (parent) {
        // Insert after 'Website' (so it sits between Website and YouTube usually)
        parent.insertBefore(newChip, websiteChip.nextSibling);
        console.log("Minerva: Chip injected successfully!");
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// ==========================================
// 4. INITIALIZATION
// ==========================================

console.log("Minerva: Script Loaded");

chrome.storage.local.get(['links'], (result) => {
  const data = result as { links?: { title: string; url: string }[] };
  if (data.links && data.links.length > 0) {
    injectNativeSyncChip();
  }
});