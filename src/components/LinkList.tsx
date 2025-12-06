interface Link {
  title: string;
  url: string;
}

interface LinkListProps {
  sessionTitle: string | null; // New Prop
  links: Link[];
}

export function LinkList({ sessionTitle, links }: LinkListProps) {
  if (links.length === 0 && !sessionTitle) return null;

  return (
    <div className="w-full flex flex-col gap-2">
      {sessionTitle && (
        <h2 className="text-md font-bold text-blue-300 border-b border-gray-600 pb-2 mb-2 leading-snug break-words">
          {sessionTitle}
        </h2>
      )}
      <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">
        Found {links.length} Links
      </p>
      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
      {links.map((link, index) => (
        <a 
          key={index} 
          href={link.url} 
          target="_blank" 
          className="block p-3 bg-gray-700 rounded hover:bg-gray-600 text-sm truncate transition-colors border-l-4 border-blue-500"
          title={link.title}
        >
          <span className="line-clamp-2">{link.title}</span>
        </a>
      ))}
      </div>
    </div>
  );
}