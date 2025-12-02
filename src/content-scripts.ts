function getReadingLinks() {
  // 1. Find the specific "Readings" header
  // The HTML shows <h3>Readings</h3> inside a generic <div>
  const allHeaders = Array.from(document.querySelectorAll('h3'));
  const readingsHeader = allHeaders.find(h => h.textContent?.trim() === "Readings");

  if (!readingsHeader) {
    console.warn("Minerva Extension: 'Readings' header not found on this page.");
    return [];
  }

  // 2. Locate the container holding the links
  // Based on your HTML: 
  // Parent 1: <div> <h3>Readings</h3> </div>
  // Sibling 1: <div> <ul>...</ul> <blockquote>...</blockquote> </div>
  
  // We go up to the header's parent div, then look for the next sibling element.
  const headerContainer = readingsHeader.parentElement;
  const linksContainer = headerContainer?.nextElementSibling;

  if (!linksContainer) {
    console.warn("Minerva Extension: Could not find the container following the Readings header.");
    return [];
  }

  // 3. Extract all links from that specific container
  // We use the container scope so we don't accidentally grab links from the footer or sidebar
  const linkElements = Array.from(linksContainer.querySelectorAll('a'));

  const results = linkElements
    .filter(link => {
      // Filter out internal/empty links if necessary
      return link.href && !link.href.startsWith('javascript:');
    })
    .map(link => ({
      title: link.innerText.trim() || link.href, // Fallback to URL if text is empty
      url: link.href
    }));

  return results;
}

// Listen for messages from the Popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  
  // 1. Check if the message is the one we are expecting
  if (request.action === "GET_READINGS") {
    
    console.log("Minerva Extension: Received request to get readings.");
    
    // 2. Run the scraping function we wrote earlier
    const data = getReadingLinks();
    
    // 3. Send the result back to the React App
    sendResponse({ links: data });
  }
  
  // Optional: Return true if you plan to make this asynchronous later
  // (e.g., if you were fetching data from an API instead of just reading the DOM)
  // return true; 
});