export interface Bookmark {
  id: string;
  pageNumber: number;
  title: string;
  note?: string;
  color: 'crimson' | 'amber' | 'emerald' | 'sapphire' | 'violet';
  createdAt: number;
}

export interface TableOfContentItem {
  id: string;
  title: string;
  pageNumber: number; // 1-indexed
  level: number;
  children?: TableOfContentItem[];
}

export interface BookMetadata {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  fileSize: number;
  dateAdded: number;
  lastReadPage: number;
  lastReadTimestamp: number;
  bookmarks: Bookmark[];
  coverThumbnail?: string; // base64 preview image
  isSample?: boolean;
}

export type ReadingTheme = 'cream' | 'parchment' | 'sepia' | 'dark' | 'white';
export type ViewMode = 'dual' | 'single' | 'auto';

export interface PageRenderCache {
  pageNumber: number;
  dataUrl: string;
  aspectRatio: number;
}
