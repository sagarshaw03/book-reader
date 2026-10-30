import React, { useState } from 'react';
import {
  Menu,
  Library,
  BookOpen,
  Columns2,
  FileText,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  Palette,
  Upload,
} from 'lucide-react';
import { ReadingTheme, ViewMode } from '../types/book';
import { soundEngine } from '../services/soundService';

interface TopBarProps {
  onToggleSidebar: () => void;
  onOpenLibrary: () => void;
  bookTitle: string;
  currentTopicTitle?: string;
  theme: ReadingTheme;
  onThemeChange: (theme: ReadingTheme) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  booksCount: number;
  onQuickUpload: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleSidebar,
  onOpenLibrary,
  bookTitle,
  currentTopicTitle,
  theme,
  onThemeChange,
  viewMode,
  onViewModeChange,
  zoomLevel,
  onZoomChange,
  booksCount,
  onQuickUpload,
}) => {
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const toggleSound = () => {
    const nextState = soundEngine.toggleMuted();
    setIsMuted(nextState);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const themes: { id: ReadingTheme; name: string; bg: string; text: string }[] = [
    { id: 'cream', name: 'Cream Folio', bg: 'bg-[#fbf8ee]', text: 'text-stone-800' },
    { id: 'parchment', name: 'Parchment', bg: 'bg-[#f4ecd8]', text: 'text-stone-900' },
    { id: 'sepia', name: 'Cozy Sepia', bg: 'bg-[#f3e9d2]', text: 'text-amber-950' },
    { id: 'dark', name: 'Night Velvet', bg: 'bg-[#1e1e24]', text: 'text-stone-100' },
    { id: 'white', name: 'Clean White', bg: 'bg-white', text: 'text-stone-900' },
  ];

  return (
    <header className="relative z-30 h-14 bg-stone-900/95 border-b border-stone-800 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between text-stone-200">
      {/* Left controls: Sidebar toggle & Library button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          title="Chapters, Outline & Bookmarks"
          className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-800 hover:text-amber-400 text-stone-300 transition-colors flex items-center gap-2"
        >
          <Menu className="w-4 h-4" />
          <span className="text-xs font-medium hidden md:inline">Topics & Marks</span>
        </button>

        <button
          onClick={onOpenLibrary}
          title="Open Library & Bookshelf"
          className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-800 hover:text-amber-400 text-stone-300 transition-colors flex items-center gap-2 relative"
        >
          <Library className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-medium hidden sm:inline">Library</span>
          {booksCount > 1 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold flex items-center justify-center">
              {booksCount}
            </span>
          )}
        </button>
      </div>

      {/* Center: Book Title & Active Topic */}
      <div className="flex-1 max-w-md mx-3 text-center truncate">
        <h1 className="text-xs sm:text-sm font-serif font-semibold text-stone-100 truncate">
          {bookTitle || 'Folio Reader'}
        </h1>
        {currentTopicTitle && (
          <p className="text-[10px] text-amber-400/90 font-serif truncate">
            {currentTopicTitle}
          </p>
        )}
      </div>

      {/* Right controls: Theme, View Mode, Zoom, Audio, Fullscreen */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* View Mode Toggle: Single Page (Readable) vs Dual Page (Spread) */}
        <div className="flex items-center p-0.5 rounded-xl bg-stone-800/90 border border-stone-700/80 shadow-xs">
          <button
            onClick={() => onViewModeChange('single')}
            title="Single Page View (Large & High Readability)"
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'single'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-xs'
                : 'text-stone-300 hover:text-stone-100 hover:bg-stone-700/40'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">1 Page</span>
          </button>
          <button
            onClick={() => onViewModeChange('dual')}
            title="Dual-Page Spread (Open Hardcover View)"
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewMode === 'dual'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-xs'
                : 'text-stone-300 hover:text-stone-100 hover:bg-stone-700/40'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden sm:inline">2 Pages</span>
          </button>
        </div>

        {/* Theme Picker Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowThemePicker(!showThemePicker)}
            title="Paper & Reading Themes"
            className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-amber-400 transition-colors"
          >
            <Palette className="w-4 h-4" />
          </button>

          {showThemePicker && (
            <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-stone-900 border border-stone-700 shadow-xl p-2 space-y-1 z-50">
              <span className="text-[10px] uppercase font-bold text-stone-400 px-2 block mb-1">
                Reading Themes
              </span>
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onThemeChange(t.id);
                    setShowThemePicker(false);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    theme === t.id
                      ? 'bg-amber-500/20 text-amber-300 font-semibold'
                      : 'hover:bg-stone-800 text-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3.5 h-3.5 rounded-full border border-black/20 ${t.bg}`}
                    />
                    <span>{t.name}</span>
                  </div>
                  {theme === t.id && <span className="text-amber-400">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="hidden sm:flex items-center gap-0.5 bg-stone-800/80 p-0.5 rounded-xl border border-stone-700/60">
          <button
            onClick={() => onZoomChange(Math.max(0.6, Number((zoomLevel - 0.1).toFixed(2))))}
            title="Zoom Out"
            className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onZoomChange(1.0)}
            title="Reset Zoom to 100%"
            className="text-[10px] font-mono px-1.5 py-0.5 text-stone-300 hover:text-amber-400 transition-colors"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            onClick={() => onZoomChange(Math.min(1.6, Number((zoomLevel + 0.1).toFixed(2))))}
            title="Zoom In"
            className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Paper Sound Effect Toggle */}
        <button
          onClick={toggleSound}
          title={isMuted ? 'Unmute paper flip audio' : 'Mute paper flip audio'}
          className={`p-2 rounded-xl border transition-colors ${
            !isMuted
              ? 'bg-stone-800/80 border-stone-700 text-amber-400'
              : 'bg-stone-800/50 border-stone-800 text-stone-500 hover:text-stone-300'
          }`}
        >
          {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-white transition-colors hidden sm:flex"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        {/* Quick Upload button */}
        <button
          onClick={onQuickUpload}
          title="Upload new PDF book"
          className="p-2 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-stone-950 border border-amber-500/30 transition-all"
        >
          <Upload className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
