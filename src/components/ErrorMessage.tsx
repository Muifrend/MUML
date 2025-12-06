interface ErrorMessageProps {
  message: string | null;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="w-full flex items-center gap-3 bg-[#F2B8B5]/10 border border-[#F2B8B5]/20 text-[#F2B8B5] px-4 py-3 rounded-xl mb-4 text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-200">
      {/* Material Design Error Icon */}
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
      
      <span className="leading-snug">
        {message}
      </span>
    </div>
  );
}