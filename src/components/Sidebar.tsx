import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ListTree,
  Bookmark as BookmarkIcon,
  LayoutGrid,
  Search,
  Volume2,
  VolumeX,
  Play,
  Square,
  X,
  Trash2,
  Check,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { TableOfContentItem, Bookmark } from '../types/book';
import { extractPageText } from '../services/pdfService';
import { soundEngine } from '../services/soundService';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  outline: TableOfContentItem[];
  currentPage: number;
  totalPages: number;
  onPageSelect: (pageNumber: number) => void;
  bookmarks: Bookmark[];
  onAddBookmark: (pageNumber: number, title: string, note: string, color: Bookmark['color']) => void;
  onDeleteBookmark: (id: string) => void;
  pdf: pdfjsLib.PDFDocumentProxy;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  outline,
  currentPage,
  totalPages,
  onPageSelect,
  bookmarks,
  onAddBookmark,
  onDeleteBookmark,
  pdf,
}) => {
  const [activeTab, setActiveTab] = useState<'outline' | 'bookmarks' | 'thumbnails' | 'search'>('outline');

  // Bookmark creation state
  const [newBmTitle, setNewBmTitle] = useState('');
  const [newBmNote, setNewBmNote] = useState('');
  const [newBmColor, setNewBmColor] = useState<Bookmark['color']>('crimson');
  const [isAddingBm, setIsAddingBm] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ pageNumber: number; snippet: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // TTS state
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [ttsRate, setTtsRate] = useState(1);
  const activeUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  // Find active topic from outline based on current page
  const findActiveTopic = (items: TableOfContentItem[], page: number): TableOfContentItem | null => {
    let candidate: TableOfContentItem | null = null;
    const traverse = (list: TableOfContentItem[]) => {
      for (const item of list) {
        if (item.pageNumber <= page) {
          if (!candidate || item.pageNumber >= candidate.pageNumber) {
            candidate = item;
          }
        }
        if (item.children) {
          traverse(item.children);
        }
      }
    };
    traverse(items);
    return candidate;
  };

  const activeTopic = findActiveTopic(outline, currentPage);

  // Handle Search execution across pages
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() || isSearching) return;

    setIsSearching(true);
    setSearchResults([]);

    const matches: { pageNumber: number; snippet: string }[] = [];
    const query = searchQuery.toLowerCase().trim();

    try {
      for (let p = 1; p <= totalPages; p++) {
        const text = await extractPageText(pdf, p);
        const lower = text.toLowerCase();
        const index = lower.indexOf(query);
        if (index !== -1) {
          const start = Math.max(0, index - 35);
          const end = Math.min(text.length, index + query.length + 50);
          const snippet = (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '');
          matches.push({ pageNumber: p, snippet });
          if (matches.length >= 25) break; // cap search results
        }
      }
      setSearchResults(matches);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // TTS Read Aloud for current page
  const startTTS = async () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    try {
      const text = await extractPageText(pdf, currentPage);
      if (!text || text.trim().length === 0) {
        alert('No readable text found on this page.');
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = ttsRate;
      utterance.onend = () => setIsPlayingTTS(false);
      utterance.onerror = () => setIsPlayingTTS(false);

      activeUtterance.current = utterance;
      setIsPlayingTTS(true);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsPlayingTTS(false);
    }
  };

  const stopTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingTTS(false);
  };

  // Clean up TTS on unmount or close
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCreateBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newBmTitle.trim() || `Bookmark Page ${currentPage}`;
    onAddBookmark(currentPage, title, newBmNote.trim(), newBmColor);
    soundEngine.playBookmarkChime();
    setNewBmTitle('');
    setNewBmNote('');
    setIsAddingBm(false);
  };

  const bookmarkColorBadges: Record<Bookmark['color'], string> = {
    crimson: 'bg-rose-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
    sapphire: 'bg-blue-500',
    violet: 'bg-purple-500',
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-84 sm:w-96 bg-stone-900 border-r border-stone-800 text-stone-200 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-stone-100 font-serif">
                Navigation & Folio
              </h2>
              <p className="text-[11px] text-stone-400">Chapters, Bookmarks & Tools</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
            aria-label="Close Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Topic Banner */}
        <div className="mx-4 mt-3 p-3 rounded-xl bg-amber-950/40 border border-amber-500/25 flex items-start gap-2.5">
          <div className="mt-0.5 p-1 rounded-md bg-amber-500/20 text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/90 block">
              Current Location in Book
            </span>
            <p className="text-xs font-serif font-medium text-amber-100 truncate">
              {activeTopic ? activeTopic.title : `Page ${currentPage} of ${totalPages}`}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.round((currentPage / totalPages) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-amber-300/80 font-mono">
                {Math.round((currentPage / totalPages) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 mt-3 flex items-center justify-between border-b border-stone-800 pb-2 gap-1">
          <button
            onClick={() => setActiveTab('outline')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'outline'
                ? 'bg-stone-800 text-amber-400 shadow-xs'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <ListTree className="w-3.5 h-3.5" />
            <span>Topics</span>
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors relative ${
              activeTab === 'bookmarks'
                ? 'bg-stone-800 text-rose-400 shadow-xs'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <BookmarkIcon className="w-3.5 h-3.5" />
            <span>Marks</span>
            {bookmarks.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                {bookmarks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('thumbnails')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'thumbnails'
                ? 'bg-stone-800 text-amber-400 shadow-xs'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Pages</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'search'
                ? 'bg-stone-800 text-amber-400 shadow-xs'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: OUTLINE / CHAPTERS */}
          {activeTab === 'outline' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-stone-400 uppercase tracking-wider mb-2 font-medium px-1">
                <span>Chapters & Sections</span>
                <span>Page</span>
              </div>

              {outline.length === 0 ? (
                <div className="p-4 text-center text-stone-500 text-xs">
                  No chapters found in this document.
                </div>
              ) : (
                outline.map((item) => {
                  const isActive = activeTopic?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onPageSelect(item.pageNumber)}
                      className={`w-full group text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-amber-500/15 border border-amber-500/40 text-amber-200'
                          : 'hover:bg-stone-800/80 text-stone-300 hover:text-stone-100 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? 'bg-amber-400 ring-4 ring-amber-400/20' : 'bg-stone-600 group-hover:bg-stone-400'
                          }`}
                        />
                        <span
                          className={`text-xs font-serif truncate ${
                            isActive ? 'font-semibold text-amber-200' : 'font-normal'
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
                          isActive
                            ? 'bg-amber-500/20 text-amber-300 font-semibold'
                            : 'text-stone-500 group-hover:text-stone-300 bg-stone-800/50'
                        }`}
                      >
                        {item.pageNumber}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: BOOKMARKS */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-4">
              {/* Add Bookmark form toggle */}
              {!isAddingBm ? (
                <button
                  onClick={() => setIsAddingBm(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 text-rose-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <BookmarkIcon className="w-3.5 h-3.5" />
                  <span>Bookmark Current Page ({currentPage})</span>
                </button>
              ) : (
                <form
                  onSubmit={handleCreateBookmark}
                  className="p-3 rounded-xl bg-stone-800/90 border border-stone-700 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-stone-200">
                      Bookmark Page {currentPage}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingBm(false)}
                      className="text-stone-400 hover:text-stone-200 text-xs"
                    >
                      Cancel
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Bookmark Title (optional)"
                    value={newBmTitle}
                    onChange={(e) => setNewBmTitle(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500 focus:outline-none focus:border-rose-500"
                  />

                  <textarea
                    placeholder="Personal notes or quote..."
                    rows={2}
                    value={newBmNote}
                    onChange={(e) => setNewBmNote(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500 focus:outline-none focus:border-rose-500"
                  />

                  {/* Ribbon color selection */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {(['crimson', 'amber', 'emerald', 'sapphire', 'violet'] as Bookmark['color'][]).map(
                        (col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setNewBmColor(col)}
                            className={`w-5 h-5 rounded-full ${bookmarkColorBadges[col]} flex items-center justify-center transition-transform ${
                              newBmColor === col ? 'scale-125 ring-2 ring-white/60' : 'opacity-70 hover:opacity-100'
                            }`}
                          >
                            {newBmColor === col && <Check className="w-3 h-3 text-white" />}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      type="submit"
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      Save Bookmark
                    </button>
                  </div>
                </form>
              )}

              {/* Bookmarks List */}
              <div className="space-y-2">
                {bookmarks.length === 0 ? (
                  <div className="p-6 text-center text-stone-500 text-xs space-y-1">
                    <BookmarkIcon className="w-8 h-8 mx-auto text-stone-600 mb-2 opacity-50" />
                    <p>No bookmarks saved yet.</p>
                    <p className="text-[11px] text-stone-600">
                      Click the ribbon on any page or use the button above.
                    </p>
                  </div>
                ) : (
                  bookmarks.map((bm) => (
                    <div
                      key={bm.id}
                      className="group p-3 rounded-xl bg-stone-800/60 hover:bg-stone-800 border border-stone-700/60 transition-all flex items-start justify-between gap-2"
                    >
                      <button
                        onClick={() => onPageSelect(bm.pageNumber)}
                        className="flex-1 text-left min-w-0"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${bookmarkColorBadges[bm.color]}`}
                          />
                          <span className="text-xs font-serif font-semibold text-stone-200 group-hover:text-amber-200 truncate">
                            {bm.title || `Page ${bm.pageNumber}`}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-700 text-stone-300 font-mono">
                            p. {bm.pageNumber}
                          </span>
                        </div>
                        {bm.note && (
                          <p className="text-[11px] text-stone-400 mt-1 line-clamp-2 italic">
                            "{bm.note}"
                          </p>
                        )}
                      </button>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onPageSelect(bm.pageNumber)}
                          title="Jump to page"
                          className="p-1 text-stone-400 hover:text-amber-300 hover:bg-stone-700 rounded transition-colors"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteBookmark(bm.id)}
                          title="Delete bookmark"
                          className="p-1 text-stone-400 hover:text-rose-400 hover:bg-stone-700 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: THUMBNAILS / PAGE GRID */}
          {activeTab === 'thumbnails' && (
            <div className="grid grid-cols-2 gap-2.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const isCur = p === currentPage;
                const hasBm = bookmarks.some((b) => b.pageNumber === p);
                return (
                  <button
                    key={p}
                    onClick={() => onPageSelect(p)}
                    className={`relative aspect-[1/1.4] rounded-lg border overflow-hidden flex flex-col items-center justify-center p-2 transition-all ${
                      isCur
                        ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/30'
                        : 'bg-stone-800/60 hover:bg-stone-800 border-stone-700'
                    }`}
                  >
                    {hasBm && (
                      <div className="absolute top-1 right-1">
                        <BookmarkIcon className="w-3 h-3 text-rose-500 fill-rose-500" />
                      </div>
                    )}
                    <span className="text-stone-400 text-xs font-serif font-medium">
                      Page
                    </span>
                    <span
                      className={`text-lg font-serif font-bold ${
                        isCur ? 'text-amber-300' : 'text-stone-200'
                      }`}
                    >
                      {p}
                    </span>
                    <div className="w-8 h-0.5 bg-stone-700 mt-1 rounded" />
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 4: SEARCH & TTS READ ALOUD */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              {/* Text to speech player */}
              <div className="p-3.5 rounded-xl bg-stone-800/80 border border-stone-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-medium text-stone-200">
                      Read Aloud Page {currentPage}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {ttsRate}x
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {!isPlayingTTS ? (
                    <button
                      onClick={startTTS}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-900 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-stone-900" />
                      <span>Listen to Page</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopTTS}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Square className="w-3.5 h-3.5 fill-white" />
                      <span>Stop Reading</span>
                    </button>
                  )}

                  <select
                    value={ttsRate}
                    onChange={(e) => setTtsRate(Number(e.target.value))}
                    className="text-xs bg-stone-900 border border-stone-700 rounded-lg px-2 py-1.5 text-stone-300 focus:outline-none"
                  >
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1.0x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                  </select>
                </div>
              </div>

              {/* PDF Keyword Search */}
              <form onSubmit={handleSearch} className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search keywords in book..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-8 pr-16 py-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-stone-950 font-medium text-[11px] rounded-lg transition-colors"
                  >
                    {isSearching ? '...' : 'Find'}
                  </button>
                </div>
              </form>

              {/* Search Results */}
              <div className="space-y-2">
                {searchResults.length > 0 && (
                  <p className="text-[11px] text-stone-400">
                    Found {searchResults.length} occurrences:
                  </p>
                )}
                {searchResults.map((res, idx) => (
                  <button
                    key={idx}
                    onClick={() => onPageSelect(res.pageNumber)}
                    className="w-full group text-left p-2.5 rounded-xl bg-stone-800/50 hover:bg-stone-800 border border-stone-700/60 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs text-amber-400 font-medium mb-1">
                      <span>Page {res.pageNumber}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[11px] text-stone-300 font-serif line-clamp-2">
                      {res.snippet}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
