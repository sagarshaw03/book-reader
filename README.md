# Folio Reader — Interactive 3D Book & PDF Reader

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![PDF.js](https://img.shields.io/badge/PDF.js-v6-red.svg)](https://mozilla.github.io/pdf.js/)
[![License](https://img.shields.io/badge/License-Apache--2.0-green.svg)](LICENSE)

An elegant, browser-based 3D digital book and PDF reader with realistic page-turning physics, spatial Web Audio paper rustle synthesis, an IndexedDB-backed multi-book library, interactive topic tracking, color-coded silk ribbon bookmarks, and full-text search.

---

## ✨ Features

### 📖 1. Realistic 3D Book Experience & Page-Turning Physics
- **Single Page & Dual Page Modes**: Toggle seamlessly between high-readability **Single Page** view (great for reading and small screens) and a classical **Dual-Page Spread** (recreating an open hardcover codex with center spine valley shadows and edge leaf depth).
- **Smooth 3D Page Turn Animations**: Smooth 3D perspective rotation with dynamic ambient shading and backface rendering.
- **Synthesized Web Audio Paper Rustle**: Authentic page turns and bookmark snaps generated 100% offline via the Web Audio API (white noise bandpass filter + gain envelopes) — zero audio file downloads required.
- **Touch & Gesture Support**: Swipe left/right on mobile and touchscreens, click bottom corner curl zones, or navigate using keyboard shortcuts.

### 📚 2. Persistent Multi-PDF Memory Bookshelf
- **IndexedDB Blob Storage**: PDFs and metadata are stored safely in browser storage (`idb-keyval`) without memory detachment or size limitations.
- **Multi-Book Library**: Upload any number of PDF files, view real-time reading progress percentages, file sizes, total page counts, and auto-generated cover thumbnails.
- **Smart Resume Prompt**: When opening a book with reading history, choose between:
  - ⏱️ **Resume Reading** — Jump to the exact page and review when you last read.
  - 🔖 **Jump to Bookmark** — Open directly to your latest bookmarked quote or topic.
  - 🔄 **Start from Beginning** — Open Page 1 from scratch.
- **Built-in Classic Companion**: Generates a 12-page sample folio (*"The Chronicles of Alexandria"*) with chapters and front matter on first launch.

### 🔖 3. Integrated Ribbon Bookmarking System
- **Silk Ribbon Bookmark**: Realistic hanging satin ribbon at the top of the active page that can be clicked to bookmark instantly.
- **Notes & Color Coding**: Categorize bookmarks with 5 color themes (Crimson, Amber, Emerald, Sapphire, Violet) and add private annotations.
- **Bookmark Drawer**: Browse, search, jump to, or delete bookmarks anytime from the sidebar.

### 🧭 4. Sidebar Navigation & Active Topic Tracker
- **Current Topic Tracker**: Live indicator banner displaying the exact chapter/section you are currently reading alongside a percentage completion bar.
- **Dynamic Table of Contents (Outline)**: Automatically extracts embedded PDF outlines or synthesizes chapter sections for instant one-click jumps.
- **Page Grid (Thumbnails)**: Visual thumbnail selector to quickly skim across pages.
- **Full-Text PDF Search**: Search keywords across all pages in the PDF with context snippets and direct navigation.
- **Built-in Text-to-Speech (TTS)**: Listen to any page read aloud with adjustable playback speed (0.75x to 1.5x).

### 🎨 5. Reading Themes & Display Controls
- **5 Curated Reading Themes**:
  - 📜 **Cream Folio** — Warm traditional book paper.
  - 🏺 **Antique Parchment** — Subtle fibrous parchment tone.
  - ☕ **Cozy Sepia** — Easy-on-the-eyes amber tone.
  - 🌙 **Night Velvet** — Dark mode for nighttime reading.
  - 📄 **Clean White** — High-contrast modern view.
- **Zoom Scrubber**: Zoom from 60% to 160% with a click-to-reset 100% button.
- **Fullscreen Mode**: Immerse into a distraction-free reading canvas.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `→` / `PageDown` / `Space` / `L` | Turn to Next Page |
| `←` / `PageUp` / `H` | Turn to Previous Page |
| `Home` | Jump to First Page |
| `End` | Jump to Last Page |
| `B` | Toggle Bookmark on Current Page |

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with 3D CSS perspective utilities
- **PDF Engine**: [`pdfjs-dist`](https://mozilla.github.io/pdf.js/) (v6) with custom canvas renderer and outline parser
- **Local Persistence**: [`idb-keyval`](https://github.com/jakearchibald/idb-keyval) for IndexedDB blob and metadata storage
- **Sound Synthesis**: Native Web Audio API procedural synthesis
- **Icons & Delight**: [`lucide-react`](https://lucide.dev/) and [`canvas-confetti`](https://www.npmjs.com/package/canvas-confetti)

---

## 📁 Project Structure

```
├── index.html                   # HTML entry point with web fonts (Newsreader, EB Garamond, Cinzel)
├── metadata.json                # AI Studio application metadata
├── package.json                 # Dependencies and build scripts
├── src/
│   ├── App.tsx                  # Main application orchestrator & reading lifecycle
│   ├── main.tsx                 # React DOM root mounting
│   ├── index.css                # Tailwind CSS v4 imports & custom 3D book perspective rules
│   ├── components/
│   │   ├── Book3DViewer.tsx     # 3D canvas renderer with dual/single page flipping physics
│   │   ├── TopBar.tsx           # Header bar (view switcher, zoom, themes, audio toggle)
│   │   ├── BottomControls.tsx   # Interactive scrubber, page input, and bookmark toggle
│   │   ├── Sidebar.tsx          # Drawer with chapters, bookmarks, thumbnails, search & TTS
│   │   ├── LibraryModal.tsx     # Bookshelf dialog (manage, upload, filter, delete PDFs)
│   │   └── ResumeModal.tsx      # Welcome back dialog (Resume, Jump to Mark, Start Over)
│   ├── services/
│   │   ├── pdfService.ts        # PDF.js wrapper, canvas page renderer, outline parser
│   │   ├── storage.ts           # IndexedDB storage for immutable Blobs and book metadata
│   │   ├── soundService.ts      # Web Audio procedural paper turn & chime generator
│   │   └── sampleBookGenerator.ts # Generates a 12-page sample PDF book binary in memory
│   └── types/
│       └── book.ts              # TypeScript interfaces for BookMetadata, Bookmark, Outline
└── tsconfig.json                # TypeScript compiler configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or bun

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd <repository-directory>

# Install dependencies
npm install
```

### Development
```bash
# Start local development server on port 3000
npm run dev
```

### Production Build
```bash
# Build production bundle to /dist
npm run build

# Preview production build
npm run preview
```

---

## 🔒 Privacy & Offline First

Folio Reader operates entirely client-side:
- **No file uploads to external servers**: All PDF rendering, storage, text extraction, search, and audio synthesis happen directly in your browser.
- **Offline Capable**: PDFs are stored inside your browser's local IndexedDB and persist across browser sessions.

---

## 📄 License

Licensed under the [Apache License, Version 2.0](LICENSE).
