import { useState, useEffect } from "react"; // 1. Import useEffect
import { ErrorMessage } from "./components/ErrorMessage";
import { LinkList } from "./components/LinkList";

function App() {
  const [sessionTitle, setSessionTitle] = useState<string | null>(null);
  const [links, setLinks] = useState<{ title: string; url: string }[]>([]);
  const [allUrls, setAllUrls] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 2. LOAD DATA on Startup
  useEffect(() => {
    chrome.storage.local.get(["sessionTitle", "links", "allUrls"], (result) => {
      // FIX: Tell TypeScript exactly what this 'result' object contains
      const data = result as {
        sessionTitle?: string;
        links?: { title: string; url: string }[];
        allUrls?: string;
      };

      if (data.sessionTitle) {
        setSessionTitle(data.sessionTitle);
      }

      if (data.links) {
        setLinks(data.links);
      }

      if (data.allUrls) {
        setAllUrls(data.allUrls);
      }
    });
  }, []);

  const handleScrape = async () => {
    setErrorMessage(null);
    // Don't clear links immediately so the UI doesn't flash empty if we reload

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab.id) {
      chrome.tabs.sendMessage(
        tab.id,
        { action: "GET_READINGS" },
        (response) => {
          if (chrome.runtime.lastError) {
            setErrorMessage("Could not connect. Reload the page.");
            return;
          }

          if (response && response.data) {
            const newTitle = response.data.sessionTitle;
            const newLinks = response.data.links;
            const newAllUrls = response.data.allUrls;

            // Update State
            setSessionTitle(newTitle);
            setLinks(newLinks);
            setAllUrls(newAllUrls);

            // 3. SAVE DATA to Storage
            chrome.storage.local.set(
              {
                sessionTitle: newTitle,
                links: newLinks,
                allUrls: newAllUrls,
              },
              () => {
                console.log("Data saved to Chrome storage");
              }
            );

            if (newLinks.length === 0) {
              setErrorMessage("Found the session, but no readings.");
            }
          } else {
            setErrorMessage("No data found.");
          }
        }
      );
    } else {
      setErrorMessage("No active tab found.");
    }
  };

  // 4. Add a "Clear" button (Optional but helpful)
  const handleClear = () => {
    chrome.storage.local.clear(() => {
      setSessionTitle(null);
      setAllUrls(null);
      setLinks([]);
      setErrorMessage(null);
    });
  };

  return (
    <div className="w-[450px] p-6 bg-gray-800 text-white h-auto max-h-[600px] flex flex-col items-center overflow-hidden">
      <h1 className="text-2xl font-bold mb-6">Minerva LM</h1>

      <ErrorMessage message={errorMessage} />

      <div className="w-full flex gap-2 mb-6">
        <button
          onClick={handleScrape}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded transition"
        >
          Get Readings
        </button>

        {/* Only show Clear button if we have data */}
        {(links.length > 0 || sessionTitle) && (
          <button
            onClick={handleClear}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded transition"
            title="Clear saved data"
          >
            ✕
          </button>
        )}
      </div>

      <LinkList sessionTitle={sessionTitle} allUrls={allUrls} links={links} />
    </div>
  );
}

export default App;
