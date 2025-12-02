import { useState } from 'react';
import { ErrorMessage } from './components/ErrorMessage.tsx';
import { LinkList } from './components/LinkList.tsx';

function App() {
  const [links, setLinks] = useState<{title: string, url: string}[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleScrape = async () => {
    setErrorMessage(null);
    setLinks([]);

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: "GET_READINGS" }, (response) => {
        if (chrome.runtime.lastError) {
          setErrorMessage("Could not connect. Reload the page.");
          return;
        }

        if (response?.links?.length > 0) {
          setLinks(response.links);
        } else {
          setErrorMessage("No readings found.");
        }
      });
    } else {
      setErrorMessage("No active tab found.");
    }
  };

  return (
    <div className="w-[400px] p-6 bg-gray-800 text-white min-h-[300px] flex flex-col items-center">

      <h1 className="text-2xl font-bold mb-6">Minerva Scraper</h1>

      {/* Component 1: Handles the error UI */}
      <ErrorMessage message={errorMessage} />
      
      <button 
        onClick={handleScrape}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded transition mb-6"
      >
        Get Readings
      </button>

      {/* Component 2: Handles the list UI */}
      <LinkList links={links} />
      
    </div>
  );
}

export default App;