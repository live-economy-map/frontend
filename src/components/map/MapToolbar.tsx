// src/components/map/MapToolbar.tsx
import { useState } from 'react';
import { useMapSearch } from '@/hooks/useMap';

interface MapToolbarProps {
  onSearchResult: (
    cells: { cellId: string; compositeScore: number }[],
    parsedFilters: { areaLabel?: string; period?: string; signalFocus?: string } | null
  ) => void;
}

export default function MapToolbar({ onSearchResult }: MapToolbarProps) {
  const [queryText, setQueryText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { mutate, isPending } = useMapSearch(); // ✅ Removed isError

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) return;
    const searchQuery = queryText;
    setQueryText('');
    mutate(searchQuery, {
      onSuccess: (response) => {
        if (response.parsedFilters === null) {
          showToast(
            "Couldn't understand that query — try rephrasing, e.g. 'areas near Bole with rising construction'"
          );
          return;
        }
        onSearchResult(response.cells, response.parsedFilters);
      },
    });
  };

  return (
    <>
      <div className="absolute top-space-lg left-space-lg z-30 bg-surface-container-lowest rounded-xl shadow-card border border-border-base px-space-lg py-space-md flex items-center gap-3 w-[400px]">
        <span className="material-symbols-outlined text-base text-text-muted">search</span>
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <input
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Search places, city, or regions... (Enter)"
            className="border-none bg-transparent focus:ring-0 text-body-md w-full placeholder-text-muted outline-none"
            disabled={isPending}
          />
        </form>
      </div>
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[99999] glass-panel rounded-xl shadow-card px-space-lg py-space-sm border border-[#F5A34A]/40 text-body-sm text-on-surface max-w-md text-center animate-in fade-in slide-in-from-top-4 duration-300">
          <span className="material-symbols-outlined text-[#F5A34A] text-sm inline-block mr-2 align-middle">
            info
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
