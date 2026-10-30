/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Loader2,
  Upload,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { BookMetadata, Bookmark, ReadingTheme, ViewMode } from './types/book';
import {
  getAllBooks,
  saveBookMetadata,
  savePDFData,
  loadPDFData,
  deleteBook,
  updateReadingProgress,
  addBookmark,
  removeBookmark,
} from './services/storage';
import {
  loadPDFFromBuffer,
  generatePageThumbnail,
  PDFDocumentWrapper,
} from './services/pdfService';
import { generateSampleBookPDF } from './services/sampleBookGenerator';
import { soundEngine } from './services/soundService';

import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { Book3DViewer } from './components/Book3DViewer';
import { BottomControls } from './components/BottomControls';
import { LibraryModal } from './components/LibraryModal';
import { ResumeModal } from './components/ResumeModal';

export default function App() {
  const [books, setBooks] = useState<BookMetadata[]>([]);
  const [activeBook, setActiveBook] = useState<BookMetadata | null>(null);
  const [activePdfWrapper, setActivePdfWrapper] = useState<PDFDocumentWrapper | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Reader Settings: default to 'single' page view for maximum readability
  const [theme, setTheme] = useState<ReadingTheme>('cream');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('folio_view_mode') as ViewMode) || 'single';
  });
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('folio_view_mode', mode);
  };

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [pendingBookForResume, setPendingBookForResume] = useState<BookMetadata | null>(null);

  // Loading & status
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing Folio Reader...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Hidden file input for quick uploads
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  // Load books from IndexedDB on startup
  useEffect(() => {
    const initializeLibrary = async () => {
      try {
        setIsLoading(true);
        setLoadingMessage('Loading your library from storage...');
        const storedBooks = await getAllBooks();

        if (storedBooks.length === 0) {
          // First time user: generate our rich sample book
          setLoadingMessage('Crafting your initial library volume...');
          const sampleBuffer = generateSampleBookPDF();
          const wrapper = await loadPDFFromBuffer(sampleBuffer);
          const thumb = await generatePageThumbnail(wrapper.pdf, 1, 300);

          const sampleMeta: BookMetadata = {
            id: `sample-alexandria-${Date.now()}`,
            title: 'The Chronicles of Alexandria: An Explorer\'s Folio',
            author: 'Marcus Aurelius Drake',
            totalPages: wrapper.numPages,
            fileSize: sampleBuffer.byteLength,
            dateAdded: Date.now(),
            lastReadPage: 1,
            lastReadTimestamp: Date.now(),
            bookmarks: [
              {
                id: 'bm-init-1',
                pageNumber: 3,
                title: 'The Labyrinth of Lost Scrolls',
                note: 'Fascinating quote about reading as walking with centuries of minds.',
                color: 'crimson',
                createdAt: Date.now() - 3600000,
              },
              {
                id: 'bm-init-2',
                pageNumber: 7,
                title: 'Ancient Codex Binding',
                note: 'Notes on Byzantine vellum and quire stitching techniques.',
                color: 'amber',
                createdAt: Date.now() - 1800000,
              },
            ],
            coverThumbnail: thumb,
            isSample: true,
          };

          await savePDFData(sampleMeta.id, sampleBuffer);
          await saveBookMetadata(sampleMeta);

          setBooks([sampleMeta]);
          setActiveBook(sampleMeta);
          setActivePdfWrapper(wrapper);
          setCurrentPage(1);
        } else {
          setBooks(storedBooks);
          // Open the most recently read book
          const sorted = [...storedBooks].sort((a, b) => b.lastReadTimestamp - a.lastReadTimestamp);
          const latest = sorted[0];

          await openBookDocument(latest, latest.lastReadPage || 1);
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setErrorMessage('Failed to load library. Please refresh or upload a new PDF.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeLibrary();
  }, []);

  // Opens a book document by ID and sets starting page
  const openBookDocument = async (book: BookMetadata, targetPage: number = 1) => {
    try {
      setIsLoading(true);
      setLoadingMessage(`Opening "${book.title}"...`);
      setErrorMessage(null);

      const buffer = await loadPDFData(book.id);
      if (!buffer) {
        throw new Error('PDF file data not found in local memory.');
      }

      const wrapper = await loadPDFFromBuffer(buffer);

      setActiveBook(book);
      setActivePdfWrapper(wrapper);
      const safePage = Math.max(1, Math.min(wrapper.numPages, targetPage));
      setCurrentPage(safePage);

      // Record reading progress
      await updateReadingProgress(book.id, safePage);
    } catch (err) {
      console.error('Error opening book:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to parse and open the PDF file.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Called when a user selects a book in the library modal
  const handleSelectBookFromLibrary = (book: BookMetadata) => {
    setIsLibraryOpen(false);

    // If the book has been read beyond page 1 or has bookmarks, show the Resume prompt!
    const hasHistory = book.lastReadPage > 1;
    const hasBookmarks = book.bookmarks && book.bookmarks.length > 0;

    if (hasHistory || hasBookmarks) {
      setPendingBookForResume(book);
      setIsResumeModalOpen(true);
    } else {
      openBookDocument(book, 1);
    }
  };

  // Resume Modal Action Handlers
  const handleResumeLastPage = () => {
    if (pendingBookForResume) {
      openBookDocument(pendingBookForResume, pendingBookForResume.lastReadPage);
    }
    setIsResumeModalOpen(false);
    setPendingBookForResume(null);
  };

  const handleJumpToBookmark = (page: number) => {
    if (pendingBookForResume) {
      openBookDocument(pendingBookForResume, page);
    }
    setIsResumeModalOpen(false);
    setPendingBookForResume(null);
  };

  const handleStartFromBeginning = () => {
    if (pendingBookForResume) {
      openBookDocument(pendingBookForResume, 1);
    }
    setIsResumeModalOpen(false);
    setPendingBookForResume(null);
  };

  // Upload handler for user PDFs
  const handleUploadPDF = async (file: File) => {
    try {
      setIsLoading(true);
      setLoadingMessage(`Importing "${file.name}" into Folio...`);
      setErrorMessage(null);

      const wrapper = await loadPDFFromBuffer(file);

      // Generate cover thumbnail
      let coverThumbnail: string | undefined;
      try {
        coverThumbnail = await generatePageThumbnail(wrapper.pdf, 1, 320);
      } catch {
        // continue without thumb
      }

      const bookId = `book-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const cleanTitle =
        wrapper.title !== 'Untitled Book'
          ? wrapper.title
          : file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');

      const newBook: BookMetadata = {
        id: bookId,
        title: cleanTitle,
        author: wrapper.author !== 'Unknown Author' ? wrapper.author : 'Imported Document',
        totalPages: wrapper.numPages,
        fileSize: file.size,
        dateAdded: Date.now(),
        lastReadPage: 1,
        lastReadTimestamp: Date.now(),
        bookmarks: [],
        coverThumbnail,
      };

      await savePDFData(bookId, file);
      await saveBookMetadata(newBook);

      // Update state
      const updatedList = await getAllBooks();
      setBooks(updatedList);
      setActiveBook(newBook);
      setActivePdfWrapper(wrapper);
      setCurrentPage(1);

      setIsLibraryOpen(false);

      // Celebratory paper confetti!
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#d97706', '#f59e0b', '#78350f', '#fbbf24'],
      });
    } catch (err) {
      console.error('Upload error:', err);
      alert('Could not parse the PDF file. Please ensure it is a valid, unencrypted PDF.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding sample classic book
  const handleAddSampleBook = async () => {
    try {
      setIsLoading(true);
      setLoadingMessage('Binding new sample volume...');
      const sampleBuffer = generateSampleBookPDF();
      const wrapper = await loadPDFFromBuffer(sampleBuffer);
      const thumb = await generatePageThumbnail(wrapper.pdf, 1, 320);

      const sampleMeta: BookMetadata = {
        id: `sample-alexandria-${Date.now()}`,
        title: `The Chronicles of Alexandria (Copy ${books.length + 1})`,
        author: 'Marcus Aurelius Drake',
        totalPages: wrapper.numPages,
        fileSize: sampleBuffer.byteLength,
        dateAdded: Date.now(),
        lastReadPage: 1,
        lastReadTimestamp: Date.now(),
        bookmarks: [],
        coverThumbnail: thumb,
        isSample: true,
      };

      await savePDFData(sampleMeta.id, sampleBuffer);
      await saveBookMetadata(sampleMeta);

      const updated = await getAllBooks();
      setBooks(updated);
      setActiveBook(sampleMeta);
      setActivePdfWrapper(wrapper);
      setCurrentPage(1);
      setIsLibraryOpen(false);
    } catch (err) {
      console.error('Failed to add sample:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete book handler
  const handleDeleteBook = async (id: string) => {
    await deleteBook(id);
    const updated = await getAllBooks();
    setBooks(updated);

    if (activeBook?.id === id) {
      if (updated.length > 0) {
        openBookDocument(updated[0], updated[0].lastReadPage || 1);
      } else {
        setActiveBook(null);
        setActivePdfWrapper(null);
      }
    }
  };

  // Page change handler with progress persistence
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (!activeBook || !activePdfWrapper) return;
      const safePage = Math.max(1, Math.min(activePdfWrapper.numPages, newPage));
      setCurrentPage(safePage);

      // Persist progress to IndexedDB
      updateReadingProgress(activeBook.id, safePage);
      setBooks((prev) =>
        prev.map((b) =>
          b.id === activeBook.id
            ? { ...b, lastReadPage: safePage, lastReadTimestamp: Date.now() }
            : b
        )
      );
    },
    [activeBook, activePdfWrapper]
  );

  // Bookmark toggle handler
  const handleToggleBookmark = async (pageNumber: number) => {
    if (!activeBook) return;

    const existing = (activeBook.bookmarks || []).find((b) => b.pageNumber === pageNumber);
    if (existing) {
      await removeBookmark(activeBook.id, existing.id);
      const updatedBm = activeBook.bookmarks.filter((b) => b.id !== existing.id);
      const updatedBook = { ...activeBook, bookmarks: updatedBm };
      setActiveBook(updatedBook);
      setBooks((prev) => prev.map((b) => (b.id === activeBook.id ? updatedBook : b)));
    } else {
      const newBm = await addBookmark(activeBook.id, {
        pageNumber,
        title: `Bookmark Page ${pageNumber}`,
        note: '',
        color: 'crimson',
      });
      soundEngine.playBookmarkChime();
      const updatedBm = [...(activeBook.bookmarks || []), newBm].sort(
        (a, b) => a.pageNumber - b.pageNumber
      );
      const updatedBook = { ...activeBook, bookmarks: updatedBm };
      setActiveBook(updatedBook);
      setBooks((prev) => prev.map((b) => (b.id === activeBook.id ? updatedBook : b)));
    }
  };

  // Add rich bookmark from sidebar
  const handleAddBookmarkDetailed = async (
    pageNumber: number,
    title: string,
    note: string,
    color: Bookmark['color']
  ) => {
    if (!activeBook) return;
    const newBm = await addBookmark(activeBook.id, {
      pageNumber,
      title,
      note,
      color,
    });
    const updatedBm = [...(activeBook.bookmarks || []), newBm].sort(
      (a, b) => a.pageNumber - b.pageNumber
    );
    const updatedBook = { ...activeBook, bookmarks: updatedBm };
    setActiveBook(updatedBook);
    setBooks((prev) => prev.map((b) => (b.id === activeBook.id ? updatedBook : b)));
  };

  // Delete bookmark from sidebar
  const handleDeleteBookmark = async (id: string) => {
    if (!activeBook) return;
    await removeBookmark(activeBook.id, id);
    const updatedBm = activeBook.bookmarks.filter((b) => b.id !== id);
    const updatedBook = { ...activeBook, bookmarks: updatedBm };
    setActiveBook(updatedBook);
    setBooks((prev) => prev.map((b) => (b.id === activeBook.id ? updatedBook : b)));
  };

  // Determine active topic title for top bar display
  const currentTopic = activePdfWrapper?.outline.find((item) => item.pageNumber <= currentPage);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-stone-950 text-stone-100 font-sans select-none">
      {/* Hidden file input for header quick upload */}
      <input
        ref={hiddenFileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleUploadPDF(e.target.files[0]);
          }
        }}
      />

      {/* Top Application Bar */}
      <TopBar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        bookTitle={activeBook?.title || 'Folio Reader'}
        currentTopicTitle={currentTopic?.title}
        theme={theme}
        onThemeChange={setTheme}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
        booksCount={books.length}
        onQuickUpload={() => hiddenFileInputRef.current?.click()}
      />

      {/* Main Reading Center Stage */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Collapsible / Drawer Sidebar with Chapters, Bookmarks, Pages, Search & TTS */}
        {activePdfWrapper && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            outline={activePdfWrapper.outline}
            currentPage={currentPage}
            totalPages={activePdfWrapper.numPages}
            onPageSelect={(p) => {
              handlePageChange(p);
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            bookmarks={activeBook?.bookmarks || []}
            onAddBookmark={handleAddBookmarkDetailed}
            onDeleteBookmark={handleDeleteBookmark}
            pdf={activePdfWrapper.pdf}
          />
        )}

        {/* 3D Book Viewer Stage */}
        <main className="flex-1 relative flex items-center justify-center overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
              <p className="text-sm font-serif text-stone-300 tracking-wide">
                {loadingMessage}
              </p>
            </div>
          ) : errorMessage ? (
            <div className="p-8 max-w-md text-center space-y-4 bg-stone-900 border border-stone-800 rounded-2xl shadow-xl">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
              <h3 className="text-base font-serif font-bold text-stone-100">
                Notice Opening Document
              </h3>
              <p className="text-xs text-stone-400">{errorMessage}</p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsLibraryOpen(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold rounded-xl text-xs transition-colors"
                >
                  Open Library
                </button>
                <button
                  onClick={() => hiddenFileInputRef.current?.click()}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium rounded-xl text-xs transition-colors"
                >
                  Upload Different PDF
                </button>
              </div>
            </div>
          ) : activePdfWrapper && activeBook ? (
            <Book3DViewer
              pdf={activePdfWrapper.pdf}
              totalPages={activePdfWrapper.numPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              bookmarks={activeBook.bookmarks || []}
              onToggleBookmark={handleToggleBookmark}
              theme={theme}
              viewMode={viewMode}
              zoomLevel={zoomLevel}
            />
          ) : (
            <div className="text-center space-y-4 p-8">
              <BookOpen className="w-12 h-12 mx-auto text-stone-600" />
              <h3 className="text-lg font-serif font-medium text-stone-300">
                No Book Opened
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Open your library or upload a PDF document to begin reading.
              </p>
              <button
                onClick={() => setIsLibraryOpen(true)}
                className="px-4 py-2 bg-amber-600 text-stone-950 font-semibold text-xs rounded-xl"
              >
                Open Bookshelf
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Bottom Navigation & Scrubber Controls */}
      {activePdfWrapper && !isLoading && (
        <BottomControls
          currentPage={currentPage}
          totalPages={activePdfWrapper.numPages}
          onPageChange={handlePageChange}
          bookmarks={activeBook?.bookmarks || []}
          onToggleBookmark={handleToggleBookmark}
          viewMode={viewMode}
        />
      )}

      {/* Library Bookshelf Modal */}
      <LibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        books={books}
        activeBookId={activeBook?.id || null}
        onSelectBook={handleSelectBookFromLibrary}
        onUploadPDF={handleUploadPDF}
        onDeleteBook={handleDeleteBook}
        onAddSampleBook={handleAddSampleBook}
        isLoadingUpload={isLoading}
      />

      {/* Resume from Bookmark or Last Page Modal */}
      {pendingBookForResume && (
        <ResumeModal
          book={pendingBookForResume}
          isOpen={isResumeModalOpen}
          onClose={() => {
            setIsResumeModalOpen(false);
            setPendingBookForResume(null);
          }}
          onResumeLast={handleResumeLastPage}
          onJumpToBookmark={handleJumpToBookmark}
          onStartBeginning={handleStartFromBeginning}
        />
      )}
    </div>
  );
}
