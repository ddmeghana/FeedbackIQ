/**
 * FeedbackIQ — Client-Side Executive PDF Report Exporter
 *
 * Generates publication-grade executive PDF reports using jsPDF.
 * Features a deterministic layout & pagination engine:
 *   - Strict A4 content boundaries (210x297mm, 14mm margins, 182mm printable width)
 *   - Font-locked text wrapping via splitTextToSize before every height calculation
 *   - Dynamic multi-page row & paragraph splitting (zero clipped text or footer overlap)
 *   - Heading keep-with-next protection (prevents orphaned section headers)
 *   - Generalized table engine with wrapped cells, dynamic row heights, and repeating headers
 *   - WinAnsi character sanitization (eliminates PDF font encoding artifacts)
 *   - Accurate running headers and "Page X of Y" footers across all pages
 */

import { jsPDF } from 'jspdf';

// ─── Layout Geometry (A4 Portrait in mm) ─────────────────────────────────────
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_X = 14;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2; // 182mm

const PAGE_1_TOP_Y = 14;
const RUNNING_HEADER_TEXT_Y = 11.5;
const RUNNING_HEADER_LINE_Y = 15;
const HEADER_CLEAR_Y = 21; // Top Y for body content on pages 2+

const BOTTOM_SAFE_Y = 278; // Guaranteed 5mm clearance above footer separator
const FOOTER_LINE_Y = 283;
const FOOTER_TEXT_Y = 288;
const MAX_BODY_HEIGHT = BOTTOM_SAFE_Y - HEADER_CLEAR_Y; // 257mm

const PT_TO_MM = 0.352778;

// ─── Nordic Obsidian Print Palette (RGB) ──────────────────────────────────────
const PALETTE = {
  headerBg:    [24, 24, 27],     // #18181B
  accent:      [217, 119, 6],    // #D97706
  accentBg:    [254, 243, 199],  // #FEF3C7
  textDark:    [24, 24, 27],     // #18181B
  textMuted:   [100, 100, 110],  // #64646E
  cardBg:      [249, 250, 251],  // #F9FAFB
  rowAltBg:    [244, 244, 246],  // #F4F4F6
  cardBorder:  [224, 224, 228],  // #E0E0E4
  white:       [255, 255, 255],
  positive:    [16, 185, 129],   // #10B981
  positiveBg:  [236, 253, 245],  // #ECFDF5
  negative:    [220, 38, 38],    // #DC2626
  negativeBg:  [254, 242, 242],  // #FEF2F2
  neutral:     [217, 119, 6],    // #D97706
  mixed:       [124, 58, 237],   // #7C3AED
  pending:     [113, 113, 122],  // #71717A
};

/**
 * Sanitizes strings for jsPDF built-in Helvetica (WinAnsi / Latin-1) encoding.
 * Prevents broken UTF-16BE glyph streams and incorrect width measurements.
 *
 * @param {*} value
 * @returns {string}
 */
export function sanitizePdfText(value) {
  if (value === null || value === undefined) return '';
  let str = String(value);

  // Replace unsupported symbols with clean WinAnsi equivalents
  str = str
    .replace(/\u2605|\u2606/g, '*')      // ★ ☆ -> *
    .replace(/\u2192/g, '->')            // → -> ->
    .replace(/\u2190/g, '<-')            // ← -> <-
    .replace(/\u2194/g, '<->')           // ↔ -> <->
    .replace(/[\u201C\u201D]/g, '"')     // “ ” -> "
    .replace(/[\u2018\u2019]/g, "'")     // ‘ ’ -> '
    .replace(/\u2022/g, '-')             // • -> -
    .replace(/[\r\n\t]+/g, ' ')          // normalize line breaks/tabs for clean wrapping
    .replace(/\s{2,}/g, ' ');

  // Strip any remaining characters outside Latin-1 / supported WinAnsi punctuation
  // (keeps ASCII 0x20-0x7E, Latin-1 0xA0-0xFF, en-dash \u2013, em-dash \u2014, ellipsis \u2026)
  let clean = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (
      (code >= 0x20 && code <= 0x7e) ||
      (code >= 0xa0 && code <= 0xff) ||
      code === 0x2013 ||
      code === 0x2014 ||
      code === 0x2026
    ) {
      clean += str[i];
    }
  }
  return clean.trim();
}

/**
 * Computes exact line metrics in mm for a given font size and spacing factor.
 */
function getLineMetrics(fontSize, lineHeightFactor = 1.38) {
  const lineHeight = fontSize * PT_TO_MM * lineHeightFactor;
  const ascent = fontSize * PT_TO_MM * 0.82;
  return { lineHeight, ascent };
}

/**
 * Builds the complete jsPDF document instance without triggering a browser download.
 * Exported directly so automated layout verification tests can inspect the exact PDF output.
 *
 * @param {Object} reportData - Aggregated report data from reportDataService
 * @returns {jsPDF}
 */
