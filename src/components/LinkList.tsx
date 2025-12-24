interface Link {
  title: string;
  url: string;
}

interface LinkListProps {
  sessionTitle: string | null;
  links: Link[];
  failedItems: string[]; // <--- Ensure this is passed
}

// Material Design 3 Inspired Colors for Categories
function getCategory(url: string) {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
    // Red-ish but muted
    return {
      name: "YouTube",
      color: "bg-[#F2B8B5]/10 text-[#F2B8B5] border-[#F2B8B5]/20",
    };
  }

  if (
    lowerUrl.includes("ebscohost") ||
    lowerUrl.includes("jstor") ||
    lowerUrl.includes("proquest") ||
    lowerUrl.includes("sciencedirect") ||
    lowerUrl.includes("oxford") ||
    lowerUrl.includes("groveart") ||
    lowerUrl.includes("sagepub") ||
    lowerUrl.includes("tandfonline")
  ) {
    // Muted Green
    return {
      name: "Library",
      color: "bg-[#C4EED0]/10 text-[#C4EED0] border-[#C4EED0]/20",
    };
  }

  if (
    lowerUrl.endsWith(".pdf") ||
    lowerUrl.includes("uploaded_files") ||
    lowerUrl.includes("drive.google")
  ) {
    // Muted Orange/Yellow
    return {
      name: "Upload",
      color: "bg-[#FDD663]/10 text-[#FDD663] border-[#FDD663]/20",
    };
  }

  // Google Blue
  return {
    name: "Web",
    color: "bg-[#A8C7FA]/10 text-[#A8C7FA] border-[#A8C7FA]/20",
  };
}

export function LinkList({ sessionTitle, links, failedItems = [] }: LinkListProps) {

  if (links.length === 0 && !sessionTitle) return null;

  // Helper to check for errors
  const isFailed = (link: Link) => {
    return failedItems.some(item => 
      item === link.url || item === link.title || link.url.includes(item)
    );
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
          const hasError = isFailed(link);

          // Dynamic Styles based on Error State
          const containerClasses = hasError
            ? "bg-red-900/20 border-red-500/50 hover:bg-red-900/40" // Error Style
            : "bg-[#2D2E30] hover:bg-[#353638] border-transparent hover:border-[#505153]"; // Normal Style

          const badgeClasses = hasError 
            ? "bg-red-500 text-white border-red-500" 
            : category.color;

          return (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full text-left group flex items-center gap-3 p-3 rounded-2xl transition-all border decoration-0 ${containerClasses}`}
              title={hasError ? "This source failed to upload" : link.url}
            >
              {/* Tag */}
              <span
                className={`shrink-0 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${badgeClasses}`}
              >
                {category.name}
              </span>

              {/* Title */}
              <span className={`text-sm leading-snug line-clamp-2 font-normal ${hasError ? "text-red-200" : "text-[#E3E3E3] group-hover:text-white"}`}>
                {link.title}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}