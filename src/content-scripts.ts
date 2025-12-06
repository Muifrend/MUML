function getPageData() {
  // --- PART 1: Get the Session Title ---
  // Based on your screenshot, the title is inside an <h1> within a <section class="lines">
  const titleElement = document.querySelector('section.lines h1 a');
  const sessionTitle = titleElement?.textContent?.trim() || "Unknown Session";

  // --- PART 2: Get the Readings (Existing Logic) ---
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

  // --- PART 3: Return Both ---
  return {
    sessionTitle: sessionTitle,
    links: readingLinks
  };
}

// Update the listener to send the full object
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "GET_READINGS") {
    const data = getPageData();
    sendResponse({ data: data }); // Note: We are sending { data: ... } now
  }
});