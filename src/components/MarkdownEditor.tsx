import React, { useRef } from 'react';
import { Bold, Eye, Italic, List, ListOrdered, Pencil, Table2 } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showPreviewToggle?: boolean;
}

const TOOLBAR_BUTTON_CLASS =
  'p-1.5 rounded-md text-secondary-theme hover:bg-card-hover hover:text-primary-theme';

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  showPreviewToggle = true,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPreview, setIsPreview] = React.useState(false);

  const applyMarkdown = (format: 'bold' | 'italic' | 'bullet' | 'numbered' | 'table') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    let replacement: string;

    if (format === 'bold' || format === 'italic') {
      const marker = format === 'bold' ? '**' : '*';
      replacement = `${marker}${selected || (format === 'bold' ? 'bold text' : 'italic text')}${marker}`;
    } else if (format === 'bullet' || format === 'numbered') {
      const lines = (selected || 'List item').split('\n');
      replacement = lines
        .map((line, index) => `${format === 'bullet' ? '- ' : `${index + 1}. `}${line}`)
        .join('\n');
    } else {
      replacement = '| Column 1 | Column 2 |\n| --- | --- |\n| Value | Value |';
    }

    const nextValue = `${value.slice(0, start)}${replacement}${value.slice(end)}`;
    onChange(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + replacement.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className={`flex flex-col min-h-0 ${className}`}>
      <div className="flex items-center gap-1 p-1 rounded-t-xl bg-secondary-theme border border-theme border-b-0">
        <button type="button" className={TOOLBAR_BUTTON_CLASS} title="Bold" aria-label="Bold" onMouseDown={(e) => e.preventDefault()} onClick={() => applyMarkdown('bold')}>
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" className={TOOLBAR_BUTTON_CLASS} title="Italic" aria-label="Italic" onMouseDown={(e) => e.preventDefault()} onClick={() => applyMarkdown('italic')}>
          <Italic className="w-4 h-4" />
        </button>
        <span className="h-5 border-l border-theme mx-1" />
        <button type="button" className={TOOLBAR_BUTTON_CLASS} title="Bullet list" aria-label="Bullet list" onMouseDown={(e) => e.preventDefault()} onClick={() => applyMarkdown('bullet')}>
          <List className="w-4 h-4" />
        </button>
        <button type="button" className={TOOLBAR_BUTTON_CLASS} title="Numbered list" aria-label="Numbered list" onMouseDown={(e) => e.preventDefault()} onClick={() => applyMarkdown('numbered')}>
          <ListOrdered className="w-4 h-4" />
        </button>
        <span className="h-5 border-l border-theme mx-1" />
        <button type="button" className={TOOLBAR_BUTTON_CLASS} title="Insert table" aria-label="Insert table" onMouseDown={(e) => e.preventDefault()} onClick={() => applyMarkdown('table')}>
          <Table2 className="w-4 h-4" />
        </button>
        {showPreviewToggle ? (
          <button
            type="button"
            className={`${TOOLBAR_BUTTON_CLASS} ml-auto flex items-center gap-1 text-[10px]`}
            onClick={() => setIsPreview((previous) => !previous)}
            aria-label={isPreview ? 'Edit Markdown' : 'Preview formatting'}
          >
            {isPreview ? <Pencil className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {isPreview ? 'Edit' : 'Preview'}
          </button>
        ) : (
          <span className="ml-auto pr-2 text-[10px] text-muted-theme">Markdown formatting</span>
        )}
      </div>
      {isPreview && showPreviewToggle ? (
        <div className="flex-1 min-h-[180px] overflow-y-auto p-3.5 rounded-b-xl bg-input-theme border border-theme text-primary-theme">
          {value ? <MarkdownPreview content={value} /> : <span className="text-muted-theme italic">Nothing to preview yet.</span>}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 w-full min-h-[180px] p-3.5 rounded-b-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm resize-none font-mono leading-relaxed"
        />
      )}
    </div>
  );
};

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g);
  return tokens.map((token, index) => {
    if ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('__') && token.endsWith('__'))) {
      return <strong key={`${keyPrefix}-${index}`}>{token.slice(2, -2)}</strong>;
    }
    if ((token.startsWith('*') && token.endsWith('*')) || (token.startsWith('_') && token.endsWith('_'))) {
      return <em key={`${keyPrefix}-${index}`}>{token.slice(1, -1)}</em>;
    }
    return token;
  });
}

function splitTableRow(line: string): string[] {
  return line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  return /^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.includes('-');
}

function isListLine(line: string): boolean {
  return /^\s*(?:[-*+]|\d+\.)\s+/.test(line);
}

export const MarkdownPreview: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.includes('|') && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      const headers = splitTableRow(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }
      blocks.push(
        <div key={`table-${index}`} className="overflow-x-auto my-3">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr>{headers.map((cell, cellIndex) => <th key={cellIndex} className="border border-theme px-2 py-1 font-bold">{renderInline(cell, `th-${index}-${cellIndex}`)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((_, cellIndex) => <td key={cellIndex} className="border border-theme px-2 py-1">{renderInline(row[cellIndex] || '', `td-${index}-${rowIndex}-${cellIndex}`)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      const HeadingTag = `h${heading[1].length}` as 'h1' | 'h2' | 'h3';
      blocks.push(<HeadingTag key={`heading-${index}`} className="font-bold my-2">{renderInline(heading[2], `heading-${index}`)}</HeadingTag>);
      index += 1;
      continue;
    }

    if (isListLine(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items: string[] = [];
      while (index < lines.length && isListLine(lines[index]) && /^\s*\d+\.\s+/.test(lines[index]) === ordered) {
        items.push(lines[index].replace(/^\s*(?:[-*+]|\d+\.)\s+/, ''));
        index += 1;
      }
      const ListTag = ordered ? 'ol' : 'ul';
      blocks.push(
        <ListTag key={`list-${index}`} className={`my-2 pl-6 ${ordered ? 'list-decimal' : 'list-disc'}`}>
          {items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item, `list-${index}-${itemIndex}`)}</li>)}
        </ListTag>
      );
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,3})\s+/.test(lines[index]) &&
      !isListLine(lines[index]) &&
      !(lines[index].includes('|') && index + 1 < lines.length && isTableSeparator(lines[index + 1]))
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push(
      <p key={`paragraph-${index}`} className="my-2">
        {paragraph.map((part, partIndex) => <React.Fragment key={partIndex}>{partIndex > 0 && <br />}{renderInline(part, `paragraph-${index}-${partIndex}`)}</React.Fragment>)}
      </p>
    );
  }

  return <div className="max-w-none text-sm leading-relaxed">{blocks}</div>;
};
