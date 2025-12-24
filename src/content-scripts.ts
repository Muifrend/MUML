function getReadings() {
  // --- PART 1: Get the Session Title ---
  const titleElement = document.querySelector('section.lines h1 a');
  const sessionTitle = titleElement?.textContent?.trim() || "Unknown Session";

  // --- PART 2: Get the Readings ---
  const allHeaders = Array.from(document.querySelectorAll('h3'));
  const readingsHeader = allHeaders.find(h => h.textContent?.trim() === "Readings");

  let readingLinks: { title: string; url: string }[] = [];

  if (readingsHeader) {
    const headerContainer = readingsHeader.parentElement;
    const linksContainer = headerContainer?.nextElementSibling;

    if (linksContainer) {
      const linkElements = Array.from(linksContainer.querySelectorAll('a'));
      readingLinks = linkElements
        .filter(link => link.href && !link.href.startsWith('javascript:'))
        .map(link => ({
          title: link.innerText.trim() || link.href,
          url: link.href
        }));
    }
  }

  // --- PART 3: Create the "allUrls" String ---
  const allUrls = readingLinks.map(link => link.url).join('\n');

  // --- PART 4: Return Everything ---
  return {
    sessionTitle: sessionTitle,
    links: readingLinks,
    allUrls: allUrls
  };
}

const extractWorkbookContent = () => {
  // 1. Select ALL editors inside the blocks
  const selector = 'div[data-cy="block"] .ql-editor';
  const editorElements = document.querySelectorAll(selector);

  if (editorElements.length > 0) {
    // 2. Map over the elements to get their text and join them
    const fullText = Array.from(editorElements)
      .map(element => element.textContent?.trim())
      .filter(text => text && text.length > 0)
      .join('\n\n----------------\n\n');

    console.log("Minerva LM: Workbook Scrape Triggered. Length:", fullText.length);
    
    // 3. Save to chrome.storage (This triggers the UI update in your Popup)
    chrome.storage.local.set({ workbookContent: fullText });
  } else {
    console.log("Minerva LM: No workbook content found yet.");
  }
};


// ==================================================
// LOGIC: MAIN FORUM PAGE
// ==================================================
if (window.location.hostname === "forum.minerva.edu") {
  
  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    // Respond to the "Get Readings" button
    if (request.action === "GET_READINGS") {
      console.log("Minerva LM: Fetching links from Main Forum...");
      const data = getReadings();
      sendResponse({ success: true, data: data });
    }
    // Note: We do NOT return true here because getReadings is synchronous
  });
}


// ==================================================
// LOGIC: IFRAME (WORKBOOK)
// ==================================================
if (window.location.hostname === "sle-collaboration.minervaproject.com") {
  
  console.log("Minerva LM: Iframe Script Active");

  // 1. LISTEN FOR THE BUTTON CLICK (The "On Press" Requirement)
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "GET_READINGS") {
      // When user clicks "Get Readings", we ALSO scrape the workbook
      console.log("Minerva LM: Iframe received sync trigger...");
      extractWorkbookContent();
      
      // IMPORTANT: We do NOT call sendResponse() here. 
      // The Main Forum script handles the response. 
      // We just save to storage, and the popup's storage listener handles the rest.
    }
  });

  // 2. AUTOMATIC OBSERVER (Backup: catches content as it loads)
  extractWorkbookContent(); // Run once immediately
  
  const observer = new MutationObserver(() => {
    extractWorkbookContent();
  });

  observer.observe(document.body, { childList: true, subtree: true });
}