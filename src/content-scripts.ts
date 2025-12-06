function getPageData() {
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

// (The listener remains the same)
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "GET_READINGS") {
    const data = getPageData();
    sendResponse({ data: data });
  }
});