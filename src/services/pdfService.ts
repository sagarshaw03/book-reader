import * as pdfjsLib from 'pdfjs-dist';
import { TableOfContentItem } from '../types/book';

// Set up worker source
if (typeof window !== 'undefined') {
  try {
    // Attempt local worker resolution
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url
    ).toString();
  } catch {
    // Fallback to unpkg CDN matching the installed version
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }
}

export interface PDFDocumentWrapper {
  pdf: pdfjsLib.PDFDocumentProxy;
  numPages: number;
  outline: TableOfContentItem[];
  title: string;
  author: string;
}

/**
 * Loads a PDF from ArrayBuffer, Uint8Array, or Blob and extracts metadata + outline
 */
export async function loadPDFFromBuffer(
  buffer: ArrayBuffer | Uint8Array | Blob
): Promise<PDFDocumentWrapper> {
  let data: Uint8Array;
  if (buffer instanceof Blob) {
    const ab = await buffer.arrayBuffer();
    data = new Uint8Array(ab);
  } else if (buffer instanceof Uint8Array) {
    data = new Uint8Array(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
  } else {
    // Clone ArrayBuffer so PDF.js worker transfer does NOT detach caller's buffer!
    data = new Uint8Array(buffer.slice(0));
  }

  const loadingTask = pdfjsLib.getDocument({
    data,
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
    cMapPacked: true,
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  let title = 'Untitled Book';
  let author = 'Unknown Author';

  try {
    const meta = await pdf.getMetadata();
    const info = meta?.info as Record<string, unknown> | undefined;
    if (info?.Title && typeof info.Title === 'string' && info.Title.trim()) {
      title = info.Title.trim();
    }
    if (info?.Author && typeof info.Author === 'string' && info.Author.trim()) {
      author = info.Author.trim();
    }
  } catch {
    // Keep defaults
  }

  // Extract outline (Table of Contents)
  let outline: TableOfContentItem[] = [];
  try {
    const rawOutline = await pdf.getOutline();
    if (rawOutline && rawOutline.length > 0) {
      outline = await parseOutlineItems(rawOutline, pdf);
    }
  } catch {
    outline = [];
  }

  // If PDF has no embedded outline, generate smart chapters based on page structure
  if (!outline || outline.length === 0) {
    outline = generateFallbackOutline(numPages);
  }

  return {
    pdf,
    numPages,
    outline,
    title,
    author,
  };
}

/**
 * Recursively parses PDF outline nodes and resolves their target page numbers
 */
async function parseOutlineItems(
  items: unknown[],
  pdf: pdfjsLib.PDFDocumentProxy,
  level: number = 0
): Promise<TableOfContentItem[]> {
  const result: TableOfContentItem[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i] as {
      title: string;
      dest?: unknown;
      items?: unknown[];
    };

    let pageNumber = 1;

    try {
      if (typeof item.dest === 'string') {
        const destArray = await pdf.getDestination(item.dest);
        if (destArray && destArray[0]) {
          const pageIndex = await pdf.getPageIndex(destArray[0]);
          pageNumber = pageIndex + 1;
        }
      } else if (Array.isArray(item.dest) && item.dest[0]) {
        const pageIndex = await pdf.getPageIndex(item.dest[0]);
        pageNumber = pageIndex + 1;
      }
    } catch {
      // fallback to level estimation or page 1
    }

    let children: TableOfContentItem[] | undefined;
    if (item.items && item.items.length > 0) {
      children = await parseOutlineItems(item.items, pdf, level + 1);
    }

    result.push({
      id: `toc-${level}-${i}-${pageNumber}`,
      title: item.title || `Section ${i + 1}`,
      pageNumber: Math.max(1, Math.min(pageNumber, pdf.numPages)),
      level,
      children,
    });
  }

  return result;
}

/**
 * Fallback chapter generation for PDFs without embedded outline
 */
function generateFallbackOutline(numPages: number): TableOfContentItem[] {
  if (numPages <= 5) {
    return [
      { id: 'sec-1', title: 'Complete Document', pageNumber: 1, level: 0 },
    ];
  }

  const items: TableOfContentItem[] = [];
  items.push({ id: 'sec-intro', title: 'Introduction & Front Matter', pageNumber: 1, level: 0 });

  const chapterStep = Math.max(4, Math.floor(numPages / 8));
  let chapterIndex = 1;

  for (let p = Math.min(3, numPages); p <= numPages; p += chapterStep) {
    items.push({
      id: `sec-ch-${chapterIndex}`,
      title: `Chapter ${chapterIndex} (Page ${p})`,
      pageNumber: p,
      level: 0,
    });
    chapterIndex++;
  }

  return items;
}

/**
 * Renders a PDF page to a HTML canvas element with high DPI crispness
 */
export async function renderPageToCanvas(
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  targetWidth?: number
): Promise<{ width: number; height: number; aspectRatio: number }> {
  const page = await pdf.getPage(pageNumber);
  const unscaledViewport = page.getViewport({ scale: 1 });
  
  // Calculate scale for target width or default crisp scale
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  let scale = 1.5;
  if (targetWidth && targetWidth > 0) {
    scale = (targetWidth / unscaledViewport.width) * dpr;
  } else {
    scale = scale * dpr;
  }

  const viewport = page.getViewport({ scale });
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Could not get 2d context');

  // Background white fill
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const renderContext = {
    canvasContext: ctx,
    viewport: viewport,
    canvas: canvas,
  };

  // Render page
  await page.render(renderContext).promise;

  return {
    width: canvas.width,
    height: canvas.height,
    aspectRatio: unscaledViewport.width / unscaledViewport.height,
  };
}

/**
 * Generates a thumbnail data URL for a given page (e.g., cover on page 1)
 */
export async function generatePageThumbnail(
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNumber: number = 1,
  maxWidth: number = 320
): Promise<string> {
  const offscreen = document.createElement('canvas');
  await renderPageToCanvas(pdf, pageNumber, offscreen, maxWidth);
  return offscreen.toDataURL('image/jpeg', 0.85);
}

/**
 * Extracts plain text from a page for search and TTS
 */
export async function extractPageText(
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNumber: number
): Promise<string> {
  try {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    return textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return '';
  }
}
