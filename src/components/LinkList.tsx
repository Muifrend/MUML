interface Link {
  title: string;
  url: string;
}

interface LinkListProps {
  sessionTitle: string | null;
  links: Link[];
}

// 1. Helper function to categorize links based on URL
function getCategory(url: string) {
  const lowerUrl = url.toLowerCase();

  // --- YOUTUBE ---
  if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
    return {
      name: "YouTube",
      color: "bg-red-500/20 text-red-200 border-red-500/50",
    };
  }

  // --- MINERVA LIBRARY RESOURCES ---
  // Covers: EBSCO, JSTOR, ScienceDirect, Oxford Handbooks/Art/Press
  if (
    lowerUrl.includes("ebscohost") ||
    lowerUrl.includes("jstor") ||
    lowerUrl.includes("proquest") ||
    lowerUrl.includes("sciencedirect") ||
    lowerUrl.includes("oxford") ||
    lowerUrl.includes("groveart") ||
    lowerUrl.includes("sagepub") || // Common academic publisher
    lowerUrl.includes("tandfonline") // Taylor & Francis
  ) {
    return {
      name: "MU Library",
      color: "bg-green-500/20 text-green-200 border-green-500/50",
    };
  }

  // --- UPLOADS / FILES ---
  // Matches PDFs or Minerva "uploaded_files" paths
  if (
    lowerUrl.endsWith(".pdf") ||
    lowerUrl.includes("uploaded_files") ||
    lowerUrl.includes("drive.google")
  ) {
    return {
      name: "Upload",
      color: "bg-orange-500/20 text-orange-200 border-orange-500/50",
    };
  }

  // --- DEFAULT ---
  return {
    name: "Web",
    color: "bg-blue-500/20 text-blue-200 border-blue-500/50",
  };
}

export function LinkList({ sessionTitle, links }: LinkListProps) {
  if (links.length === 0 && !sessionTitle) return null;

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
          // 2. Determine category for this specific link
          const category = getCategory(link.url);

          return (
            <a
              key={index}
              href={link.url}
              target="_blank"
              // Changed layout to 'flex' to align Badge and Title side-by-side
              className="group flex items-start gap-3 p-3 bg-gray-700 rounded hover:bg-gray-600 transition-colors border-l-4 border-transparent hover:border-blue-500"
              title={link.title}
            >
              {/* 3. The Category Badge */}
              <span
                className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${category.color}`}
              >
                {category.name}
              </span>

              {/* Title */}
              <span className="text-sm text-gray-200 line-clamp-2 leading-snug group-hover:text-white">
                {link.title}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
