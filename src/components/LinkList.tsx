import { useState } from 'react';

interface Link {
  title: string;
  url: string;
}

interface LinkListProps {
  sessionTitle: string | null;
  links: Link[];
  allUrls?: string | null;
}

// Helper: Categorize the URL
function getCategory(url: string) {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return { name: 'YouTube', color: 'bg-red-500/20 text-red-200 border-red-500/50' };
  }
  
  if (
    lowerUrl.includes('ebscohost') || 
    lowerUrl.includes('jstor') || 
    lowerUrl.includes('proquest') || 
    lowerUrl.includes('sciencedirect') || 
    lowerUrl.includes('oxford') || 
    lowerUrl.includes('groveart') ||
    lowerUrl.includes('sagepub') || 
    lowerUrl.includes('tandfonline')
  ) {
    return { name: 'Library', color: 'bg-green-500/20 text-green-200 border-green-500/50' };
  }

  if (lowerUrl.endsWith('.pdf') || lowerUrl.includes('uploaded_files') || lowerUrl.includes('drive.google')) {
    return { name: 'Upload', color: 'bg-orange-500/20 text-orange-200 border-orange-500/50' };
  }

  return { name: 'Web', color: 'bg-blue-500/20 text-blue-200 border-blue-500/50' };
}

export function LinkList({ sessionTitle, links, allUrls }: LinkListProps) {
  const [isAllCopied, setIsAllCopied] = useState(false);

  if (links.length === 0 && !sessionTitle) return null;

  const handleCopyAll = () => {
    if (!allUrls) return;
    
    navigator.clipboard.writeText(allUrls);
    setIsAllCopied(true);
    
    setTimeout(() => {
      setIsAllCopied(false);
    }, 2000);
  };

  return (
    <div className="w-full flex flex-col gap-2 overflow-hidden">
      
      {sessionTitle && (
        <h2 className="text-md font-bold text-blue-300 border-b border-gray-600 pb-2 mb-2 leading-snug break-words">
          {sessionTitle}
        </h2>
      )}

      <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">
        Found {links.length} Readings
      </p>
      
      {/* Scrollable Link List */}
      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        {links.map((link, index) => {
          const category = getCategory(link.url);

          return (
            <a 
              key={index} 
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-left group flex items-start gap-3 p-3 bg-gray-700 rounded hover:bg-gray-600 transition-all border-l-4 border-transparent hover:border-blue-500 active:scale-[0.98] decoration-0"
              title="Open in new tab"
            >
              <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${category.color}`}>
                {category.name}
              </span>

              <span className="text-sm line-clamp-2 leading-snug text-gray-200 group-hover:text-white">
                {link.title}
              </span>
              
              <span className="ml-auto text-gray-500 group-hover:text-gray-300">↗</span>
            </a>
          );
        })}
      </div>

      {/* Separator and Copy Button Section */}
      {allUrls && (
        <>
          <div className="w-full h-px bg-gray-600/50 my-1" /> {/* The Divider */}
          
          <button
            onClick={handleCopyAll}
            className={`w-full py-2 px-3 rounded text-xs font-bold uppercase tracking-wide transition-all duration-200 border flex items-center justify-center gap-2
              ${isAllCopied 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' 
                : 'bg-blue-600 hover:bg-blue-500 text-white border-transparent'
              }`}
          >
            {isAllCopied ? (
              <>
                <span>✓ Copied to Clipboard</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span>Copy Sources for NotebookLM</span>
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
}