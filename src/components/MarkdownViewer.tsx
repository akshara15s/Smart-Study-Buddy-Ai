import React from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownViewerProps {
  content: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = React.useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = '';
  let codeBlockCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        const codeText = codeBuffer.join('\n');
        const currentIndex = codeBlockCounter++;
        blocks.push(
          <div key={`code-${i}`} className="my-4 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 overflow-hidden shadow-md">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 text-xs font-mono text-slate-400 border-b border-slate-700">
              <span className="uppercase tracking-wider font-semibold text-red-400">
                {codeLanguage || 'code'}
              </span>
              <button
                onClick={() => handleCopyCode(codeText, currentIndex)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors text-xs"
              >
                {copiedCodeIndex === currentIndex ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-sm font-mono overflow-x-auto leading-relaxed selection:bg-red-600 selection:text-white">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBuffer = [];
        codeLanguage = '';
      } else {
        inCodeBlock = true;
        codeLanguage = line.trim().replace('```', '');
        codeBuffer = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Headers
    if (line.startsWith('# ')) {
      blocks.push(
        <h1 key={`h1-${i}`} className="text-2xl md:text-3xl font-extrabold text-red-950 mt-6 mb-3 pb-2 border-b border-red-100 flex items-center gap-2">
          {renderInline(line.substring(2))}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={`h2-${i}`} className="text-xl md:text-2xl font-bold text-red-900 mt-5 mb-2.5 flex items-center gap-2">
          {renderInline(line.substring(3))}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={`h3-${i}`} className="text-lg md:text-xl font-semibold text-red-850 mt-4 mb-2">
          {renderInline(line.substring(4))}
        </h3>
      );
    } else if (line.startsWith('#### ')) {
      blocks.push(
        <h4 key={`h4-${i}`} className="text-base font-semibold text-slate-800 mt-3 mb-1">
          {renderInline(line.substring(5))}
        </h4>
      );
    } else if (line.startsWith('> ')) {
      // Blockquote / Tip / Gotcha
      blocks.push(
        <blockquote
          key={`quote-${i}`}
          className="my-3 pl-4 py-2 border-l-4 border-red-500 bg-red-50/60 rounded-r-lg text-slate-700 italic text-sm md:text-base leading-relaxed"
        >
          {renderInline(line.substring(2))}
        </blockquote>
      );
    } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const indent = line.search(/\S/);
      const contentText = line.trim().substring(2);
      blocks.push(
        <li
          key={`li-${i}`}
          style={{ marginLeft: `${Math.max(1, Math.floor(indent / 2) + 1) * 1.25}rem` }}
          className="text-slate-700 my-1 list-disc list-outside leading-relaxed text-sm md:text-base marker:text-red-500"
        >
          {renderInline(contentText)}
        </li>
      );
    } else if (/^\d+\.\s/.test(line.trim())) {
      const match = line.trim().match(/^(\d+)\.\s(.*)/);
      if (match) {
        blocks.push(
          <div key={`num-${i}`} className="flex items-start gap-2.5 my-1.5 text-sm md:text-base text-slate-700">
            <span className="font-semibold text-red-600 shrink-0 w-6 text-right">{match[1]}.</span>
            <div className="flex-1 leading-relaxed">{renderInline(match[2])}</div>
          </div>
        );
      }
    } else if (line.trim() === '---' || line.trim() === '***') {
      blocks.push(<hr key={`hr-${i}`} className="my-6 border-t border-slate-200" />);
    } else if (line.trim().length > 0) {
      blocks.push(
        <p key={`p-${i}`} className="text-slate-700 my-2 leading-relaxed text-sm md:text-base">
          {renderInline(line)}
        </p>
      );
    }
  }

  function renderInline(text: string): React.ReactNode {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-mono text-[0.875em] border border-red-200/70 font-medium"
          >
            {part.slice(1, -1)}
          </code>
        );
      } else if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      } else if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={idx} className="italic text-slate-800">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  }

  return <div className="space-y-1 text-slate-800">{blocks}</div>;
};
