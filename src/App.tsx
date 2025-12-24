import { useState, useEffect } from "react";
import { ErrorMessage } from "./components/ErrorMessage";
import { LinkList } from "./components/LinkList";
import { Button } from "./components/Button";

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

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    // 1. VALIDATION CHECK: Ensure we are on the correct URL
    if (tab.url) {
      // Regex pattern: matches forum.minerva.edu followed by the specific path structure
      // [^/]+ acts as the wildcard (*) for the IDs
      const isClassPage =
        /^https:\/\/forum\.minerva\.edu\/app\/courses\/[^/]+\/sections\/[^/]+\/classes\/[^/]+/.test(
          tab.url
        );

      if (!isClassPage) {
        setErrorMessage("You are not on a class page.");
        return; // Stop here, do not try to scrape
      }
    }

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
        }
      );
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
  const [isAllCopied, setIsAllCopied] = useState(false);
  const handleCopyAll = () => {
    if (!allUrls) return;
    navigator.clipboard.writeText(allUrls);
    setIsAllCopied(true);
    setTimeout(() => setIsAllCopied(false), 2000);
  };

  return (
    // UPDATED: Main background color #1E1F20 and text #E3E3E3
    <div className=" p-5 bg-[#22262b] w-[320px] max-h-[600px] text-[#E3E3E3]  flex flex-col font-sans overflow-hidden">
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="M6 6 18 18" />
            </svg>
          </button>
        )}
      </div>

      <ErrorMessage message={errorMessage} />

      {/* Main Action Button */}
      <div className="w-full mb-4">
        <Button
          onClick={handleScrape}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
          }
        >
          Get Readings
        </Button>
      </div>

      <LinkList sessionTitle={sessionTitle} links={links} />

      {allUrls && (
        <div className="mt-2 pt-2 border-t border-zinc-800">
          <Button
            onClick={handleCopyAll}
            variant={isAllCopied ? "success" : "primary"}
            icon={
              isAllCopied ? (
                // Success Icon (Checkmark)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                // Copy Icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              )
            }
          >
            {isAllCopied ? "Copied!" : "Copy Sources for NotebookLM"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default App;
