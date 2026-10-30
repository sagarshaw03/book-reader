import React, { useState, useRef } from 'react';
import {
  BookOpen,
  Upload,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Bookmark as BookmarkIcon,
  X,
  Search,
  Sparkles,
  ArrowRight,
  BookMarked,
} from 'lucide-react';
import { BookMetadata } from '../types/book';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: BookMetadata[];
  activeBookId: string | null;
  onSelectBook: (book: BookMetadata) => void;
  onUploadPDF: (file: File) => Promise<void>;
  onDeleteBook: (id: string) => Promise<void>;
  onAddSampleBook: () => Promise<void>;
  isLoadingUpload: boolean;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({
  isOpen,
  onClose,
  books,
  activeBookId,
  onSelectBook,
  onUploadPDF,
  onDeleteBook,
  onAddSampleBook,
  isLoadingUpload,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        await onUploadPDF(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        alert('Please select a valid PDF file.');
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        await onUploadPDF(file);
      } else {
        alert('Please drop a valid PDF file.');
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-stone-100">
        {/* Top Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-100">
                Folio Bookshelf & Library
              </h2>
              <p className="text-xs text-stone-400">
                {books.length} {books.length === 1 ? 'Volume' : 'Volumes'} saved in memory storage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoadingUpload}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-medium text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isLoadingUpload ? 'Parsing PDF...' : 'Upload PDF'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-xl transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar & Dropzone */}
        <div className="px-5 py-3 border-b border-stone-800 bg-stone-950/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Filter by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-stone-900 border border-stone-700/80 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <button
            onClick={onAddSampleBook}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-amber-500/10 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Classic Sample Folio</span>
          </button>
        </div>

        {/* Books Grid */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex-1 overflow-y-auto p-5 transition-colors ${
            isDragging ? 'bg-amber-950/20 ring-2 ring-dashed ring-amber-500' : ''
          }`}
        >
          {isDragging && (
            <div className="p-8 text-center border-2 border-dashed border-amber-500 rounded-2xl bg-amber-500/5 mb-4">
              <Upload className="w-8 h-8 mx-auto text-amber-400 mb-2 animate-bounce" />
              <p className="text-sm font-medium text-amber-200">
                Drop your PDF book here to import
              </p>
            </div>
          )}

          {filteredBooks.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-stone-800 flex items-center justify-center text-stone-500">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-serif font-medium text-stone-200">
                  No books in your shelf yet
                </h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto mt-1">
                  Upload any PDF document or generate the classic Alexandria edition to start reading.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose PDF File</span>
                </button>
                <button
                  onClick={onAddSampleBook}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-medium flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Add Sample Book</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBooks.map((book) => {
                const isActive = book.id === activeBookId;
                const progress = Math.round((book.lastReadPage / book.totalPages) * 100);

                return (
                  <div
                    key={book.id}
                    className={`group relative rounded-2xl border transition-all duration-200 p-4 flex flex-col justify-between overflow-hidden ${
                      isActive
                        ? 'bg-amber-950/20 border-amber-500/60 shadow-lg'
                        : 'bg-stone-800/40 hover:bg-stone-800/80 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    {/* Top row: Cover thumbnail + Info */}
                    <div className="flex gap-3.5">
                      {/* Cover Thumbnail Preview */}
                      <div className="relative w-20 h-28 rounded-lg overflow-hidden bg-stone-950 border border-stone-700/60 shadow-md flex-shrink-0 flex items-center justify-center">
                        {book.coverThumbnail ? (
                          <img
                            src={book.coverThumbnail}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full p-2 bg-gradient-to-b from-amber-900/60 to-stone-950 flex flex-col justify-between text-[8px] text-amber-200/80 font-serif">
                            <span className="truncate">{book.title}</span>
                            <span className="opacity-50 text-right">FOLIO</span>
                          </div>
                        )}

                        {/* Active Ribbon Marker */}
                        {isActive && (
                          <div className="absolute top-0 right-1.5 w-3 h-6 bg-amber-500 clip-ribbon shadow" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-serif font-bold text-stone-100 group-hover:text-amber-200 transition-colors line-clamp-2">
                          {book.title}
                        </h4>
                        <p className="text-xs text-stone-400 truncate mt-0.5">
                          {book.author}
                        </p>

                        <div className="mt-3 space-y-1.5 text-[11px] text-stone-400">
                          <div className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-stone-500" />
                            <span>{book.totalPages} pages</span>
                            <span>•</span>
                            <span>{formatFileSize(book.fileSize)}</span>
                          </div>
                          {book.bookmarks && book.bookmarks.length > 0 && (
                            <div className="flex items-center gap-1.5 text-rose-400">
                              <BookmarkIcon className="w-3.5 h-3.5 fill-rose-500/20" />
                              <span>{book.bookmarks.length} saved bookmarks</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 pt-3 border-t border-stone-800/80 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-400">
                          Last read: Page {book.lastReadPage}
                        </span>
                        <span className="text-amber-400 font-medium font-mono">
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-stone-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onSelectBook(book)}
                        className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Open Book</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remove "${book.title}" from your library?`)) {
                            onDeleteBook(book.id);
                          }
                        }}
                        title="Delete book"
                        className="p-2 text-stone-500 hover:text-rose-400 hover:bg-stone-800 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
