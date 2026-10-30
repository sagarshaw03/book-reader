import React from 'react';
import { BookOpen, Bookmark as BookmarkIcon, RotateCcw, X, Clock } from 'lucide-react';
import { BookMetadata } from '../types/book';

interface ResumeModalProps {
  book: BookMetadata;
  isOpen: boolean;
  onClose: () => void;
  onResumeLast: () => void;
  onJumpToBookmark: (page: number) => void;
  onStartBeginning: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({
  book,
  isOpen,
  onClose,
  onResumeLast,
  onJumpToBookmark,
  onStartBeginning,
}) => {
  if (!isOpen) return null;

  const latestBookmark =
    book.bookmarks && book.bookmarks.length > 0
      ? [...book.bookmarks].sort((a, b) => b.createdAt - a.createdAt)[0]
      : null;

  const progressPercent = Math.round((book.lastReadPage / book.totalPages) * 100);

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden text-stone-100">
        {/* Decorative spine accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-700" />

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-400/90 font-medium">
                  Welcome Back
                </span>
                <h3 className="text-xl font-serif font-bold text-stone-100 line-clamp-1">
                  {book.title}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-stone-400 mb-6">
            Where would you like to open your book today?
          </p>

          <div className="space-y-3">
            {/* Option 1: Resume from last read */}
            <button
              onClick={onResumeLast}
              className="w-full group text-left p-4 rounded-xl bg-stone-800/80 hover:bg-amber-950/40 border border-stone-700 hover:border-amber-500/40 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-amber-500/15 group-hover:bg-amber-500/25 text-amber-400 flex items-center justify-center transition-colors">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-stone-200 group-hover:text-amber-200 transition-colors flex items-center gap-2">
                    Resume Reading
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-normal">
                      Page {book.lastReadPage} of {book.totalPages}
                    </span>
                  </div>
                  <div className="text-xs text-stone-400 flex items-center gap-2 mt-0.5">
                    <span>{progressPercent}% completed</span>
                    <span>•</span>
                    <span>Read {formatRelativeTime(book.lastReadTimestamp)}</span>
                  </div>
                </div>
              </div>
              <span className="text-amber-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Continue →
              </span>
            </button>

            {/* Option 2: Jump to latest bookmark (if exists) */}
            {latestBookmark && (
              <button
                onClick={() => onJumpToBookmark(latestBookmark.pageNumber)}
                className="w-full group text-left p-4 rounded-xl bg-stone-800/80 hover:bg-rose-950/40 border border-stone-700 hover:border-rose-500/40 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-rose-500/15 group-hover:bg-rose-500/25 text-rose-400 flex items-center justify-center transition-colors">
                    <BookmarkIcon className="w-5 h-5 fill-rose-500/30" />
                  </div>
                  <div>
                    <div className="font-medium text-stone-200 group-hover:text-rose-200 transition-colors flex items-center gap-2">
                      Jump to Bookmark
                      <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-normal">
                        Page {latestBookmark.pageNumber}
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 line-clamp-1 mt-0.5">
                      {latestBookmark.title || latestBookmark.note || 'Saved bookmark'}
                    </div>
                  </div>
                </div>
                <span className="text-rose-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                  Jump →
                </span>
              </button>
            )}

            {/* Option 3: Start from beginning */}
            <button
              onClick={onStartBeginning}
              className="w-full group text-left p-3.5 rounded-xl bg-stone-800/40 hover:bg-stone-800 border border-stone-800 hover:border-stone-700 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-stone-700/50 text-stone-400 group-hover:text-stone-300 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-stone-300 group-hover:text-stone-100">
                    Start from Beginning
                  </div>
                  <div className="text-xs text-stone-500">
                    Open at the title page (Page 1)
                  </div>
                </div>
              </div>
              <span className="text-stone-400 text-sm group-hover:text-stone-200">
                Page 1
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
