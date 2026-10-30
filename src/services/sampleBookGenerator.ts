/**
 * Generates a valid multi-page PDF document in binary format
 * complete with chapters, elegant typography, outlines, and page numbers.
 */
export function generateSampleBookPDF(): ArrayBuffer {
  const pagesData = [
    {
      title: 'THE CHRONICLES OF ALEXANDRIA',
      subtitle: 'AN EXPLORER\'S COMPANION TO ANCIENT LIBRARIES & FORGOTTEN CODICES',
      author: 'By Marcus Aurelius Drake (1894)',
      chapter: 'FRONT MATTER',
      body: [
        'Welcome to the Folio Interactive Reader.',
        'This volume has been bound for your study and contemplation.',
        'Herein lie recorded the legends of marble halls, fragrant cedar shelves,',
        'and the scholars who walked between candlelight and eternity.',
        '',
        'Turn the page with the corner controls, keyboard arrows, or swipe gestures.',
        'Add bookmarks using the crimson ribbon, inspect the sidebar chapters,',
        'and enjoy the tactile art of digital reading.'
      ]
    },
    {
      title: 'TABLE OF CONTENTS & PREFACE',
      subtitle: 'OUTLINE OF SECTIONS',
      author: 'Bibliotheca Alexandrina',
      chapter: 'PREFACE',
      body: [
        'I. CHAPTER ONE: The Labyrinth of Lost Scrolls (Page 3)',
        '   Section 1.1: The Midnight Oil (Page 3)',
        '   Section 1.2: The Whispering Ink (Page 4)',
        '',
        'II. CHAPTER TWO: The Constellations of the Scribes (Page 5)',
        '   Section 2.1: Charting the Night Sky (Page 6)',
        '',
        'III. CHAPTER THREE: The Binding of Ancient Codexes (Page 7)',
        '   Section 3.1: Parchment, Gold Leaf & Pigment (Page 8)',
        '',
        'IV. CHAPTER FOUR: The Alchemist\'s Marginalia (Page 9)',
        '   Section 4.1: The Riddle of the Cipher (Page 10)',
        '',
        'V. EPILOGUE & COLOPHON (Pages 11-12)'
      ]
    },
    {
      title: 'CHAPTER I: THE LABYRINTH OF LOST SCROLLS',
      subtitle: 'SECTION 1.1: THE MIDNIGHT OIL',
      author: 'Alexandria, 3rd Century BCE',
      chapter: 'CHAPTER 1',
      body: [
        'Under the colonnades of the Great Mouseion, seven hundred thousand papyrus rolls',
        'rested in niches of Syrian cedar. At twilight, when the Mediterranean breeze swept',
        'through the high arches, an extraordinary hush settled across the courtyards.',
        '',
        'Callimachus of Cyrene walked with a small bronze oil lamp, its flame casting long',
        'dancing shadows upon the terracotta floor. In his hand was the Pinakes—the master catalogue',
        'that divided the whole sum of human knowledge into poets, philosophers, and astronomers.',
        '',
        '"To read a book," he was once heard to murmur to his apprentice, "is to walk with the ghost',
        'of a mind that has traversed centuries to whisper into your ear."'
      ]
    },
    {
      title: 'CHAPTER I (CONTINUED)',
      subtitle: 'SECTION 1.2: THE WHISPERING INK',
      author: 'Alexandria, 3rd Century BCE',
      chapter: 'CHAPTER 1',
      body: [
        'The ink used by the royal scribes was compounded from charred pine soot, gum arabic from the Nile acacia,',
        'and vinegar distilled from unripe dates. It possessed a luster that neither desert drought',
        'nor seaside humidity could entirely dim.',
        '',
        'Here beneath the stone vault, scribes copied medical treaties of Hippocrates, comedies of Aristophanes,',
        'and astronomical calculations of Eratosthenes, who had just measured the circumference of the Earth',
        'using nothing more than the shadow cast by a wooden stake at noon in Syene.',
        '',
        'Every traveler entering the harbor was required to surrender any manuscript on board.',
        'The scribes would rapidly make a meticulous copy, return the replica, and place the original',
        'into the sacred inner sanctum of the library.'
      ]
    },
    {
      title: 'CHAPTER II: THE CONSTELLATIONS OF THE SCRIBES',
      subtitle: 'SECTION 2.1: CHARTING THE NIGHT SKY',
      author: 'The Observatory of the Sea Gate',
      chapter: 'CHAPTER 2',
      body: [
        'When the lamps were extinguished, the scholars climbed to the roof terrace overlooking the Pharos beacon.',
        'The lighthouse flared forty cubits high, its mirror of polished bronze directing light fifty miles across the sea.',
        '',
        'Beside the astrolabes of brass and stone, Timocharis noted the occultation of the Pleiades by the moon.',
        'Their notes were recorded on calfskin vellum, scraped fine with pumice until it became as smooth as ivory.',
        '',
        'Notice how words set down three thousand years ago speak to your screen this very minute.',
        'The medium transforms from papyrus to vellum, to rag paper, to Gutenberg type, and now to interactive digital folios;',
        'yet the communion between writer and reader remains untouched.'
      ]
    },
    {
      title: 'CHAPTER II (CONTINUED)',
      subtitle: 'SECTION 2.2: THE GEOMETRY OF THOUGHT',
      author: 'Euclid\'s School',
      chapter: 'CHAPTER 2',
      body: [
        'In the western wing, Euclid had traced thirteen books of Elements with a reed stylus in wet sand.',
        'King Ptolemy asked him if there was not a shorter road to geometry than through the theorems.',
        'Euclid smiled gravely: "There is no royal road to geometry, your Majesty."',
        '',
        'Every page of this digital volume can be bookmarked by clicking the ribbon in the top right.',
        'Try bookmarking this chapter now. When you leave and return to the library,',
        'you can choose whether to jump straight back to this bookmark or start from where you last read.'
      ]
    },
    {
      title: 'CHAPTER III: THE BINDING OF ANCIENT CODEXES',
      subtitle: 'SECTION 3.1: PARCHMENT, GOLD LEAF & PIGMENT',
      author: 'Monastic Workshops of Byzantium',
      chapter: 'CHAPTER 3',
      body: [
        'By the fourth century, the roll began yielding to the codex—the ancestor of the book we hold today.',
        'Sheets folded into quires of four, stitched together with flax cord upon a wooden spine board,',
        'covered in goat morocco leather stamped with hot iron dyes.',
        '',
        'The book was no longer an endless unrolling scroll; it had become an object with two facing leaves,',
        'a left verso and a right recto, creating a balanced visual spread.',
        '',
        'On desktop screens, notice how this app mirrors the classical dual-page spread.',
        'The center crease casts a subtle shadow, while the edges reveal the depth of stacked leaves.'
      ]
    },
    {
      title: 'CHAPTER III (CONTINUED)',
      subtitle: 'SECTION 3.2: THE CRAFT OF THE PAGE FLIP',
      author: 'The Art of Bookmaking',
      chapter: 'CHAPTER 3',
      body: [
        'When you turn a physical leaf, your fingers feel the grain of the rag paper and the faint breeze of air.',
        'Our page-turning engine models that authentic physics: an arc of three-dimensional rotation,',
        'subtle light gradation that deepens near the spine, and an acoustic whisper generated via real-time Web Audio.',
        '',
        'You can toggle between dual-page view and single-page view at any moment from the top toolbar.',
        'On mobile devices and vertical tablets, the reader automatically adjusts to a comfortable single leaf.'
      ]
    },
    {
      title: 'CHAPTER IV: THE ALCHEMIST\'S MARGINALIA',
      subtitle: 'SECTION 4.1: THE RIDDLE OF THE CIPHER',
      author: 'The Lost Codex of Ostia',
      chapter: 'CHAPTER 4',
      body: [
        'In the margins of folio 84, an unknown scholar penned an intricate riddle in cinnabar red ink:',
        '',
        '"He who reads without meditating is like one who eats without digesting.',
        'The book that remains closed is but a block of paper; opened, it is a garden where the soul may stroll."',
        '',
        'In the sidebar on the left, you can view the complete chapter tree,',
        'track your current reading progress percentage, and jump directly to any topic with a single tap.'
      ]
    },
    {
      title: 'CHAPTER IV (CONTINUED)',
      subtitle: 'SECTION 4.2: SEARCH & ILLUMINATION',
      author: 'The Scholastic Method',
      chapter: 'CHAPTER 4',
      body: [
        'Use the search feature in the sidebar to locate any keyword throughout the entire manuscript.',
        'You can also press the speaker icon to listen to the page read aloud with built-in voice synthesis.',
        '',
        'When you upload your own PDFs—whether scientific papers, novels, instruction manuals, or textbooks—',
        'they will be saved safely into your browser\'s private storage library.',
        'Your bookmarks, notes, and last viewed positions are automatically preserved.'
      ]
    },
    {
      title: 'EPILOGUE: THE KEEPERS OF THE HEARTH',
      subtitle: 'FINAL THOUGHTS',
      author: 'Marcus Aurelius Drake',
      chapter: 'EPILOGUE',
      body: [
        'Libraries do not perish when stones fall or flames rise; they endure in every person who loves to read.',
        'As long as one human being holds curiosity in the heart and reaches out to turn the next page,',
        'Alexandria still stands.',
        '',
        'May this reader companion bring quiet hours of delight to your reading journey.',
        'May your mind find refuge in great thoughts and your imagination soar beyond all horizons.'
      ]
    },
    {
      title: 'COLOPHON & TECHNICAL SPECIFICATION',
      subtitle: 'EDITION FOLIO DIGITALIS',
      author: 'Crafted with Precision',
      chapter: 'COLOPHON',
      body: [
        'Typeset digitally in serif typography reminiscent of Baskerville and Garamond.',
        'Engineered with React 19, Tailwind CSS, 3D WebGL/CSS Transforms, and PDF.js.',
        '',
        'Features included in this edition:',
        '• Interactive 3D dual-page & single-page book views with realistic paper curvature',
        '• Web Audio physical page rustle and flutter synthesis',
        '• Full chapter & topic navigation with real-time reading progress tracking',
        '• Persistent multi-PDF library with IndexedDB memory storage',
        '• Smart resume prompts: Jump to Bookmark, Resume Last Page, or Start Over',
        '• Full-text search and integrated Text-to-Speech narration',
        '• Color-coded bookmark ribbon system with private notes'
      ]
    }
  ];

  // Build standard PDF 1.4 string
  let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets: number[] = [];

  function addObj(content: string): number {
    const objNum = offsets.length + 1;
    offsets.push(pdf.length);
    pdf += `${objNum} 0 obj\n${content}\nendobj\n`;
    return objNum;
  }

  // 1: Catalog
  // We'll wire up Outlines and Pages
  const catalogNum = 1;
  const outlinesNum = 2;
  const pagesRootNum = 3;

  offsets.push(0); // placeholder for index 0
  offsets.push(pdf.length); // obj 1
  pdf += `1 0 obj\n<< /Type /Catalog /Pages ${pagesRootNum} 0 R /Outlines ${outlinesNum} 0 R >>\nendobj\n`;

  // We have 12 pages. Let's create Outline items:
  // Items:
  // 1. Front Matter (page 1)
  // 2. Table of Contents (page 2)
  // 3. Chapter I: The Labyrinth of Lost Scrolls (page 3)
  // 4. Chapter II: The Constellations of the Scribes (page 5)
  // 5. Chapter III: The Binding of Ancient Codexes (page 7)
  // 6. Chapter IV: The Alchemist's Marginalia (page 9)
  // 7. Epilogue (page 11)
  // 8. Colophon (page 12)

  // We will add outline objects after pages are defined.
  // Reserve object numbers for pages and outline
  const totalPages = pagesData.length;
  // Let's allocate object numbers:
  // Obj 1: Catalog
  // Obj 2: Outlines root
  // Obj 3: Pages root
  // Obj 4: Font F1 (Helvetica/Times)
  // Obj 5: Font F2 (Times-Bold)
  // Obj 6: Font F3 (Times-Italic)
  // Then for each page: Page obj, Content obj (2 objs per page = 24 objs)
  // Then Outline items: 8 items (8 objs)

  const fontF1 = 4;
  const fontF2 = 5;
  const fontF3 = 6;

  // Obj 2: Outlines root placeholder
  const outlineItemsCount = 8;
  const outlineStartObj = 7 + totalPages * 2;

  offsets.push(pdf.length); // obj 2
  pdf += `2 0 obj\n<< /Type /Outlines /First ${outlineStartObj} 0 R /Last ${outlineStartObj + outlineItemsCount - 1} 0 R /Count ${outlineItemsCount} >>\nendobj\n`;

  // Obj 3: Pages root
  const pageObjNums: number[] = [];
  for (let i = 0; i < totalPages; i++) {
    pageObjNums.push(7 + i * 2);
  }

  offsets.push(pdf.length); // obj 3
  pdf += `3 0 obj\n<< /Type /Pages /Kids [${pageObjNums.map((n) => `${n} 0 R`).join(' ')}] /Count ${totalPages} >>\nendobj\n`;

  // Obj 4, 5, 6: Fonts
  offsets.push(pdf.length); // obj 4
  pdf += `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>\nendobj\n`;

  offsets.push(pdf.length); // obj 5
  pdf += `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold >>\nendobj\n`;

  offsets.push(pdf.length); // obj 6
  pdf += `6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic >>\nendobj\n`;

  // Page objects & Content objects
  // PDF coordinate system: 612 x 792 points (standard US Letter)
  for (let i = 0; i < totalPages; i++) {
    const pageNum = i + 1;
    const pageObjNum = 7 + i * 2;
    const contentObjNum = pageObjNum + 1;
    const data = pagesData[i];

    // Escape text for PDF string literals
    const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

    let stream = '';
    // Decorative border lines
    stream += 'q\n';
    stream += '0.85 0.82 0.76 rg\n'; // subtle parchment border
    stream += '36 36 540 720 re S\n';
    stream += '38 38 536 716 re S\n';

    // Header bar
    stream += 'BT\n';
    stream += `/F3 9 Tf\n`;
    stream += `0.45 0.42 0.38 rg\n`;
    stream += `54 734 Td (${esc(data.chapter)}) Tj\n`;
    stream += `ET\n`;

    // Page number in header/footer
    stream += 'BT\n';
    stream += `/F1 9 Tf\n`;
    stream += `0.45 0.42 0.38 rg\n`;
    const pageStr = `- ${pageNum} -`;
    stream += `520 734 Td (${esc(pageStr)}) Tj\n`;
    stream += `ET\n`;

    // Title
    stream += 'BT\n';
    stream += `/F2 ${pageNum === 1 ? '18' : '15'} Tf\n`;
    stream += `0.15 0.12 0.10 rg\n`;
    stream += `54 ${pageNum === 1 ? '680' : '690'} Td (${esc(data.title)}) Tj\n`;
    stream += `ET\n`;

    // Subtitle
    if (data.subtitle) {
      stream += 'BT\n';
      stream += `/F3 10 Tf\n`;
      stream += `0.35 0.32 0.28 rg\n`;
      stream += `54 ${pageNum === 1 ? '655' : '670'} Td (${esc(data.subtitle)}) Tj\n`;
      stream += `ET\n`;
    }

    // Author / Location
    if (data.author) {
      stream += 'BT\n';
      stream += `/F3 9 Tf\n`;
      stream += `0.5 0.45 0.4 rg\n`;
      stream += `54 ${pageNum === 1 ? '635' : '652'} Td (${esc(data.author)}) Tj\n`;
      stream += `ET\n`;
    }

    // Horizontal decorative line under heading
    stream += '0.75 0.70 0.65 RG 0.5 w\n';
    stream += `54 ${pageNum === 1 ? '615' : '640'} m 558 ${pageNum === 1 ? '615' : '640'} l S\n`;

    // Body lines
    let yPos = pageNum === 1 ? 580 : 615;
    const lineHeight = 19;

    for (const line of data.body) {
      if (line.trim().length > 0) {
        stream += 'BT\n';
        // Check if list item or emphasis
        const isHeader = line.startsWith('I.') || line.startsWith('II.') || line.startsWith('III.') || line.startsWith('IV.') || line.startsWith('V.');
        if (isHeader) {
          stream += `/F2 11 Tf\n`;
          stream += `0.2 0.15 0.1 rg\n`;
        } else if (line.startsWith('"') || line.startsWith('•')) {
          stream += `/F3 11 Tf\n`;
          stream += `0.25 0.22 0.2 rg\n`;
        } else {
          stream += `/F1 11 Tf\n`;
          stream += `0.18 0.15 0.12 rg\n`;
        }
        stream += `54 ${yPos} Td (${esc(line)}) Tj\n`;
        stream += `ET\n`;
      }
      yPos -= lineHeight;
    }

    // Footer decoration
    stream += '0.8 0.78 0.72 RG 0.5 w\n';
    stream += '54 55 m 558 55 l S\n';
    stream += 'BT\n';
    stream += `/F3 8 Tf\n`;
    stream += `0.55 0.52 0.48 rg\n`;
    stream += `54 44 Td (FOLIO INTERACTIVE EDITION - COMPANION) Tj\n`;
    stream += `ET\n`;
    stream += 'Q\n';

    // Page object
    offsets.push(pdf.length); // obj pageObjNum
    pdf += `${pageObjNum} 0 obj\n<< /Type /Page /Parent ${pagesRootNum} 0 R /MediaBox [0 0 612 792] /Contents ${contentObjNum} 0 R /Resources << /Font << /F1 ${fontF1} 0 R /F2 ${fontF2} 0 R /F3 ${fontF3} 0 R >> >> >>\nendobj\n`;

    // Content object
    offsets.push(pdf.length); // obj contentObjNum
    pdf += `${contentObjNum} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`;
  }

  // Outline items
  const outlineDefs = [
    { title: 'Front Matter: Welcome', pageIndex: 0 },
    { title: 'Table of Contents & Preface', pageIndex: 1 },
    { title: 'Chapter 1: The Labyrinth of Lost Scrolls', pageIndex: 2 },
    { title: 'Chapter 2: Constellations of the Scribes', pageIndex: 4 },
    { title: 'Chapter 3: Binding Ancient Codexes', pageIndex: 6 },
    { title: 'Chapter 4: The Alchemist\'s Marginalia', pageIndex: 8 },
    { title: 'Epilogue: Keepers of the Hearth', pageIndex: 10 },
    { title: 'Colophon & Technical Specs', pageIndex: 11 },
  ];

  for (let i = 0; i < outlineDefs.length; i++) {
    const objNum = outlineStartObj + i;
    const prevNum = i > 0 ? outlineStartObj + i - 1 : null;
    const nextNum = i < outlineDefs.length - 1 ? outlineStartObj + i + 1 : null;
    const def = outlineDefs[i];
    const targetPageObj = pageObjNums[def.pageIndex];

    let outlineObjContent = `<< /Title (${def.title.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')}) /Parent ${outlinesNum} 0 R /Dest [${targetPageObj} 0 R /XYZ null null null]`;
    if (prevNum) outlineObjContent += ` /Prev ${prevNum} 0 R`;
    if (nextNum) outlineObjContent += ` /Next ${nextNum} 0 R`;
    outlineObjContent += ` >>`;

    offsets.push(pdf.length);
    pdf += `${objNum} 0 obj\n${outlineObjContent}\nendobj\n`;
  }

  // Cross-reference table (xref)
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) {
    const offStr = String(offsets[i]).padStart(10, '0');
    pdf += `${offStr} 00000 n \n`;
  }

  // Trailer
  pdf += `trailer\n<< /Size ${offsets.length} /Root ${catalogNum} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  // Convert to ArrayBuffer
  const buffer = new ArrayBuffer(pdf.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < pdf.length; i++) {
    view[i] = pdf.charCodeAt(i) & 0xff;
  }
  return buffer;
}
