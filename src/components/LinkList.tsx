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

// Material Design 3 Inspired Colors for Categories
function getCategory(url: string) {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    // Red-ish but muted
    return { name: 'YouTube', color: 'bg-[#F2B8B5]/10 text-[#F2B8B5] border-[#F2B8B5]/20' };
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
    // Muted Green
    return { name: 'Library', color: 'bg-[#C4EED0]/10 text-[#C4EED0] border-[#C4EED0]/20' };
  }

  if (lowerUrl.endsWith('.pdf') || lowerUrl.includes('uploaded_files') || lowerUrl.includes('drive.google')) {
    // Muted Orange/Yellow
    return { name: 'Upload', color: 'bg-[#FDD663]/10 text-[#FDD663] border-[#FDD663]/20' };
  }

  // Google Blue
  return { name: 'Web', color: 'bg-[#A8C7FA]/10 text-[#A8C7FA] border-[#A8C7FA]/20' };
}

export function LinkList({ sessionTitle, links, allUrls }: LinkListProps) {
  const [isAllCopied, setIsAllCopied] = useState(false);

  if (links.length === 0 && !sessionTitle) return null;

  const handleCopyAll = () => {
    if (!allUrls) return;
    navigator.clipboard.writeText(allUrls);
    setIsAllCopied(true);
    setTimeout(() => setIsAllCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-3 overflow-hidden font-sans">
      
      {sessionTitle && (
        <div className="pb-2 mb-1 border-b border-zinc-700">
          <h2 className="text-sm font-medium text-[#E3E3E3] leading-snug break-words">
            {sessionTitle}
          </h2>
        </div>
      )}

      <div className="flex items-center justify-between">
         <p className="text-zinc-400 text-[11px] font-semibold tracking-wider uppercase">
          Found {links.length} Sources
        </p>
      </div>
      
      {/* Scrollable Link List */}
      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {links.map((link, index) => {
          const category = getCategory(link.url);

          return (
            <a 
              key={index} 
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              // Updated: Darker card background, lighter border, rounder corners (xl)
              className="w-full text-left group flex items-start gap-3 p-3 bg-[#2D2E30] hover:bg-[#353638] rounded-2xl transition-all border border-transparent hover:border-zinc-600 decoration-0"
              title="Open in new tab"
            >
              {/* Pill shaped tag */}
              <span className={`shrink-0 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${category.color}`}>
                {category.name}
              </span>

              <span className="text-sm text-[#E3E3E3] group-hover:text-white leading-snug line-clamp-2 font-normal">
                {link.title}
              </span>
            </a>
          );
        })}
      </div>

      {/* Copy Button - Material Design Style */}
      {allUrls && (
        <div className="mt-2 pt-2 border-t border-zinc-800">
          <button
            onClick={handleCopyAll}
            // Updated: Rounded-full (Pill), Google Blue colors
            className={`w-full py-3 px-4 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-md
              ${isAllCopied 
                ? 'bg-[#C4EED0] text-[#0F5223]' 
                : 'bg-[#A8C7FA] hover:bg-[#8AB4F8] text-[#062E6F]'
              }`}
          >
            {isAllCopied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span>Copy Sources for NotebookLM</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}