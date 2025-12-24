
interface Link {
  title: string;
  url: string;
}

interface LinkListProps {
  sessionTitle: string | null;
  links: Link[];
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

export function LinkList({ sessionTitle, links }: LinkListProps) {

  if (links.length === 0 && !sessionTitle) return null;

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
              // FIX 1: Changed 'items-start' to 'items-center' to center the tag vertically
              // FIX 2: Removed 'justify-center' so content aligns left properly
              className="w-full text-left group flex items-center gap-3 p-3 bg-[#2D2E30] hover:bg-[#353638] rounded-2xl transition-all border border-transparent hover:border-[#505153] decoration-0"
              title="Open in new tab"
            >
              {/* Tag */}
              <span
                className={`shrink-0 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${category.color}`}
              >
                {category.name}
              </span>

              {/* Title */}
              <span className="text-sm text-[#E3E3E3] group-hover:text-white leading-snug line-clamp-2 font-normal">
                {link.title}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
