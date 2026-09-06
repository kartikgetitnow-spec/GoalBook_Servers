import { PDFDocumentData, PDFPageData } from '@/types';

interface TextItemWithBounds {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  right: number;
}

/**
 * Splits a block of text into individual sentences cleanly.
 */
export function splitIntoSentences(text: string): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];

  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
      return Array.from(segmenter.segment(cleaned))
        .map((s) => s.segment.trim())
        .filter((s) => s.length > 0);
    } catch {
      // Fallback if Segmenter fails
    }
  }

  // Robust regex fallback for sentence boundary detection
  const rawSentences = cleaned.split(/(?<=[.!?])\s+(?=[A-Z0-9"'([<])/);
  return rawSentences
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Sorts text items while respecting multi-column layouts and reading order.
 */
function sortItemsInReadingOrder(items: TextItemWithBounds[], pageWidth: number): string {
  if (items.length === 0) return '';

  // Calculate bounding box of all text to find potential column splits
  const minX = Math.min(...items.map((i) => i.x));
  const maxX = Math.max(...items.map((i) => i.right));
  const pageMidX = pageWidth / 2;

  // Check if there is a clear 2-column layout by testing for a vertical whitespace channel in the middle (around 45% - 55% of page width)
  const leftColMaxX = minX + (maxX - minX) * 0.46;
  const rightColMinX = minX + (maxX - minX) * 0.54;

  let isTwoColumn = false;
  const col1: TextItemWithBounds[] = [];
  const col2: TextItemWithBounds[] = [];
  const spanning: TextItemWithBounds[] = [];

  // Count items that fall cleanly into left vs right
  let cleanLeft = 0;
  let cleanRight = 0;
  let crossMiddle = 0;

  for (const item of items) {
    if (item.right <= rightColMinX && item.x <= pageMidX) {
      cleanLeft++;
    } else if (item.x >= leftColMaxX && item.right >= pageMidX) {
      cleanRight++;
    } else {
      crossMiddle++;
    }
  }

  // If we have substantial content in both columns and very few items crossing the middle gap, treat as multi-column
  if (cleanLeft > 5 && cleanRight > 5 && crossMiddle < (cleanLeft + cleanRight) * 0.25) {
    isTwoColumn = true;
  }

  if (isTwoColumn) {
    for (const item of items) {
      if (item.right <= rightColMinX && item.x <= pageMidX) {
        col1.push(item);
      } else if (item.x >= leftColMaxX && item.right >= pageMidX) {
        col2.push(item);
      } else {
        spanning.push(item);
      }
    }

    // Sort column 1 top-to-bottom (Y descending), then X ascending
    const sortBlock = (block: TextItemWithBounds[]) => {
      return block.sort((a, b) => {
        const yDiff = b.y - a.y;
        if (Math.abs(yDiff) > 5) return yDiff; // Different lines
        return a.x - b.x; // Same line, left to right
      });
    };

    // Separate header/footer spanning items from middle column items if necessary
    // For simplicity, we sort spanning items by Y, put top spanning above columns, bottom spanning below
    const avgY = items.reduce((sum, i) => sum + i.y, 0) / items.length;
    const topSpanning = spanning.filter((i) => i.y > avgY);
    const bottomSpanning = spanning.filter((i) => i.y <= avgY);

    const ordered = [
      ...sortBlock(topSpanning),
      ...sortBlock(col1),
      ...sortBlock(col2),
      ...sortBlock(bottomSpanning),
    ];

    return ordered.map((i) => i.str).join(' ');
  }

  // Standard single column sort: top to bottom, then left to right
  items.sort((a, b) => {
    const yDiff = b.y - a.y;
    if (Math.abs(yDiff) > 5) return yDiff;
    return a.x - b.x;
  });

  return items.map((i) => i.str).join(' ');
}

/**
 * Extracts text and structured sentences from an uploaded PDF file or ArrayBuffer.
 */
export async function extractTextFromPDF(
  input: File | ArrayBuffer,
  fileName: string = 'document.pdf',
  fileSize: number = 0
): Promise<PDFDocumentData> {
  const pdfjsLib = await import('pdfjs-dist');

  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }

  let arrayBuffer: ArrayBuffer;

  if (input instanceof File) {
    arrayBuffer = await input.arrayBuffer();
    fileName = input.name;
    fileSize = input.size;
  } else {
    arrayBuffer = input;
  }

  // Load the PDF document
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;

  const pages: PDFPageData[] = [];

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });

    const items: TextItemWithBounds[] = [];

    for (const item of textContent.items) {
      if ('str' in item && item.str.trim() !== '') {
        const x = item.transform[4];
        const y = item.transform[5];
        const width = item.width || 0;
        const height = item.height || 0;
        items.push({
          str: item.str,
          x,
          y,
          width,
          height,
          right: x + width,
        });
      }
    }

    const pageText = sortItemsInReadingOrder(items, viewport.width);
    const sentences = splitIntoSentences(pageText);

    pages.push({
      pageNumber: pageNum,
      text: pageText,
      sentences,
    });
  }

  return {
    name: fileName,
    size: fileSize,
    pageCount,
    pages,
  };
}