export function buildReportPdfDocument(reportData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const metadata = reportData?.metadata || {};
  const kpis = reportData?.kpis || {};
  const sections = metadata.sections || {};

  let currentY = PAGE_1_TOP_Y;

  // ─── Typography & Wrapping Helpers ──────────────────────────────────────────

  function setTypo(fontSize, fontStyle = 'normal', color = PALETTE.textDark) {
    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
  }

  function wrap(text, maxWidth, fontSize, fontStyle = 'normal') {
    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(fontSize);
    const safe = sanitizePdfText(text);
    if (!safe) return [];
    // Apply a 1.5mm tolerance buffer so jsPDF kerning/punctuation never creeps past right boundaries
    const targetWidth = Math.max(maxWidth - 1.5, 6);
    const lines = doc.splitTextToSize(safe, targetWidth);
    return Array.isArray(lines) ? lines : [String(lines)];
  }

  function fitSingleLine(text, maxWidth, fontSize, fontStyle = 'normal') {
    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(fontSize);
    const safe = sanitizePdfText(text);
    if (doc.getTextWidth(safe) <= maxWidth) return safe;
    const ellipsis = '...';
    let trimmed = safe;
    while (trimmed.length > 1 && doc.getTextWidth(trimmed + ellipsis) > maxWidth) {
      trimmed = trimmed.slice(0, -1);
    }
    return trimmed + ellipsis;
  }

  function drawLines(lines, x, startBaselineY, lineHeight, fontSize, fontStyle, color, align = 'left') {
    setTypo(fontSize, fontStyle, color);
    const opts = align !== 'left' ? { align } : undefined;
    for (let i = 0; i < lines.length; i++) {
      doc.text(lines[i], x, startBaselineY + i * lineHeight, opts);
    }
  }

  // ─── Pagination Helpers ─────────────────────────────────────────────────────

  function addNewPage() {
    doc.addPage();
    currentY = HEADER_CLEAR_Y;
  }

  function ensureSpace(neededHeight) {
    const isTopOfFreshPage = doc.internal.getNumberOfPages() > 1 && currentY <= HEADER_CLEAR_Y + 0.5;
    if (!isTopOfFreshPage && currentY + neededHeight > BOTTOM_SAFE_Y) {
      addNewPage();
      return true;
    }
    return false;
  }

  function remainingSpace() {
    return Math.max(0, BOTTOM_SAFE_Y - currentY);
  }

  /**
   * Draws a section header with keep-with-next protection so headings
   * are never stranded alone at the bottom of a page.
   */
  function drawSectionHeader(title, subtitle, minContentHeight = 20) {
    const titleSize = 12.5;
    const subSize = 8.5;
    const titleMetrics = getLineMetrics(titleSize, 1.25);
    const subMetrics = getLineMetrics(subSize, 1.3);

    const titleLines = wrap(title, CONTENT_WIDTH, titleSize, 'bold');
    const subLines = subtitle ? wrap(subtitle, CONTENT_WIDTH, subSize, 'normal') : [];

    const titleH = titleLines.length * titleMetrics.lineHeight;
    const subH = subLines.length > 0 ? subLines.length * subMetrics.lineHeight + 1 : 0;
    const headerHeight = 4 + titleH + subH + 3 + 4; // top gap + text + rule + bottom gap

    // Ensure room for BOTH header AND minimum following content block
    ensureSpace(Math.min(headerHeight + minContentHeight, MAX_BODY_HEIGHT));

    currentY += 3;
    drawLines(titleLines, MARGIN_X, currentY + titleMetrics.ascent, titleMetrics.lineHeight, titleSize, 'bold', PALETTE.textDark);
    currentY += titleH;

    if (subLines.length > 0) {
      currentY += 0.5;
      drawLines(subLines, MARGIN_X, currentY + subMetrics.ascent, subMetrics.lineHeight, subSize, 'normal', PALETTE.textMuted);
      currentY += subLines.length * subMetrics.lineHeight;
    }

    currentY += 1.5;
    doc.setDrawColor(...PALETTE.accent);
    doc.setLineWidth(0.75);
    doc.line(MARGIN_X, currentY, MARGIN_X + 26, currentY);
    currentY += 4.5;
  }

  /**
   * Renders a bordered flow box that automatically splits across multiple pages
   * if the content is taller than the remaining space or even taller than a full page.
   */
  function drawFlowTextBox(text, { fontSize = 9, fontStyle = 'normal', leftStripeColor = PALETTE.accent } = {}) {
    const padX = 6;
    const padY = 4;
    const textWidth = CONTENT_WIDTH - padX * 2;
    const { lineHeight, ascent } = getLineMetrics(fontSize, 1.42);
    const lines = wrap(text || 'No data available.', textWidth, fontSize, fontStyle);
    if (lines.length === 0) return;

    const fullBoxHeight = padY * 2 + lines.length * lineHeight;

    // If whole box fits on current page OR fits on a fresh page, keep it intact
    if (fullBoxHeight <= MAX_BODY_HEIGHT) {
      ensureSpace(fullBoxHeight);
      doc.setFillColor(...PALETTE.cardBg);
      doc.setDrawColor(...PALETTE.cardBorder);
      doc.setLineWidth(0.3);
      doc.roundedRect(MARGIN_X, currentY, CONTENT_WIDTH, fullBoxHeight, 1.5, 1.5, 'FD');

      if (leftStripeColor) {
        doc.setFillColor(...leftStripeColor);
        doc.rect(MARGIN_X, currentY, 2, fullBoxHeight, 'F');
      }

      drawLines(lines, MARGIN_X + padX, currentY + padY + ascent, lineHeight, fontSize, fontStyle, PALETTE.textDark);
      currentY += fullBoxHeight + 5;
      return;
    }

    // Extremely long text (> 1 full page): render cleanly in page-sized chunks
    let lineIdx = 0;
    while (lineIdx < lines.length) {
      let avail = remainingSpace() - padY * 2;
      if (avail < lineHeight * 3) {
        addNewPage();
        avail = remainingSpace() - padY * 2;
      }

      const maxLinesHere = Math.max(1, Math.floor(avail / lineHeight));
      const chunk = lines.slice(lineIdx, lineIdx + maxLinesHere);
      const chunkHeight = padY * 2 + chunk.length * lineHeight;

      doc.setFillColor(...PALETTE.cardBg);
      doc.setDrawColor(...PALETTE.cardBorder);
      doc.setLineWidth(0.3);
      doc.roundedRect(MARGIN_X, currentY, CONTENT_WIDTH, chunkHeight, 1.5, 1.5, 'FD');

      if (leftStripeColor) {
        doc.setFillColor(...leftStripeColor);
        doc.rect(MARGIN_X, currentY, 2, chunkHeight, 'F');
      }

      drawLines(chunk, MARGIN_X + padX, currentY + padY + ascent, lineHeight, fontSize, fontStyle, PALETTE.textDark);
      currentY += chunkHeight + 3;
      lineIdx += chunk.length;
    }
    currentY += 2;
  }

  /**
   * Renders a multi-line text item (bullet or action) with exact height checks and
   * safe cross-page splitting if the item exceeds remaining/full page space.
   */
  function drawFlowListItem(prefixText, bodyText, { fontSize = 8, accentColor = null, indent = 0 } = {}) {
    const { lineHeight, ascent } = getLineMetrics(fontSize, 1.38);
    const fullText = prefixText ? `${prefixText} ${bodyText}` : bodyText;
    const availWidth = CONTENT_WIDTH - indent;
    const lines = wrap(fullText, availWidth, fontSize, 'normal');
    if (lines.length === 0) return;

    const itemGap = 2.5;
    const totalHeight = lines.length * lineHeight + itemGap;

    if (totalHeight <= MAX_BODY_HEIGHT) {
      ensureSpace(totalHeight);
      if (accentColor) {
        doc.setFillColor(...accentColor);
        doc.circle(MARGIN_X + 1.5, currentY + ascent * 0.65, 1, 'F');
      }
      drawLines(lines, MARGIN_X + indent, currentY + ascent, lineHeight, fontSize, 'normal', PALETTE.textDark);
      currentY += totalHeight;
      return;
    }

    // Extremely long comment/action exceeding an entire page
    let idx = 0;
    while (idx < lines.length) {
      let avail = remainingSpace();
      if (avail < lineHeight * 2) {
        addNewPage();
        avail = remainingSpace();
      }
      const fitCount = Math.max(1, Math.floor(avail / lineHeight));
      const chunk = lines.slice(idx, idx + fitCount);
      if (idx === 0 && accentColor) {
        doc.setFillColor(...accentColor);
        doc.circle(MARGIN_X + 1.5, currentY + ascent * 0.65, 1, 'F');
      }
      drawLines(chunk, MARGIN_X + indent, currentY + ascent, lineHeight, fontSize, 'normal', PALETTE.textDark);
      currentY += chunk.length * lineHeight;
      idx += chunk.length;
    }
    currentY += itemGap;
  }

  /**
   * Generalized, rock-solid multi-page Table Renderer.
   * Guarantees:
   *   - Sum of column widths strictly fits CONTENT_WIDTH
   *   - Every cell wraps safely inside its column width
   *   - Row heights scale to the tallest wrapped cell
   *   - Never clips or overflows the bottom margin
   *   - Automatically repeats table header on continuation pages
   *   - Supports chunking of abnormally tall single rows across pages
   */
  function drawTable({ columns, rows, fontSize = 7.5, headerFontSize = 7.5, emptyMessage = 'No records available.' }) {
    if (!rows || rows.length === 0) {
      const m = getLineMetrics(8, 1.3);
      ensureSpace(10);
      setTypo(8, 'italic', PALETTE.textMuted);
      doc.text(sanitizePdfText(emptyMessage), MARGIN_X, currentY + m.ascent);
      currentY += m.lineHeight + 4;
      return;
    }

    const cellPadX = 2.5;
    const cellPadY = 2.2;
    const headerMetrics = getLineMetrics(headerFontSize, 1.25);
    const bodyMetrics = getLineMetrics(fontSize, 1.32);

    // Pre-compute wrapped header cells
    const wrappedHeaders = columns.map((col) =>
      wrap(col.header, col.width - cellPadX * 2, headerFontSize, 'bold')
    );
    const maxHeaderLines = Math.max(1, ...wrappedHeaders.map((h) => h.length));
    const headerHeight = cellPadY * 2 + maxHeaderLines * headerMetrics.lineHeight;

    // Helper to draw the table header at currentY
    function renderTableHeader() {
      doc.setFillColor(...PALETTE.rowAltBg);
      doc.setDrawColor(...PALETTE.cardBorder);
      doc.setLineWidth(0.3);
      doc.rect(MARGIN_X, currentY, CONTENT_WIDTH, headerHeight, 'FD');

      let colX = MARGIN_X;
      columns.forEach((col, cIdx) => {
        const lines = wrappedHeaders[cIdx];
        const align = col.align || 'left';
        const textX =
          align === 'right'
            ? colX + col.width - cellPadX
            : align === 'center'
            ? colX + col.width / 2
            : colX + cellPadX;

        drawLines(
          lines,
          textX,
          currentY + cellPadY + headerMetrics.ascent,
          headerMetrics.lineHeight,
          headerFontSize,
          'bold',
          PALETTE.textDark,
          align
        );
        colX += col.width;
      });
      currentY += headerHeight;
    }

    // Ensure space for Header + at least 1 minimal row before starting table
    ensureSpace(headerHeight + cellPadY * 2 + bodyMetrics.lineHeight);
    renderTableHeader();

    // Render each row
    rows.forEach((row, rIdx) => {
      const wrappedCells = columns.map((col) => {
        const rawVal = row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : '';
        return wrap(rawVal, col.width - cellPadX * 2, fontSize, col.bold ? 'bold' : 'normal');
      });

      const maxLines = Math.max(1, ...wrappedCells.map((c) => c.length));
      const fullRowHeight = cellPadY * 2 + maxLines * bodyMetrics.lineHeight;
      const singlePageMaxForRows = BOTTOM_SAFE_Y - HEADER_CLEAR_Y - headerHeight - 2;

      // Normal case: row fits on one page
      if (fullRowHeight <= singlePageMaxForRows) {
        if (currentY + fullRowHeight > BOTTOM_SAFE_Y) {
          addNewPage();
          renderTableHeader();
        }

        if (rIdx % 2 === 1) {
          doc.setFillColor(...PALETTE.cardBg);
          doc.rect(MARGIN_X, currentY, CONTENT_WIDTH, fullRowHeight, 'F');
        }

        doc.setDrawColor(...PALETTE.cardBorder);
        doc.setLineWidth(0.2);
        doc.rect(MARGIN_X, currentY, CONTENT_WIDTH, fullRowHeight, 'S');

        let colX = MARGIN_X;
        columns.forEach((col, cIdx) => {
          const lines = wrappedCells[cIdx];
          if (lines.length > 0) {
            const align = col.align || 'left';
            const textX =
              align === 'right'
                ? colX + col.width - cellPadX
                : align === 'center'
                ? colX + col.width / 2
                : colX + cellPadX;

            const cellColor = typeof col.colorFn === 'function' ? col.colorFn(row) : (col.color || PALETTE.textDark);
            drawLines(
              lines,
              textX,
              currentY + cellPadY + bodyMetrics.ascent,
              bodyMetrics.lineHeight,
              fontSize,
              col.bold ? 'bold' : 'normal',
              cellColor,
              align
            );
          }
          colX += col.width;
        });

        currentY += fullRowHeight;
        return;
      }

      // Extreme edge case: a single cell is taller than an entire page!
      // Slice wrapped cell lines cleanly across continuation pages with repeated headers.
      let lineOffset = 0;
      while (lineOffset < maxLines) {
        let avail = remainingSpace() - cellPadY * 2;
        if (avail < bodyMetrics.lineHeight * 2) {
          addNewPage();
          renderTableHeader();
          avail = remainingSpace() - cellPadY * 2;
        }

        const linesPerSlice = Math.max(1, Math.floor(avail / bodyMetrics.lineHeight));
        const sliceEnd = Math.min(maxLines, lineOffset + linesPerSlice);
        const sliceCount = sliceEnd - lineOffset;
        const sliceHeight = cellPadY * 2 + sliceCount * bodyMetrics.lineHeight;

        if (rIdx % 2 === 1) {
          doc.setFillColor(...PALETTE.cardBg);
          doc.rect(MARGIN_X, currentY, CONTENT_WIDTH, sliceHeight, 'F');
        }

        doc.setDrawColor(...PALETTE.cardBorder);
        doc.setLineWidth(0.2);
        doc.rect(MARGIN_X, currentY, CONTENT_WIDTH, sliceHeight, 'S');

        let colX = MARGIN_X;
        columns.forEach((col, cIdx) => {
          const chunk = wrappedCells[cIdx].slice(lineOffset, sliceEnd);
          if (chunk.length > 0) {
            const align = col.align || 'left';
            const textX =
              align === 'right'
                ? colX + col.width - cellPadX
                : align === 'center'
                ? colX + col.width / 2
                : colX + cellPadX;

            const cellColor = typeof col.colorFn === 'function' ? col.colorFn(row) : (col.color || PALETTE.textDark);
            drawLines(
              chunk,
              textX,
              currentY + cellPadY + bodyMetrics.ascent,
              bodyMetrics.lineHeight,
              fontSize,
              col.bold ? 'bold' : 'normal',
              cellColor,
              align
            );
          }
          colX += col.width;
        });

        currentY += sliceHeight;
        lineOffset = sliceEnd;
      }
    });

    currentY += 6;
  }

  // =========================================================================
  // 1. COVER HEADER & DYNAMIC METADATA BANNER
  // =========================================================================
  const bannerPadX = 7;
  const bannerPadY = 6;
  const bannerInnerWidth = CONTENT_WIDTH - bannerPadX * 2; // 168mm

  const titleLines = wrap(metadata.title || 'FeedbackIQ Executive Report', bannerInnerWidth, 13, 'bold');
  const titleMetrics = getLineMetrics(13, 1.28);

  const metaItemsText = `Scope: ${metadata.productScopeLabel || 'All Products'}   |   Period: ${metadata.dateRangeLabel || 'All Time'}   |   Generated: ${metadata.generatedAt || ''}   |   Responses: ${metadata.totalResponses ?? 0}`;
  const metaLines = wrap(metaItemsText, bannerInnerWidth, 8, 'normal');
  const metaMetrics = getLineMetrics(8, 1.35);

  const brandBlockHeight = 13; // IQ icon + FeedbackIQ subtitle
  const titleBlockHeight = titleLines.length * titleMetrics.lineHeight;
  const metaBlockHeight = metaLines.length * metaMetrics.lineHeight;
  const bannerHeight = bannerPadY + brandBlockHeight + 3 + titleBlockHeight + 3 + metaBlockHeight + bannerPadY;

  doc.setFillColor(...PALETTE.headerBg);
  doc.roundedRect(MARGIN_X, currentY, CONTENT_WIDTH, bannerHeight, 2, 2, 'F');

  // Brand Icon Badge
  const brandY = currentY + bannerPadY;
  doc.setFillColor(...PALETTE.accent);
  doc.roundedRect(MARGIN_X + bannerPadX, brandY, 7.5, 7.5, 1.5, 1.5, 'F');
  setTypo(10.5, 'bold', PALETTE.headerBg);
  doc.text('IQ', MARGIN_X + bannerPadX + 3.75, brandY + 5.2, { align: 'center' });

  // Brand Name & Subtitle
  setTypo(14, 'bold', PALETTE.white);
  doc.text('FeedbackIQ', MARGIN_X + bannerPadX + 10.5, brandY + 4.8);
  setTypo(7.2, 'normal', [180, 180, 190]);
  doc.text('AI-POWERED CUSTOMER INTELLIGENCE PLATFORM', MARGIN_X + bannerPadX + 10.5, brandY + 9.2);

  // Executive Tag (top-right inside banner)
  setTypo(7.2, 'bold', PALETTE.accent);
  doc.text('EXECUTIVE REPORT', MARGIN_X + CONTENT_WIDTH - bannerPadX, brandY + 4.8, { align: 'right' });

  // Divider inside banner
  const innerLineY = brandY + brandBlockHeight;
  doc.setDrawColor(63, 63, 70);
  doc.setLineWidth(0.25);
  doc.line(MARGIN_X + bannerPadX, innerLineY, MARGIN_X + CONTENT_WIDTH - bannerPadX, innerLineY);

  // Wrapped Report Title
  let cursorBannerY = innerLineY + 3;
  drawLines(titleLines, MARGIN_X + bannerPadX, cursorBannerY + titleMetrics.ascent, titleMetrics.lineHeight, 13, 'bold', PALETTE.white);
  cursorBannerY += titleBlockHeight + 2.5;

  // Wrapped Metadata Line(s)
  drawLines(metaLines, MARGIN_X + bannerPadX, cursorBannerY + metaMetrics.ascent, metaMetrics.lineHeight, 8, 'normal', [195, 195, 205]);

  currentY += bannerHeight + 5;

  // Undated records disclosure banner (if applicable)
  if (metadata.undatedCount > 0) {
    const noticeMsg =
      metadata.dateRange !== 'all'
        ? `Disclosure: ${metadata.undatedCount} feedback record(s) without valid timestamps were excluded from this bounded reporting period.`
        : `Disclosure: ${metadata.undatedCount} undated feedback record(s) are included under the All Time reporting period.`;
    const noticeLines = wrap(noticeMsg, CONTENT_WIDTH - 10, 7.8, 'normal');
    const nm = getLineMetrics(7.8, 1.3);
    const noticeH = 4 + noticeLines.length * nm.lineHeight;
    ensureSpace(noticeH + 3);
    doc.setFillColor(...PALETTE.accentBg);
    doc.setDrawColor(...PALETTE.accent);
    doc.setLineWidth(0.25);
    doc.roundedRect(MARGIN_X, currentY, CONTENT_WIDTH, noticeH, 1.2, 1.2, 'FD');
    drawLines(noticeLines, MARGIN_X + 5, currentY + 2 + nm.ascent, nm.lineHeight, 7.8, 'normal', [146, 64, 14]);
    currentY += noticeH + 4;
  }

  // =========================================================================
  // 2. EXECUTIVE OVERVIEW
  // =========================================================================
  if (sections.overview !== false) {
    drawSectionHeader('1. Executive Overview', 'Strategic synopsis synthesized from stored customer feedback.', 24);
    drawFlowTextBox(reportData.executiveSummary, { fontSize: 9, fontStyle: 'normal', leftStripeColor: PALETTE.accent });
  }

  // =========================================================================
  // 3. KEY PERFORMANCE INDICATORS
  // =========================================================================
  if (sections.kpis !== false) {
    const tileGap = 4.5;
    const tileWidth = (CONTENT_WIDTH - tileGap * 2) / 3; // ~57.66mm
    const tileHeight = 19;
    const totalKpiHeight = tileHeight * 2 + 4 + 4;

    drawSectionHeader('2. Key Performance Indicators', 'Portfolio volume, processing status, ratings, and sentiment ratios.', totalKpiHeight);
    ensureSpace(totalKpiHeight);

    const kpiCards = [
      { label: 'Total Responses',  value: String(kpis.totalResponses ?? 0), sub: `${kpis.analyzedCount ?? 0} Analyzed` },
      { label: 'Average Rating',   value: kpis.averageRating === 'N/A' ? 'N/A' : `${kpis.averageRating} / 5.0`, sub: `${kpis.validRatingCount ?? 0} Valid Ratings` },
      { label: 'Positive Share',   value: `${kpis.positivePct ?? 0}%`, sub: `${kpis.positiveCount ?? 0} Positive`, valueColor: PALETTE.positive },
      { label: 'Negative Share',   value: `${kpis.negativePct ?? 0}%`, sub: `${kpis.negativeCount ?? 0} Negative`, valueColor: PALETTE.negative },
      { label: 'Pending AI Queue', value: String(kpis.pendingCount ?? 0), sub: 'Awaiting Processing' },
      { label: 'Failed / Errors',  value: String(kpis.failedCount ?? 0), sub: `${kpis.missingRatingCount ?? 0} Missing Ratings` },
    ];

    kpiCards.forEach((kpi, idx) => {
      const row = Math.floor(idx / 3);
      const col = idx % 3;
      const x = MARGIN_X + col * (tileWidth + tileGap);
      const y = currentY + row * (tileHeight + 4);

      doc.setFillColor(...PALETTE.cardBg);
      doc.setDrawColor(...PALETTE.cardBorder);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, tileWidth, tileHeight, 1.5, 1.5, 'FD');

      const innerMaxW = tileWidth - 7;
      setTypo(7.2, 'normal', PALETTE.textMuted);
      doc.text(fitSingleLine(kpi.label, innerMaxW, 7.2, 'normal'), x + 3.5, y + 5);

      setTypo(11.5, 'bold', kpi.valueColor || PALETTE.textDark);
      doc.text(fitSingleLine(kpi.value, innerMaxW, 11.5, 'bold'), x + 3.5, y + 11.2);

      setTypo(6.8, 'normal', PALETTE.textMuted);
      doc.text(fitSingleLine(kpi.sub, innerMaxW, 6.8, 'normal'), x + 3.5, y + 16);
    });

    currentY += tileHeight * 2 + 10;
  }

  // =========================================================================
  // 4. SENTIMENT ANALYSIS & RATING BREAKDOWN
  // =========================================================================
  const showSentiment = sections.sentiment !== false;
  const showRatings = sections.ratings !== false;

  if (showSentiment || showRatings) {
    const sentimentItems = reportData.sentimentBreakdown || [];
    const ratingItems = reportData.ratingDistribution || [];

    const bothVisible = showSentiment && showRatings;
    const colGap = 6;
    const panelWidth = bothVisible ? (CONTENT_WIDTH - colGap) / 2 : CONTENT_WIDTH;

    // Pre-calculate sentiment panel row measurements
    const sentMetrics = getLineMetrics(7.5, 1.3);
    const sentRowPlans = showSentiment
      ? sentimentItems.map((item) => {
          const statText = `${item.count} (${item.pct}%)`;
          setTypo(7.5, 'bold', PALETTE.textDark);
          const statWidth = Math.max(doc.getTextWidth(statText) + 4, 22);
          const labelMaxW = Math.max(panelWidth - statWidth - 12, 20);
          const labelLines = wrap(item.name, labelMaxW, 7.5, 'normal');
          const rowH = Math.max(7.5, 3.6 + labelLines.length * sentMetrics.lineHeight);
          return { item, statText, labelLines, rowH };
        })
      : [];

    const sentPanelHeight = showSentiment
      ? 6 + Math.max(10, sentRowPlans.reduce((acc, p) => acc + p.rowH + 1.5, 0))
      : 0;
    const ratingPanelHeight = showRatings ? 6 + Math.max(10, ratingItems.length * 9) : 0;
    const combinedPanelHeight = Math.max(sentPanelHeight, ratingPanelHeight);

    const secTitle =
      bothVisible
        ? '3. Sentiment & Rating Distribution'
        : showSentiment
        ? '3. Sentiment Analysis'
        : '3. Rating Breakdown';

    drawSectionHeader(
      secTitle,
      'Granular breakdown across sentiment classifications and verified 1-5 star ratings.',
      Math.min(combinedPanelHeight + 4, 65)
    );
    ensureSpace(combinedPanelHeight + 4);

    const panelStartY = currentY;
    let sentEndY = panelStartY;
    let ratingEndY = panelStartY;

    // Render Sentiment Panel
    if (showSentiment) {
      const sx = MARGIN_X;
      setTypo(8.5, 'bold', PALETTE.textDark);
      doc.text('Sentiment Classification', sx, panelStartY + 3);
      let sy = panelStartY + 6;

      if (sentRowPlans.length === 0) {
        setTypo(7.8, 'italic', PALETTE.textMuted);
        doc.text('No sentiment records available.', sx, sy + 4);
        sy += 8;
      } else {
        sentRowPlans.forEach(({ item, statText, labelLines, rowH }) => {
          doc.setFillColor(...PALETTE.cardBg);
          doc.setDrawColor(...PALETTE.cardBorder);
          doc.setLineWidth(0.2);
          doc.roundedRect(sx, sy, panelWidth, rowH, 1, 1, 'FD');

          const pillColor =
            item.name === 'Positive'
              ? PALETTE.positive
              : item.name === 'Negative'
              ? PALETTE.negative
              : item.name === 'Neutral'
              ? PALETTE.neutral
              : item.name === 'Mixed'
              ? PALETTE.mixed
              : PALETTE.pending;

          doc.setFillColor(...pillColor);
          doc.circle(sx + 4, sy + rowH / 2, 1.5, 'F');

          drawLines(labelLines, sx + 8, sy + 2.2 + sentMetrics.ascent, sentMetrics.lineHeight, 7.5, 'normal', PALETTE.textDark);

          setTypo(7.5, 'bold', PALETTE.textDark);
          doc.text(statText, sx + panelWidth - 3.5, sy + 2.2 + sentMetrics.ascent, { align: 'right' });

          sy += rowH + 1.5;
        });
      }
      sentEndY = sy;
    }

    // Render Rating Panel
    if (showRatings) {
      const rx = bothVisible ? MARGIN_X + panelWidth + colGap : MARGIN_X;
      setTypo(8.5, 'bold', PALETTE.textDark);
      doc.text('Rating Distribution (1 - 5 Stars)', rx, panelStartY + 3);
      let ry = panelStartY + 6;

      const labelColW = 16;
      // Reserve ample right padding for e.g. "9999 (100%)"
      setTypo(7.5, 'normal', PALETTE.textDark);
      const maxStatW = Math.max(
        24,
        ...ratingItems.map((r) => doc.getTextWidth(`${r.count} (${r.pct}%)`) + 4)
      );
      const barStartX = rx + labelColW + 2;
      const barMaxWidth = Math.max(18, panelWidth - labelColW - maxStatW - 7);

      ratingItems.forEach((rat) => {
        const rowH = 7.5;
        doc.setFillColor(...PALETTE.cardBg);
        doc.setDrawColor(...PALETTE.cardBorder);
        doc.setLineWidth(0.2);
        doc.roundedRect(rx, ry, panelWidth, rowH, 1, 1, 'FD');

        setTypo(7.5, 'bold', PALETTE.accent);
        doc.text(`${rat.stars} Star${rat.stars === 1 ? '' : 's'}`, rx + 3.5, ry + 5);

        // Progress track
        doc.setFillColor(...PALETTE.cardBorder);
        doc.roundedRect(barStartX, ry + 2.7, barMaxWidth, 2.2, 0.5, 0.5, 'F');

        const fillW = Math.max(0, Math.min(100, rat.pct)) / 100 * barMaxWidth;
        if (fillW > 0) {
          doc.setFillColor(...PALETTE.accent);
          doc.roundedRect(barStartX, ry + 2.7, fillW, 2.2, 0.5, 0.5, 'F');
        }

        setTypo(7.5, 'normal', PALETTE.textDark);
        doc.text(`${rat.count} (${rat.pct}%)`, rx + panelWidth - 3.5, ry + 5, { align: 'right' });

        ry += rowH + 1.5;
      });
      ratingEndY = ry;
    }

    currentY = Math.max(sentEndY, ratingEndY) + 5;
  }

  // =========================================================================
  // 5. FEEDBACK CATEGORY BREAKDOWN
  // =========================================================================
  if (sections.categories !== false) {
    drawSectionHeader(
      '4. Feedback Category Breakdown',
      'Dynamically detected topic clusters ranked by customer response volume.',
      24
    );

    drawTable({
      columns: [
        { key: 'category', header: 'Category', width: 112, align: 'left' },
        { key: 'count',    header: 'Responses', width: 35,  align: 'right' },
        { key: 'pctLabel', header: 'Share of Total', width: 35, align: 'right', bold: true },
      ],
      rows: (reportData.categoryDistribution || []).map((c) => ({
        category: c.category,
        count: String(c.count),
        pctLabel: `${c.pct}%`,
      })),
      emptyMessage: 'No feedback categories were detected for this reporting period.',
    });
  }

  // =========================================================================
  // 6. CUSTOMER PRAISE & CONCERNS
  // =========================================================================
  if (sections.praise_pain !== false) {
    drawSectionHeader(
      '5. Customer Praise & Recurring Concerns',
      'Evidence-based feedback observations cited directly from stored customer records.',
      28
    );

    const praiseItems = reportData.praiseItems || [];
    const concernItems = reportData.concernItems || [];

    // Positive Sub-header + items
    const subMetrics = getLineMetrics(8.5, 1.3);
    ensureSpace(subMetrics.lineHeight + 12);
    setTypo(8.5, 'bold', PALETTE.positive);
    doc.text(`Positive Customer Observations (${praiseItems.length})`, MARGIN_X, currentY + subMetrics.ascent);
    currentY += subMetrics.lineHeight + 2.5;

    if (praiseItems.length === 0) {
      setTypo(7.8, 'italic', PALETTE.textMuted);
      doc.text('No positive feedback observations logged for this scope.', MARGIN_X + 3, currentY + 3);
      currentY += 8;
    } else {
      praiseItems.forEach((p) => {
        drawFlowListItem(
          `[${p.id || 'N/A'}] ${p.productName} (${p.category}):`,
          `"${p.summary}"`,
          { fontSize: 7.8, accentColor: PALETTE.positive, indent: 5 }
        );
      });
    }

    currentY += 3;

    // Negative Sub-header + items
    ensureSpace(subMetrics.lineHeight + 12);
    setTypo(8.5, 'bold', PALETTE.negative);
    doc.text(`Customer Friction Points & Concerns (${concernItems.length})`, MARGIN_X, currentY + subMetrics.ascent);
    currentY += subMetrics.lineHeight + 2.5;

    if (concernItems.length === 0) {
      setTypo(7.8, 'italic', PALETTE.textMuted);
      doc.text('No negative feedback observations logged for this scope.', MARGIN_X + 3, currentY + 3);
      currentY += 8;
    } else {
      concernItems.forEach((c) => {
        drawFlowListItem(
          `[${c.id || 'N/A'}] ${c.productName} (${c.category}):`,
          `"${c.summary}"`,
          { fontSize: 7.8, accentColor: PALETTE.negative, indent: 5 }
        );
      });
    }

    currentY += 4;
  }

  // =========================================================================
  // 7. CROSS-PRODUCT COMPARISON (All Products Scope Only)
  // =========================================================================
  if (sections.product_comparison !== false && metadata.productScope === 'ALL') {
    const compRows = reportData.productComparison || [];
    drawSectionHeader(
      '6. Cross-Product Performance Comparison',
      'Comparative benchmark across the registered product portfolio.',
      24
    );

    drawTable({
      columns: [
        { key: 'productLabel', header: 'Product Name (ID)', width: 78, align: 'left' },
        { key: 'total',        header: 'Responses',         width: 26, align: 'right' },
        { key: 'avgRating',    header: 'Avg Rating',        width: 26, align: 'right', bold: true },
        { key: 'posShare',     header: 'Positive %',        width: 26, align: 'right', color: PALETTE.positive },
        { key: 'negShare',     header: 'Negative %',        width: 26, align: 'right', color: PALETTE.negative },
      ],
      rows: compRows.map((p) => ({
        productLabel: `${p.productName} (${p.productId})`,
        total: String(p.totalFeedback),
        avgRating: p.averageRating === 'N/A' ? 'N/A' : `${p.averageRating} / 5`,
        posShare: `${p.positivePct}%`,
        negShare: `${p.negativePct}%`,
      })),
      emptyMessage: 'No registered products found to compare.',
    });
  }

  // =========================================================================
  // 8. SUGGESTED IMPROVEMENT ACTIONS
  // =========================================================================
  if (sections.actions !== false) {
    const streams = reportData.actionStreams || [];
    drawSectionHeader(
      '7. Suggested Improvement Actions',
      'Prioritized action items grouped by stream and anchored to stored Response IDs.',
      24
    );

    if (streams.length === 0) {
      ensureSpace(10);
      setTypo(8, 'italic', PALETTE.textMuted);
      doc.text('No suggested improvement actions are stored for this selection.', MARGIN_X, currentY + 4);
      currentY += 10;
    } else {
      const streamTitleMetrics = getLineMetrics(8.5, 1.3);
      streams.forEach((streamObj) => {
        // Keep stream subheading together with at least first action line
        ensureSpace(streamTitleMetrics.lineHeight + 12);
        setTypo(8.5, 'bold', PALETTE.accent);
        doc.text(sanitizePdfText(streamObj.stream), MARGIN_X, currentY + streamTitleMetrics.ascent);
        currentY += streamTitleMetrics.lineHeight + 2;

        streamObj.items.forEach((item) => {
          drawFlowListItem(
            '->',
            `${item.action} [Ref: ${item.responseId || 'General'}]`,
            { fontSize: 7.8, indent: 4 }
          );
        });
        currentY += 2.5;
      });
    }
  }

  // =========================================================================
  // 9. SUPPORTING FEEDBACK EVIDENCE LOG
  // =========================================================================
  if (sections.references !== false) {
    const refs = reportData.supportingReferences || [];
    drawSectionHeader(
      '8. Supporting Feedback Evidence Log',
      'Detailed feedback extracts supporting the findings of this executive report.',
      26
    );

    // Column widths sum: 28 + 32 + 18 + 24 + 80 = 182mm === CONTENT_WIDTH
    drawTable({
      fontSize: 7,
      headerFontSize: 7.2,
      columns: [
        { key: 'responseId',  header: 'Response ID',        width: 28, align: 'left' },
        { key: 'productName', header: 'Product',            width: 32, align: 'left' },
        { key: 'rating',      header: 'Rating',             width: 18, align: 'center' },
        { key: 'sentiment',   header: 'Sentiment',          width: 24, align: 'left', bold: true, colorFn: (row) => {
          const s = (row.sentiment || '').toLowerCase();
          if (s === 'positive') return PALETTE.positive;
          if (s === 'negative') return PALETTE.negative;
          if (s === 'neutral') return PALETTE.neutral;
          if (s === 'mixed') return PALETTE.mixed;
          return PALETTE.textMuted;
        }},
        { key: 'summary',     header: 'Summary / Extract',  width: 80, align: 'left' },
      ],
      rows: refs,
      emptyMessage: 'No supporting feedback records matched this scope and period.',
    });
  }

  // =========================================================================
  // 10. PASS OVER ALL PAGES: RUNNING HEADERS (Pages 2+) & FOOTERS (All Pages)
  // =========================================================================
  const totalPages = doc.internal.getNumberOfPages();
  const safeScope = fitSingleLine(metadata.productScopeLabel || 'All Products', 68, 7.5, 'normal');
  const safeDate = sanitizePdfText(metadata.generatedDateISO || '');

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Running header on pages 2+
    if (p > 1) {
      setTypo(7.5, 'normal', PALETTE.textMuted);
      doc.text('FeedbackIQ Executive Intelligence', MARGIN_X, RUNNING_HEADER_TEXT_Y);
      doc.text(safeScope, PAGE_WIDTH / 2, RUNNING_HEADER_TEXT_Y, { align: 'center' });
      doc.text(safeDate, PAGE_WIDTH - MARGIN_X, RUNNING_HEADER_TEXT_Y, { align: 'right' });

      doc.setDrawColor(...PALETTE.cardBorder);
      doc.setLineWidth(0.3);
      doc.line(MARGIN_X, RUNNING_HEADER_LINE_Y, PAGE_WIDTH - MARGIN_X, RUNNING_HEADER_LINE_Y);
    }

    // Running footer on every page
    doc.setDrawColor(...PALETTE.cardBorder);
    doc.setLineWidth(0.3);
    doc.line(MARGIN_X, FOOTER_LINE_Y, PAGE_WIDTH - MARGIN_X, FOOTER_LINE_Y);

    setTypo(7.5, 'normal', PALETTE.textMuted);
    doc.text('FeedbackIQ Confidential Executive Analysis  -  Prepared for Management', MARGIN_X, FOOTER_TEXT_Y);
    doc.text(`Page ${p} of ${totalPages}`, PAGE_WIDTH - MARGIN_X, FOOTER_TEXT_Y, { align: 'right' });
  }

  return doc;
}

/**
 * Generates and downloads the executive PDF report in the browser.
 *
 * @param {Object} reportData - Aggregated report object from reportDataService
 * @returns {Promise<void>}
 */
export async function exportReportToPdf(reportData) {
  const doc = buildReportPdfDocument(reportData);
  const cleanScope = (reportData?.metadata?.productScope || 'All')
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .slice(0, 20);
  const datePart = reportData?.metadata?.generatedDateISO || new Date().toISOString().split('T')[0];
  const fileName = `FeedbackIQ_Executive_Report_${cleanScope}_${datePart}.pdf`;

  doc.save(fileName);
}
