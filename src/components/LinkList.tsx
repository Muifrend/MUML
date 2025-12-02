interface Link {
  title: string;
  url: string;
}

interface LinkListProps {
  links: Link[];
}

export function LinkList({ links }: LinkListProps) {
  if (links.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-2">
      <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">
        Found {links.length} Links
      </p>
      
      {links.map((link, index) => (
        <a 
          key={index} 
          href={link.url} 
          target="_blank" 
          className="block p-3 bg-gray-700 rounded hover:bg-gray-600 text-sm truncate transition-colors border-l-4 border-blue-500"
          title={link.title}
        >
          {link.title}
        </a>
      ))}
    </div>
  );
}