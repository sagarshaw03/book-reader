import { get, set, del } from 'idb-keyval';
import { BookMetadata, Bookmark } from '../types/book';

const BOOKS_METADATA_KEY = 'folio_books_metadata_v1';
const DATA_PREFIX = 'folio_pdf_data_';

/**
 * Gets all saved book metadata from storage
 */
export async function getAllBooks(): Promise<BookMetadata[]> {
  try {
    const list = await get<BookMetadata[]>(BOOKS_METADATA_KEY);
    return list || [];
  } catch (err) {
    console.error('Failed to load books metadata from IndexedDB:', err);
    return [];
  }
}

/**
 * Saves or updates book metadata
 */
export async function saveBookMetadata(metadata: BookMetadata): Promise<void> {
  const books = await getAllBooks();
  const index = books.findIndex((b) => b.id === metadata.id);
  if (index >= 0) {
    books[index] = metadata;
  } else {
    books.unshift(metadata);
  }
  await set(BOOKS_METADATA_KEY, books);
}

/**
 * Stores the PDF raw data as a Blob (immune to detachment and memory efficient in IndexedDB)
 */
export async function savePDFData(id: string, data: ArrayBuffer | Blob): Promise<void> {
  let blobToStore: Blob;
  if (data instanceof Blob) {
    blobToStore = data;
  } else {
    // Clone slice to guarantee it cannot be detached by caller or worker
    const bufferCopy = data.slice(0);
    blobToStore = new Blob([bufferCopy], { type: 'application/pdf' });
  }
  await set(`${DATA_PREFIX}${id}`, blobToStore);
}

/**
 * Loads the PDF raw ArrayBuffer from storage
 */
export async function loadPDFData(id: string): Promise<ArrayBuffer | null> {
  try {
    const data = await get<Blob | ArrayBuffer>(`${DATA_PREFIX}${id}`);
    if (!data) return null;
    if (data instanceof Blob) {
      return await data.arrayBuffer();
    }
    return data.slice(0);
  } catch (err) {
    console.error('Failed to load PDF data for id:', id, err);
    return null;
  }
}

/**
 * Deletes a book and its raw PDF data
 */
export async function deleteBook(id: string): Promise<void> {
  const books = await getAllBooks();
  const filtered = books.filter((b) => b.id !== id);
  await set(BOOKS_METADATA_KEY, filtered);
  await del(`${DATA_PREFIX}${id}`);
}

/**
 * Updates reading progress (lastReadPage and timestamp)
 */
export async function updateReadingProgress(
  id: string,
  lastReadPage: number
): Promise<void> {
  const books = await getAllBooks();
  const target = books.find((b) => b.id === id);
  if (target) {
    target.lastReadPage = lastReadPage;
    target.lastReadTimestamp = Date.now();
    await set(BOOKS_METADATA_KEY, books);
  }
}

/**
 * Adds or updates a bookmark for a book
 */
export async function addBookmark(
  bookId: string,
  bookmark: Omit<Bookmark, 'id' | 'createdAt'>
): Promise<Bookmark> {
  const books = await getAllBooks();
  const target = books.find((b) => b.id === bookId);
  if (!target) throw new Error('Book not found');

  const newBookmark: Bookmark = {
    ...bookmark,
    id: `bm-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    createdAt: Date.now(),
  };

  // Remove existing bookmark on same page if any
  const filtered = (target.bookmarks || []).filter(
    (b) => b.pageNumber !== bookmark.pageNumber
  );
  target.bookmarks = [...filtered, newBookmark].sort(
    (a, b) => a.pageNumber - b.pageNumber
  );

  await set(BOOKS_METADATA_KEY, books);
  return newBookmark;
}

/**
 * Removes a bookmark
 */
export async function removeBookmark(
  bookId: string,
  bookmarkId: string
): Promise<void> {
  const books = await getAllBooks();
  const target = books.find((b) => b.id === bookId);
  if (!target) return;

  target.bookmarks = (target.bookmarks || []).filter((b) => b.id !== bookmarkId);
  await set(BOOKS_METADATA_KEY, books);
}
