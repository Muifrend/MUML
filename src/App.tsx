import { useState, useEffect } from "react";
import { ErrorMessage } from "./components/ErrorMessage";
import { LinkList } from "./components/LinkList";
import { Button } from "./components/Button";

function App() {
  const [sessionTitle, setSessionTitle] = useState<string | null>(null);
  const [links, setLinks] = useState<{ title: string; url: string }[]>([]);
  const [allUrls, setAllUrls] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [workbookContent, setWorkbookContent] = useState<string | null>(null);

  // Button State toggles
  const [isAllCopied, setIsAllCopied] = useState(false);
  const [isWorkbookCopied, setIsWorkbookCopied] = useState(false);

  // LOAD DATA & START LISTENING
  useEffect(() => {
    // 1. Initial Fetch (Get data if it's already there)
    chrome.storage.local.get(
      ["sessionTitle", "links", "allUrls", "workbookContent"],
      (result) => {
        const data = result as {
          sessionTitle?: string;
          links?: { title: string; url: string }[];
          allUrls?: string;
          workbookContent?: string;
        };

        if (data.sessionTitle) setSessionTitle(data.sessionTitle);
        if (data.links) setLinks(data.links);
        if (data.allUrls) setAllUrls(data.allUrls);
        if (data.workbookContent && data.workbookContent.length > 0)
          setWorkbookContent(data.workbookContent);
      }
    );

    // 2. LIVE LISTENER (Crucial Fix: Updates UI when data arrives)
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      
      // Helper: reducing repetition for the 3 string fields
      const updateString = (key: string, setter: (val: string | null) => void) => {
        if (changes[key]) {
          const val = changes[key].newValue;
          setter(typeof val === "string" ? val : null);
        }
      };

      // Apply updates
      updateString("workbookContent", setWorkbookContent);
      updateString("allUrls", setAllUrls);
      updateString("sessionTitle", setSessionTitle);

      // Handle Links separately (using our clean type guard)
      if (changes.links) {
        const val = changes.links.newValue;
        setLinks(isValidLinkArray(val) ? val : []);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    // Cleanup
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const handleScrape = async () => {
    setErrorMessage(null);

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    // 1. VALIDATION CHECK
    if (tab.url) {
      const isClassPage =
        /^https:\/\/forum\.minerva\.edu\/app\/courses\/[^/]+\/sections\/[^/]+\/classes\/[^/]+/.test(
          tab.url
        );

      if (!isClassPage) {
        setErrorMessage("You are not on a class page.");
        return;
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
      setWorkbookContent(null);
    });
  };

  const handleCopyAll = () => {
    if (!allUrls) return;
    navigator.clipboard.writeText(allUrls);
    setIsAllCopied(true);
    setTimeout(() => setIsAllCopied(false), 2000);
  };

  const handleCopyWorkbook = () => {
    if (workbookContent) {
      navigator.clipboard.writeText(workbookContent).then(() => {
        setIsWorkbookCopied(true);
        setTimeout(() => setIsWorkbookCopied(false), 2000);
      });
    }
  };

  return (
    <div className="p-5 bg-[#22262b] w-[320px] max-h-[600px] text-[#E3E3E3] flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-medium tracking-tight">MinervaLM</h1>

        {/* Clear Button */}
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

      {/* RESULTS SECTION */}
      {allUrls && (
        <div className="mt-2 pt-2 border-t border-zinc-700">
          <div className="w-full">
            <Button
              onClick={handleCopyAll}
              variant={isAllCopied ? "success" : "primary"}
              icon={
                isAllCopied ? (
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
                    <rect
                      x="9"
                      y="9"
                      width="13"
                      height="13"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                )
              }
            >
              {isAllCopied ? "Copied!" : "Copy Sources for NotebookLM"}
            </Button>
          </div>
          {workbookContent && (
            <div className="w-full mb-3 mt-2">
              <Button
                onClick={handleCopyWorkbook}
                variant={isWorkbookCopied ? "success" : "primary"}
                icon={
                  isWorkbookCopied ? (
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
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" x2="8" y1="13" y2="13" />
                      <line x1="16" x2="8" y1="17" y2="17" />
                      <line x1="10" x2="8" y1="9" y2="9" />
                    </svg>
                  )
                }
              >
                {isWorkbookCopied ? "Copied!" : "Copy Workbook Content"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const isValidLinkArray = (arr: unknown): arr is { title: string; url: string }[] => {
  return (
    Array.isArray(arr) &&
    arr.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof item.title === "string" &&
        typeof item.url === "string"
    )
  );
};

export default App;
