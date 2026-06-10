import type { LessonNote } from '@/lib/storage-types';
import type { Lesson, Block } from './types';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Escape text and convert **bold** markers to <strong>. */
function inline(s: string): string {
  const parts = esc(s).split('**');
  if (parts.length === 1) return parts[0];
  return parts
    .map((p, i) => (i % 2 === 1 ? `<strong>${p}</strong>` : p))
    .join('');
}

function blockHtml(block: Block): string {
  switch (block.type) {
    case 'p':
      return `<p>${inline(block.text)}</p>`;
    case 'list':
      return `<ul>${block.items.map(i => `<li>${inline(i)}</li>`).join('')}</ul>`;
    case 'tip':
      return `<div class="tip"><strong>Exam Tip:</strong> ${inline(block.text)}</div>`;
    default:
      return '';
  }
}

function noteHtml(note: LessonNote): string {
  return `<div class="note"><strong>📝 My note:</strong> ${esc(note.text).replace(/\n/g, '<br>')}</div>`;
}

const STYLES = `
  body { font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; line-height: 1.55; margin: 2rem auto; max-width: 46rem; padding: 0 1.5rem; }
  h1 { font-size: 1.6rem; border-bottom: 3px solid #2e7d32; padding-bottom: 0.4rem; }
  h2 { font-size: 1.3rem; color: #2e7d32; margin-top: 2.2rem; page-break-after: avoid; }
  h3 { font-size: 1.05rem; margin-top: 1.5rem; page-break-after: avoid; }
  ul { padding-left: 1.4rem; }
  li { margin-bottom: 0.35rem; }
  .tip { background: #eef6ee; border-left: 4px solid #2e7d32; padding: 0.6rem 0.9rem; margin: 0.8rem 0; page-break-inside: avoid; font-size: 0.95rem; }
  .note { background: #fffde7; border-left: 4px solid #f9a825; padding: 0.6rem 0.9rem; margin: 0.8rem 0; page-break-inside: avoid; font-size: 0.95rem; }
  .lesson { page-break-before: always; }
  .lesson:first-of-type { page-break-before: auto; }
  .meta { color: #777; font-size: 0.85rem; }
  @media print { body { margin: 0.5rem; max-width: none; } }
`;

export interface PdfOptions {
  /** Lessons to include, in order. */
  lessons: Lesson[];
  /** All user notes (filtered per lesson internally). */
  notes: LessonNote[];
  /** When set (and a single lesson is given), include only this section index. */
  sectionIndex?: number;
  title: string;
}

/**
 * Opens a print-ready window with the study guide; the browser's print
 * dialog lets the user save it as a PDF.
 */
export function generateStudyGuidePdf({ lessons, notes, sectionIndex, title }: PdfOptions): void {
  const parts: string[] = [];
  parts.push(`<h1>${esc(title)}</h1>`);
  parts.push(`<p class="meta">Generated ${new Date().toLocaleDateString()} · FL 2-40 Health Study App</p>`);

  for (const lesson of lessons) {
    parts.push(`<div class="lesson"><h2>${esc(lesson.module)} — ${esc(lesson.title)}</h2>`);
    lesson.sections.forEach((section, i) => {
      if (sectionIndex !== undefined && sectionIndex >= 0 && i !== sectionIndex) return;
      parts.push(`<h3>${esc(section.heading)}</h3>`);
      section.blocks.forEach((block, j) => {
        parts.push(blockHtml(block));
        notes
          .filter(n => n.module === lesson.module && n.sectionIndex === i && n.blockIndex === j)
          .forEach(n => parts.push(noteHtml(n)));
      });
    });
    parts.push('</div>');
  }

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${STYLES}</style></head>
<body>${parts.join('\n')}
<script>window.addEventListener('load', function() { setTimeout(function() { window.print(); }, 250); });</scr` + `ipt>
</body></html>`;

  const win = window.open('', '_blank');
  if (!win) {
    alert('Please allow pop-ups to generate the PDF study guide.');
    return;
  }
  win.document.write(html);
  win.document.close();
}
