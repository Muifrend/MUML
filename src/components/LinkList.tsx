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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (links.length === 0 && !sessionTitle) return null;

  const handleClick = (url: string, index: number) => {
    const category = getCategory(url);

    // 1. If it's an Upload/PDF, open it in a new tab immediately
    if (category.name === 'Upload' || category.name === 'Library') {
      window.open(url, '_blank');
      return; // Stop here, do not copy
    }

    // 2. Otherwise, Copy to Clipboard
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 1500);
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
      
      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        {links.map((link, index) => {
          const category = getCategory(link.url);
          const isCopied = copiedIndex === index;

          return (
            <button 
              key={index} 
              onClick={() => handleClick(link.url, index)}
              className="w-full text-left group flex items-start gap-3 p-3 bg-gray-700 rounded hover:bg-gray-600 transition-all border-l-4 border-transparent hover:border-blue-500 active:scale-[0.98]" // (keep your existing classes)
              
              // UPDATE TOOLTIP: Check for Library here too
              title={(category.name === 'Upload' || category.name === 'Library') ? "Click to Open" : "Click to Copy URL"}
            >
              {isCopied ? (
                 <span className="shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded border bg-emerald-500 text-white border-emerald-400 animate-in fade-in zoom-in duration-200">
                   COPIED!
                 </span>
              ) : (
                <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${category.color}`}>
                  {category.name}
                </span>
              )}

              <span className={`text-sm line-clamp-2 leading-snug group-hover:text-white ${isCopied ? 'text-emerald-300' : 'text-gray-200'}`}>
                {link.title}
              </span>
              
              {(category.name === 'Upload' || category.name === 'Library') && (
                <span className="ml-auto text-gray-500 group-hover:text-gray-300">↗</span>
              )}
            </button>
          );
        })}
      </div>
      {allUrls && (
        <pre className="mt-4 p-2 bg-gray-900 text-xs rounded max-h-40 overflow-auto whitespace-pre-wrap break-words">
          {allUrls}
        </pre>
      )}
    </div>
  );
}