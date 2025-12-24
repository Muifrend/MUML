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
  // We join them with a newline (\n) so they are ready for NotebookLM
  const allUrls = readingLinks.map(link => link.url).join('\n');

  // --- PART 4: Return Everything ---
  return {
    sessionTitle: sessionTitle,
    links: readingLinks,
    allUrls: allUrls // <--- This is the new field
  };
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  
  // CHECK: Only let the Main Forum respond to "getReadings"
  if (request.action === "GET_READINGS" && window.location.hostname === "forum.minerva.edu") {
    console.log("Minerva LM: Fetching links from Main Forum...");
    
    // Your existing link-getting logic goes here
    const data = getReadings();
    
    // Send the data back to the popup
    sendResponse({  data: data });
    return true; // Keep channel open if async
  }
  
  // If we are in the Iframe, we ignore "GET_LINKS" so we don't interfere
});

const extractWorkbookContent = () => {
  // 1. Select ALL editors inside the blocks, not just the first one
  const selector = 'div[data-cy="block"] .ql-editor';
  const editorElements = document.querySelectorAll(selector);

  if (editorElements.length > 0) {
    // 2. Map over the elements to get their text and join them with newlines
    const fullText = Array.from(editorElements)
      .map(element => element.textContent?.trim()) // Extract and clean text
      .filter(text => text && text.length > 0)     // Remove empty blocks
      .join('\n\n----------------\n\n');           // Separator between blocks

    console.log("Found Workbook Content (All Blocks):", fullText);
    
    // 3. Save to chrome.storage
    chrome.storage.local.set({ workbookContent: fullText }, () => {
        console.log("Minerva LM: Workbook content saved successfully!");
        console.log(fullText); // Verify what was saved in the console
      });
  }
};

// Only run this logic if we are actually inside the collaboration iframe
if (window.location.hostname === "sle-collaboration.minervaproject.com") {
  console.log("Minerva LM: Injected into Collaboration Iframe");

  // 1. Try immediately in case it's already there
  extractWorkbookContent();

  // 2. Set up a MutationObserver to watch for when the content loads (React hydration)
  const observer = new MutationObserver(() => {
    // We check if the element exists now
    extractWorkbookContent();
  });

  // Start observing the document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
} 