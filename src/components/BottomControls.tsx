import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark as BookmarkIcon,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Bookmark, ViewMode } from '../types/book';

interface BottomControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  bookmarks: Bookmark[];
  onToggleBookmark: (page: number) => void;
  viewMode: ViewMode;
}

export const BottomControls: React.FC<BottomControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  bookmarks,
  onToggleBookmark,
  viewMode,
}) => {
  const [inputVal, setInputVal] = useState(String(currentPage));

  useEffect(() => {
    setInputVal(String(currentPage));
  }, [currentPage]);

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(inputVal, 10);
    if (!isNaN(p)) {
      onPageChange(Math.max(1, Math.min(totalPages, p)));
    } else {
      setInputVal(String(currentPage));
    }
  };

  const isCurrentBookmarked = bookmarks.some((b) => b.pageNumber === currentPage);

  // In dual mode, show page spread like "Pages 4-5 of 84"
  const isDual = viewMode === 'dual';
  const displayPages =
    isDual && currentPage > 1 && currentPage < totalPages
      ? `${currentPage}-${Math.min(totalPages, currentPage + 1)}`
      : `${currentPage}`;

  return (
    <footer className="relative z-30 h-16 bg-stone-900/95 border-t border-stone-800 backdrop-blur-md px-4 flex items-center justify-between gap-3 text-stone-200">
      {/* Quick Jump Beginning & Prev */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          title="Jump to beginning (Page 1)"
          className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          title="Previous Page"
          className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Middle: Interactive Slider & Scrubber */}
      <div className="flex-1 max-w-2xl flex items-center gap-3">
        <input
          type="range"
          min={1}
          max={totalPages || 1}
          value={currentPage}
          onChange={(e) => onPageChange(Number(e.target.value))}
          className="flex-1 h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
        />

        {/* Page Input Form */}
        <form onSubmit={handleInputSubmit} className="flex items-center gap-1.5 flex-shrink-0">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onBlur={() => setInputVal(String(currentPage))}
            className="w-12 text-center text-xs font-mono py-1 bg-stone-800 border border-stone-700 rounded-lg text-amber-300 focus:outline-none focus:border-amber-500"
          />
          <span className="text-xs text-stone-400 font-serif">
            / {totalPages}
          </span>
        </form>
      </div>

      {/* Right: Quick Bookmark & Next & Jump End */}
      <div className="flex items-center gap-1.5">
        {/* Bookmark Ribbon Toggle */}
        <button
          onClick={() => onToggleBookmark(currentPage)}
          title={isCurrentBookmarked ? 'Remove bookmark' : 'Bookmark this page'}
          className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 ${
            isCurrentBookmarked
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-400'
              : 'bg-stone-800/80 border-stone-700/60 text-stone-400 hover:text-stone-200'
          }`}
        >
          <BookmarkIcon
            className={`w-4 h-4 ${isCurrentBookmarked ? 'fill-rose-500 text-rose-500' : ''}`}
          />
          <span className="text-xs font-medium hidden sm:inline">
            {isCurrentBookmarked ? 'Marked' : 'Bookmark'}
          </span>
        </button>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          title="Next Page"
          className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          title="Jump to end"
          className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
};
