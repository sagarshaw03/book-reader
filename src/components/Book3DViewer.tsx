import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ChevronLeft, ChevronRight, Bookmark as BookmarkIcon, Plus } from 'lucide-react';
import { Bookmark, ReadingTheme, ViewMode } from '../types/book';
import { renderPageToCanvas } from '../services/pdfService';
import { soundEngine } from '../services/soundService';

interface Book3DViewerProps {
  pdf: pdfjsLib.PDFDocumentProxy;
  totalPages: number;
  currentPage: number;
  onPageChange: (newPage: number) => void;
  bookmarks: Bookmark[];
  onToggleBookmark: (pageNumber: number) => void;
  theme: ReadingTheme;
  viewMode: ViewMode;
  zoomLevel: number;
}

export const Book3DViewer: React.FC<Book3DViewerProps> = ({
  pdf,
  totalPages,
  currentPage,
  onPageChange,
  bookmarks,
  onToggleBookmark,
  theme,
  viewMode,
  zoomLevel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'forward' | 'backward' | null>(null);

  // Cached page canvas renders as data URLs for fast flipping
  const pageCache = useRef<Map<number, string>>(new Map());
  const [renderNonce, setRenderNonce] = useState(0);

  // Canvas element refs for active pages
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const singleCanvasRef = useRef<HTMLCanvasElement>(null);
  const flipFrontCanvasRef = useRef<HTMLCanvasElement>(null);
  const flipBackCanvasRef = useRef<HTMLCanvasElement>(null);

  // Responsive single/dual view detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 820);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isDual = viewMode === 'dual' ? true : viewMode === 'single' ? false : !isMobile;

  // In dual mode:
  // Spread calculation:
  // Page 1 is on the right side alone (or cover). Left is empty/cover back.
  // Then Page 2 & 3, Page 4 & 5, etc.
  const leftPageNum = isDual
    ? currentPage === 1
      ? 0 // Cover / blank on left
      : currentPage % 2 === 0
      ? currentPage
      : currentPage - 1
    : currentPage;

  const rightPageNum = isDual
    ? currentPage === 1
      ? 1
      : leftPageNum + 1 <= totalPages
      ? leftPageNum + 1
      : 0
    : 0;

  // Touch swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Check bookmarks for visible pages
  const leftBookmark = bookmarks.find((b) => b.pageNumber === leftPageNum);
  const rightBookmark = bookmarks.find((b) => b.pageNumber === rightPageNum);
  const singleBookmark = bookmarks.find((b) => b.pageNumber === currentPage);

  // Helper to fetch/render page to dataURL
  const getPageDataUrl = useCallback(
    async (pageNo: number, targetWidth = 900): Promise<string> => {
      if (pageNo < 1 || pageNo > totalPages) return '';
      if (pageCache.current.has(pageNo)) {
        return pageCache.current.get(pageNo)!;
      }
      try {
        const offscreen = document.createElement('canvas');
        await renderPageToCanvas(pdf, pageNo, offscreen, targetWidth);
        const url = offscreen.toDataURL('image/jpeg', 0.88);
        pageCache.current.set(pageNo, url);
        return url;
      } catch (err) {
        console.error('Error rendering page:', pageNo, err);
        return '';
      }
    },
    [pdf, totalPages]
  );

  // Render visible pages whenever page, viewMode, or pdf changes
  useEffect(() => {
    let isCancelled = false;

    const renderActivePages = async () => {
      if (isDual) {
        if (leftPageNum >= 1 && leftCanvasRef.current) {
          try {
            await renderPageToCanvas(pdf, leftPageNum, leftCanvasRef.current, 900);
          } catch {
            // handle error
          }
        }
        if (rightPageNum >= 1 && rightCanvasRef.current) {
          try {
            await renderPageToCanvas(pdf, rightPageNum, rightCanvasRef.current, 900);
          } catch {
            // handle error
          }
        }
      } else {
        if (singleCanvasRef.current && currentPage >= 1 && currentPage <= totalPages) {
          try {
            await renderPageToCanvas(pdf, currentPage, singleCanvasRef.current, 1600);
          } catch {
            // handle error
          }
        }
      }

      if (!isCancelled) {
        setRenderNonce((n) => n + 1);
      }

      // Pre-cache neighboring pages for instant turns
      const toPrecache = isDual
        ? [leftPageNum - 2, leftPageNum - 1, rightPageNum + 1, rightPageNum + 2]
        : [currentPage - 1, currentPage + 1];
      toPrecache.forEach((p) => {
        if (p >= 1 && p <= totalPages && !pageCache.current.has(p)) {
          getPageDataUrl(p, 900);
        }
      });
    };

    renderActivePages();
    return () => {
      isCancelled = true;
    };
  }, [currentPage, isDual, leftPageNum, rightPageNum, pdf, totalPages, getPageDataUrl]);

  // Turn page action with 3D animation and realistic audio
  const handleTurnPage = useCallback(
    async (direction: 'forward' | 'backward') => {
      if (isFlipping) return;

      const step = isDual ? (currentPage === 1 && direction === 'forward' ? 1 : 2) : 1;
      const targetPage =
        direction === 'forward'
          ? Math.min(totalPages, currentPage + step)
          : Math.max(1, currentPage - (isDual && currentPage === 2 ? 1 : step));

      if (targetPage === currentPage) return;

      // Play paper rustle sound
      soundEngine.playPageTurn(direction === 'backward');

      setIsFlipping(true);
      setFlipDirection(direction);

      // Render flipper canvas faces
      if (direction === 'forward') {
        const frontPage = isDual ? rightPageNum : currentPage;
        const backPage = isDual ? rightPageNum + 1 : currentPage + 1;

        if (flipFrontCanvasRef.current && frontPage >= 1 && frontPage <= totalPages) {
          await renderPageToCanvas(pdf, frontPage, flipFrontCanvasRef.current, 900);
        }
        if (flipBackCanvasRef.current && backPage >= 1 && backPage <= totalPages) {
          await renderPageToCanvas(pdf, backPage, flipBackCanvasRef.current, 900);
        }
      } else {
        const frontPage = isDual ? leftPageNum - 1 : currentPage - 1;
        const backPage = isDual ? leftPageNum : currentPage;

        if (flipBackCanvasRef.current && backPage >= 1 && backPage <= totalPages) {
          await renderPageToCanvas(pdf, backPage, flipBackCanvasRef.current, 900);
        }
        if (flipFrontCanvasRef.current && frontPage >= 1 && frontPage <= totalPages) {
          await renderPageToCanvas(pdf, frontPage, flipFrontCanvasRef.current, 900);
        }
      }

      // Finish flip after animation duration
      setTimeout(() => {
        onPageChange(targetPage);
        setIsFlipping(false);
        setFlipDirection(null);
      }, 520);
    },
    [isFlipping, isDual, currentPage, totalPages, onPageChange, rightPageNum, leftPageNum, pdf]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'l') {
        e.preventDefault();
        handleTurnPage('forward');
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'h') {
        e.preventDefault();
        handleTurnPage('backward');
      } else if (e.key === 'Home') {
        e.preventDefault();
        onPageChange(1);
      } else if (e.key === 'End') {
        e.preventDefault();
        onPageChange(totalPages);
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        onToggleBookmark(currentPage);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTurnPage, onPageChange, onToggleBookmark, currentPage, totalPages]);

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    // Minimum swipe threshold and ensure more horizontal than vertical
    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        handleTurnPage('forward');
      } else {
        handleTurnPage('backward');
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Theme styling definitions
  const themeClasses: Record<ReadingTheme, { bg: string; bookCover: string; paper: string; text: string }> = {
    cream: {
      bg: 'bg-stone-900',
      bookCover: 'bg-[#3b2416] border-[#5a3824]',
      paper: 'paper-cream',
      text: 'text-stone-800',
    },
    parchment: {
      bg: 'bg-amber-950/90',
      bookCover: 'bg-[#2b1810] border-[#4a2e1d]',
      paper: 'paper-parchment',
      text: 'text-stone-900',
    },
    sepia: {
      bg: 'bg-[#2a221b]',
      bookCover: 'bg-[#1e1713] border-[#382b22]',
      paper: 'paper-sepia',
      text: 'text-amber-950',
    },
    dark: {
      bg: 'bg-[#0f0f12]',
      bookCover: 'bg-[#18181f] border-[#292934]',
      paper: 'paper-dark',
      text: 'text-stone-200',
    },
    white: {
      bg: 'bg-stone-800',
      bookCover: 'bg-[#2d3139] border-[#414752]',
      paper: 'bg-white',
      text: 'text-gray-900',
    },
  };

  const currentTheme = themeClasses[theme] || themeClasses.cream;

  // Ribbon Bookmark Color mapping
  const getRibbonColor = (b?: Bookmark) => {
    if (!b) return 'bg-amber-600';
    switch (b.color) {
      case 'emerald':
        return 'bg-emerald-600';
      case 'sapphire':
        return 'bg-blue-600';
      case 'violet':
        return 'bg-purple-600';
      case 'amber':
        return 'bg-amber-500';
      default:
        return 'bg-rose-600';
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden transition-colors duration-300 p-2 sm:p-6 ${currentTheme.bg}`}
    >
      {/* Zoom transform container */}
      <div
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center',
          transition: 'transform 0.25s ease-out',
        }}
        className="relative max-w-full max-h-[88vh] flex items-center justify-center"
      >
        {isDual ? (
          /* =========================================================
             DUAL PAGE SPREAD (Hardcover open book aesthetic)
             ========================================================= */
          <div className="relative flex items-center justify-center perspective-1800">
            {/* Outer Book Binding / Cover Edge Background */}
            <div
              className={`relative flex rounded-xl border-4 book-shadow-3d p-2 sm:p-3 transition-colors ${currentTheme.bookCover}`}
              style={{
                boxShadow:
                  '0 25px 60px -15px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255,255,255,0.05), inset 0 2px 4px rgba(255,255,255,0.1)',
              }}
            >
              {/* Stacked leaves edge effect - left */}
              <div className="absolute left-1 top-3 bottom-3 w-1.5 page-edge-layers-left rounded-l-sm pointer-events-none opacity-80" />

              {/* Stacked leaves edge effect - right */}
              <div className="absolute right-1 top-3 bottom-3 w-1.5 page-edge-layers-right rounded-r-sm pointer-events-none opacity-80" />

              {/* Main Book Pages Spread */}
              <div className="relative flex overflow-hidden rounded-md preserve-3d">
                {/* ----------------- LEFT PAGE (VERSO) ----------------- */}
                <div
                  className={`relative w-[min(540px,46vw)] h-[calc(100vh-8.5rem)] max-h-[860px] aspect-[1/1.414] ${currentTheme.paper} flex flex-col justify-between overflow-hidden shadow-inner border-r border-stone-300/40`}
                >
                  {/* Left Bookmark Ribbon Tag */}
                  {leftPageNum > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(leftPageNum);
                      }}
                      title={leftBookmark ? `Bookmarked: ${leftBookmark.title || 'Page ' + leftPageNum}` : 'Bookmark this page'}
                      className={`absolute top-0 left-8 z-30 transition-all duration-300 hover:translate-y-1 ${
                        leftBookmark ? 'opacity-100' : 'opacity-20 hover:opacity-80'
                      }`}
                    >
                      <div
                        className={`w-6 sm:w-7 h-12 sm:h-14 ${getRibbonColor(
                          leftBookmark
                        )} shadow-md flex items-end justify-center pb-2 clip-ribbon transition-transform`}
                        style={{
                          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)',
                        }}
                      >
                        <BookmarkIcon className="w-3.5 h-3.5 text-white fill-white/80" />
                      </div>
                    </button>
                  )}

                  {/* Left Page Content Canvas */}
                  <div className="relative flex-1 w-full h-full flex items-center justify-center p-1 sm:p-2 overflow-hidden">
                    {leftPageNum > 0 ? (
                      <canvas
                        ref={leftCanvasRef}
                        className="w-full h-full object-contain filter contrast-[1.02]"
                      />
                    ) : (
                      /* Blank inside cover */
                      <div className="w-full h-full flex flex-col items-center justify-center text-stone-400/40 p-8 border border-dashed border-stone-300/30 rounded-lg">
                        <span className="font-serif italic text-sm tracking-wider">
                          Folio Interactive Edition
                        </span>
                      </div>
                    )}

                    {/* Spine Valley / Crease Shadow (Darkens toward right spine) */}
                    <div className="absolute inset-y-0 right-0 w-16 spine-shadow-left pointer-events-none" />

                    {/* Left Page Turn Corner Hover Cue */}
                    {leftPageNum > 1 && (
                      <div
                        onClick={() => handleTurnPage('backward')}
                        title="Click to turn to previous page"
                        className="absolute bottom-0 left-0 w-16 h-16 group cursor-pointer flex items-end justify-start p-2 z-20"
                      >
                        <div className="w-8 h-8 rounded-tr-xl bg-gradient-to-tr from-stone-400/20 to-transparent group-hover:scale-125 transition-transform flex items-center justify-center text-stone-500">
                          <ChevronLeft className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Left Page Footer Indicator */}
                  {leftPageNum > 0 && (
                    <div className="h-6 flex items-center justify-between px-6 text-[10px] sm:text-xs text-stone-400 font-serif border-t border-stone-200/30">
                      <span>{leftPageNum}</span>
                      <span className="opacity-60 hidden sm:inline">Folio Reader</span>
                    </div>
                  )}
                </div>

                {/* ----------------- CENTER BOOK SPINE ----------------- */}
                <div className="relative w-3.5 sm:w-5 bg-gradient-to-r from-stone-400/40 via-stone-800/40 to-stone-400/40 shadow-2xl z-20 flex flex-col items-center justify-between py-4">
                  {/* Spine thread stitch accents */}
                  <div className="w-0.5 h-full bg-black/30" />
                </div>

                {/* ----------------- RIGHT PAGE (RECTO) ----------------- */}
                <div
                  className={`relative w-[min(540px,46vw)] h-[calc(100vh-8.5rem)] max-h-[860px] aspect-[1/1.414] ${currentTheme.paper} flex flex-col justify-between overflow-hidden shadow-inner border-l border-stone-300/40`}
                >
                  {/* Right Bookmark Ribbon Tag */}
                  {rightPageNum > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(rightPageNum);
                      }}
                      title={rightBookmark ? `Bookmarked: ${rightBookmark.title || 'Page ' + rightPageNum}` : 'Bookmark this page'}
                      className={`absolute top-0 right-8 z-30 transition-all duration-300 hover:translate-y-1 ${
                        rightBookmark ? 'opacity-100' : 'opacity-20 hover:opacity-80'
                      }`}
                    >
                      <div
                        className={`w-6 sm:w-7 h-12 sm:h-14 ${getRibbonColor(
                          rightBookmark
                        )} shadow-md flex items-end justify-center pb-2 clip-ribbon transition-transform`}
                        style={{
                          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)',
                        }}
                      >
                        <BookmarkIcon className="w-3.5 h-3.5 text-white fill-white/80" />
                      </div>
                    </button>
                  )}

                  {/* Right Page Content Canvas */}
                  <div className="relative flex-1 w-full h-full flex items-center justify-center p-1 sm:p-2 overflow-hidden">
                    {rightPageNum > 0 ? (
                      <canvas
                        ref={rightCanvasRef}
                        className="w-full h-full object-contain filter contrast-[1.02]"
                      />
                    ) : (
                      /* Blank end page */
                      <div className="w-full h-full flex flex-col items-center justify-center text-stone-400/40 p-8 border border-dashed border-stone-300/30 rounded-lg">
                        <span className="font-serif italic text-sm tracking-wider">
                          End of Book
                        </span>
                      </div>
                    )}

                    {/* Spine Valley / Crease Shadow (Darkens toward left spine) */}
                    <div className="absolute inset-y-0 left-0 w-16 spine-shadow-right pointer-events-none" />

                    {/* Right Page Turn Corner Hover Cue */}
                    {rightPageNum > 0 && rightPageNum < totalPages && (
                      <div
                        onClick={() => handleTurnPage('forward')}
                        title="Click to turn to next page"
                        className="absolute bottom-0 right-0 w-16 h-16 group cursor-pointer flex items-end justify-end p-2 z-20"
                      >
                        <div className="w-8 h-8 rounded-tl-xl bg-gradient-to-tl from-stone-400/20 to-transparent group-hover:scale-125 transition-transform flex items-center justify-center text-stone-500">
                          <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Page Footer Indicator */}
                  {rightPageNum > 0 && (
                    <div className="h-6 flex items-center justify-between px-6 text-[10px] sm:text-xs text-stone-400 font-serif border-t border-stone-200/30">
                      <span className="opacity-60 hidden sm:inline">Folio Reader</span>
                      <span>{rightPageNum}</span>
                    </div>
                  )}
                </div>

                {/* =========================================================
                    3D FLIPPING LEAF (Rotates with dynamic shading)
                    ========================================================= */}
                {isFlipping && (
                  <div
                    className={`absolute inset-y-0 ${
                      flipDirection === 'forward'
                        ? 'right-0 w-[50%] origin-left animate-pageFlipForward'
                        : 'left-0 w-[50%] origin-right animate-pageFlipBackward'
                    } preserve-3d z-40 pointer-events-none shadow-2xl`}
                    style={{
                      animationDuration: '520ms',
                      animationTimingFunction: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
                      animationFillMode: 'forwards',
                    }}
                  >
                    {/* Front Face of the turning page */}
                    <div
                      className={`absolute inset-0 ${currentTheme.paper} backface-hidden flex items-center justify-center p-3 shadow-2xl`}
                    >
                      <canvas
                        ref={flipFrontCanvasRef}
                        className="max-w-full max-h-full object-contain filter contrast-[1.02]"
                      />
                      {/* Dynamic light gradient across the arched page */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-white/10 to-transparent pointer-events-none" />
                    </div>

                    {/* Back Face of the turning page (seen after crossing 90 degrees) */}
                    <div
                      className={`absolute inset-0 ${currentTheme.paper} backface-hidden rotate-y-180 flex items-center justify-center p-3 shadow-2xl`}
                    >
                      <canvas
                        ref={flipBackCanvasRef}
                        className="max-w-full max-h-full object-contain filter contrast-[1.02]"
                      />
                      {/* Reverse shading */}
                      <div className="absolute inset-0 bg-gradient-to-l from-black/25 via-white/10 to-transparent pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================
             SINGLE PAGE VIEW (Mobile / Tablet / Single Page Reader)
             ========================================================= */
          <div className="relative flex items-center justify-center perspective-1800">
            <div
              className={`relative flex rounded-xl border-4 book-shadow-3d p-2 sm:p-3 transition-colors ${currentTheme.bookCover}`}
              style={{
                boxShadow:
                  '0 20px 45px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.05)',
              }}
            >
              {/* Stacked edges */}
              <div className="absolute right-1 top-2 bottom-2 w-1 page-edge-layers-right rounded-r-sm pointer-events-none opacity-70" />

              <div
                className={`relative w-[min(840px,94vw)] h-[calc(100vh-8.5rem)] max-h-[890px] aspect-[1/1.414] ${currentTheme.paper} rounded-md flex flex-col justify-between overflow-hidden shadow-inner`}
              >
                {/* Bookmark Ribbon */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark(currentPage);
                  }}
                  title={singleBookmark ? `Bookmarked: ${singleBookmark.title || 'Page ' + currentPage}` : 'Bookmark this page'}
                  className={`absolute top-0 right-8 z-30 transition-all duration-300 hover:translate-y-1 ${
                    singleBookmark ? 'opacity-100' : 'opacity-25 hover:opacity-80'
                  }`}
                >
                  <div
                    className={`w-6 sm:w-7 h-12 sm:h-14 ${getRibbonColor(
                      singleBookmark
                    )} shadow-md flex items-end justify-center pb-2 clip-ribbon transition-transform`}
                    style={{
                      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)',
                    }}
                  >
                    <BookmarkIcon className="w-3.5 h-3.5 text-white fill-white/80" />
                  </div>
                </button>

                {/* Page Canvas */}
                <div className="relative flex-1 w-full h-full flex items-center justify-center p-1 sm:p-2 overflow-hidden">
                  <canvas
                    ref={singleCanvasRef}
                    className="w-full h-full object-contain filter contrast-[1.02]"
                  />

                  {/* Left Spine Shadow */}
                  <div className="absolute inset-y-0 left-0 w-10 spine-shadow-right pointer-events-none opacity-40" />

                  {/* Left turn button cue */}
                  {currentPage > 1 && (
                    <div
                      onClick={() => handleTurnPage('backward')}
                      className="absolute bottom-0 left-0 w-16 h-16 cursor-pointer flex items-end justify-start p-2 z-20 group"
                    >
                      <div className="w-8 h-8 rounded-tr-xl bg-stone-500/10 group-hover:bg-stone-500/20 flex items-center justify-center text-stone-500 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                      </div>
                    </div>
                  )}

                  {/* Right turn button cue */}
                  {currentPage < totalPages && (
                    <div
                      onClick={() => handleTurnPage('forward')}
                      className="absolute bottom-0 right-0 w-16 h-16 cursor-pointer flex items-end justify-end p-2 z-20 group"
                    >
                      <div className="w-8 h-8 rounded-tl-xl bg-stone-500/10 group-hover:bg-stone-500/20 flex items-center justify-center text-stone-500 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="h-6 flex items-center justify-between px-6 text-xs text-stone-400 font-serif border-t border-stone-200/30">
                  <span className="opacity-60">Folio Reader</span>
                  <span>
                    {currentPage} / {totalPages}
                  </span>
                </div>

                {/* 3D Page flip overlay in single view */}
                {isFlipping && (
                  <div
                    className={`absolute inset-0 origin-left ${
                      flipDirection === 'forward'
                        ? 'animate-pageFlipForward'
                        : 'animate-pageFlipBackward origin-right'
                    } preserve-3d z-40 pointer-events-none shadow-2xl`}
                    style={{
                      animationDuration: '480ms',
                      animationTimingFunction: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
                      animationFillMode: 'forwards',
                    }}
                  >
                    <div
                      className={`absolute inset-0 ${currentTheme.paper} backface-hidden flex items-center justify-center p-3 shadow-2xl`}
                    >
                      <canvas
                        ref={flipFrontCanvasRef}
                        className="max-w-full max-h-full object-contain filter contrast-[1.02]"
                      />
                    </div>
                    <div
                      className={`absolute inset-0 ${currentTheme.paper} backface-hidden rotate-y-180 flex items-center justify-center p-3 shadow-2xl`}
                    >
                      <canvas
                        ref={flipBackCanvasRef}
                        className="max-w-full max-h-full object-contain filter contrast-[1.02]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Side Turn Navigation Arrows (visible on hover or tap) */}
      <button
        onClick={() => handleTurnPage('backward')}
        disabled={currentPage <= 1 || isFlipping}
        aria-label="Previous Page"
        className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-stone-900/70 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700/60 shadow-xl backdrop-blur-md transition-all ${
          currentPage <= 1
            ? 'opacity-20 cursor-not-allowed pointer-events-none'
            : 'opacity-70 hover:opacity-100 hover:scale-110 active:scale-95'
        }`}
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        onClick={() => handleTurnPage('forward')}
        disabled={currentPage >= totalPages || isFlipping}
        aria-label="Next Page"
        className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-stone-900/70 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700/60 shadow-xl backdrop-blur-md transition-all ${
          currentPage >= totalPages
            ? 'opacity-20 cursor-not-allowed pointer-events-none'
            : 'opacity-70 hover:opacity-100 hover:scale-110 active:scale-95'
        }`}
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Keyframe animations styles */}
      <style>{`
        @keyframes pageFlipForward {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(-180deg);
          }
        }
        @keyframes pageFlipBackward {
          0% {
            transform: rotateY(-180deg);
          }
          100% {
            transform: rotateY(0deg);
          }
        }
        .animate-pageFlipForward {
          animation-name: pageFlipForward;
        }
        .animate-pageFlipBackward {
          animation-name: pageFlipBackward;
        }
      `}</style>
    </div>
  );
};
