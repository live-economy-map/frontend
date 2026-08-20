// src/components/map/MapSearchBar.tsx
import { useState } from 'react';
import { useMapSearch } from '@/hooks/useMap';

interface MapSearchBarProps {
  onResult: (cells: { cellId: string; compositeScore: number }[]) => void;
}

export default function MapSearchBar({ onResult }: MapSearchBarProps) {
  const [queryText, setQueryText] = useState('');
  const [notUnderstoodMessage, setNotUnderstoodMessage] = useState<string | null>(null);
  const { mutate, isPending, isError } = useMapSearch();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) return;
    setNotUnderstoodMessage(null);
    mutate(queryText, {
      onSuccess: (response) => {
        if (response.parsedFilters === null) {
          setNotUnderstoodMessage(
            "Couldn't understand that query — try rephrasing, e.g. 'areas near Bole with rising construction'"
          );
          return;
        }
        onResult(response.cells);
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface-container-lowest rounded-full px-space-md py-space-sm shadow-ambient border border-border-base flex items-center gap-2 w-64"
    >
      <span className="material-symbols-outlined text-sm text-text-muted">search</span>
      <input
        type="text"
        value={queryText}
        onChange={(e) => setQueryText(e.target.value)}
        placeholder="Search areas, city, or regions..."
        className="border-none bg-transparent focus:ring-0 text-body-sm w-full placeholder-text-muted outline-none"
        disabled={isPending}
      />
      {notUnderstoodMessage && (
        <span className="text-body-sm text-text-muted italic ml-2 whitespace-nowrap">
          {notUnderstoodMessage}
        </span>
      )}
      {isError && (
        <span className="text-body-sm text-[#E74F3D] ml-2 whitespace-nowrap" role="alert">
          Search is temporarily unavailable
        </span>
      )}
    </form>
  );
}
