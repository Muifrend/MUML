interface ErrorMessageProps {
  message: string | null;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="w-full bg-red-500/10 border border-red-500 text-red-200 px-4 py-3 rounded mb-4 text-sm text-center animate-in fade-in slide-in-from-top-1 duration-200">
      {message}
    </div>
  );
}