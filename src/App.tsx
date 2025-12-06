import { useState, useEffect } from "react";
import { ErrorMessage } from "./components/ErrorMessage";
import { LinkList } from "./components/LinkList";

function App() {
  const [sessionTitle, setSessionTitle] = useState<string | null>(null);
  const [links, setLinks] = useState<{ title: string; url: string }[]>([]);
  const [allUrls, setAllUrls] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // LOAD DATA on Startup
  useEffect(() => {
    chrome.storage.local.get(["sessionTitle", "links", "allUrls"], (result) => {
      const data = result as {
        sessionTitle?: string;
        links?: { title: string; url: string }[];
        allUrls?: string;
      };

      if (data.sessionTitle) setSessionTitle(data.sessionTitle);
      if (data.links) setLinks(data.links);
      if (data.allUrls) setAllUrls(data.allUrls);
    });
  }, []);

  const handleScrape = async () => {
    setErrorMessage(null);
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: "GET_READINGS" }, (response) => {
        if (chrome.runtime.lastError) {
          setErrorMessage("Could not connect. Reload the page.");
          return;
        }

        if (response && response.data) {
          const newTitle = response.data.sessionTitle;
          const newLinks = response.data.links;
          const newAllUrls = response.data.allUrls;

          setSessionTitle(newTitle);
          setLinks(newLinks);
          setAllUrls(newAllUrls);

          chrome.storage.local.set({
            sessionTitle: newTitle,
            links: newLinks,
            allUrls: newAllUrls,
          });

          if (newLinks.length === 0) {
            setErrorMessage("Found the session, but no readings.");
          }
        } else {
          setErrorMessage("No data found.");
        }
      });
    } else {
      setErrorMessage("No active tab found.");
    }
  };

  const handleClear = () => {
    chrome.storage.local.clear(() => {
      setSessionTitle(null);
      setAllUrls(null);
      setLinks([]);
      setErrorMessage(null);
    });
  };

  return (
    // UPDATED: Main background color #1E1F20 and text #E3E3E3
    <div className="w-[400px] p-5 bg-[#22262b] text-[#E3E3E3] h-auto min-h-[200px] max-h-[600px] flex flex-col font-sans overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-medium tracking-tight">MinervaLM</h1>
        
        {/* Clear Button (Icon only style) */}
        {(links.length > 0 || sessionTitle) && (
          <button
            onClick={handleClear}
            className="p-2 rounded-full hover:bg-[#353638] text-zinc-400 hover:text-[#E3E3E3] transition-colors"
            title="Clear saved data"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
          </button>
        )}
      </div>

      <ErrorMessage message={errorMessage} />

      {/* Main Action Button */}
      <div className="w-full mb-4">
        <button
          onClick={handleScrape}
          // UPDATED: Material Design "Filled Tonal" button style
          // Pastel Blue background with Dark Blue text
          className="w-full bg-[#A8C7FA] hover:bg-[#8AB4F8] text-[#062E6F] font-medium py-3 px-6 rounded-full transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          Get Readings
        </button>
      </div>

      <LinkList sessionTitle={sessionTitle} allUrls={allUrls} links={links} />
    </div>
  );
}

export default App;