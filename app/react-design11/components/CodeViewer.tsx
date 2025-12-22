'use client';

import { useState } from 'react';

interface CodeViewerProps {
  code: string;
  language?: string;
  title?: string;
  defaultExpanded?: boolean;
}

function highlightSyntax(code: string): React.ReactNode[] {
  const lines = code.split('\n');

  return lines.map((line, lineIdx) => {
    const tokens: React.ReactNode[] = [];
    let remaining = line;
    let keyIdx = 0;

    while (remaining.length > 0) {
      let matched = false;

      // Comments
      const commentMatch = remaining.match(/^(\/\/.*)/)
      if (commentMatch) {
        tokens.push(<span key={keyIdx++} className="text-slate-500">{commentMatch[1]}</span>);
        remaining = remaining.slice(commentMatch[1].length);
        matched = true;
        continue;
      }

      // Strings
      const stringMatch = remaining.match(/^(["'`])(?:[^\\]|\\.)*?\1/);
      if (stringMatch) {
        tokens.push(<span key={keyIdx++} className="text-green-400">{stringMatch[0]}</span>);
        remaining = remaining.slice(stringMatch[0].length);
        matched = true;
        continue;
      }

      // Keywords
      const keywordMatch = remaining.match(/^(const|let|var|function|return|if|else|for|while|import|export|default|interface|type|extends|class|new|async|await|from|typeof|instanceof|this)\b/);
      if (keywordMatch) {
        tokens.push(<span key={keyIdx++} className="text-purple-400">{keywordMatch[1]}</span>);
        remaining = remaining.slice(keywordMatch[1].length);
        matched = true;
        continue;
      }

      // D3 specific
      const d3Match = remaining.match(/^(d3|transition|selection|attr|style|on|call|datum|data|join|enter|exit|append|remove|select|selectAll|forceSimulation|forceX|forceY|forceCollide|brushX|interpolate|easeQuadInOut|path)\b/);
      if (d3Match) {
        tokens.push(<span key={keyIdx++} className="text-orange-400">{d3Match[1]}</span>);
        remaining = remaining.slice(d3Match[1].length);
        matched = true;
        continue;
      }

      // Types
      const typeMatch = remaining.match(/^(string|number|boolean|void|null|undefined|any|React|Set|Map|Array|Object|Promise|SVGSVGElement|SVGGElement)\b/);
      if (typeMatch) {
        tokens.push(<span key={keyIdx++} className="text-cyan-400">{typeMatch[1]}</span>);
        remaining = remaining.slice(typeMatch[1].length);
        matched = true;
        continue;
      }

      // Numbers
      const numberMatch = remaining.match(/^(\d+\.?\d*)/);
      if (numberMatch) {
        tokens.push(<span key={keyIdx++} className="text-orange-400">{numberMatch[1]}</span>);
        remaining = remaining.slice(numberMatch[1].length);
        matched = true;
        continue;
      }

      // Function calls
      const funcMatch = remaining.match(/^(\w+)(?=\()/);
      if (funcMatch) {
        tokens.push(<span key={keyIdx++} className="text-yellow-300">{funcMatch[1]}</span>);
        remaining = remaining.slice(funcMatch[1].length);
        matched = true;
        continue;
      }

      // JSX tags
      const jsxMatch = remaining.match(/^(<\/?[A-Z]\w*|<\/?[a-z]+)/);
      if (jsxMatch) {
        tokens.push(<span key={keyIdx++} className="text-blue-400">{jsxMatch[0]}</span>);
        remaining = remaining.slice(jsxMatch[0].length);
        matched = true;
        continue;
      }

      if (!matched) {
        tokens.push(<span key={keyIdx++} className="text-slate-300">{remaining[0]}</span>);
        remaining = remaining.slice(1);
      }
    }

    return (
      <div key={lineIdx} className="leading-6">
        <span className="inline-block w-10 text-slate-600 text-right pr-4 select-none">
          {lineIdx + 1}
        </span>
        {tokens.length > 0 ? tokens : <span>&nbsp;</span>}
      </div>
    );
  });
}

export default function CodeViewer({
  code,
  language = 'tsx',
  title = 'View Source Code',
  defaultExpanded = false
}: CodeViewerProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-slate-800 hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-300 font-medium text-sm">{title}</span>
          <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-400">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <button
              onClick={(e) => { e.stopPropagation(); handleCopy(); }}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
          <span className="text-slate-500 text-xs">{code.split('\n').length} lines</span>
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 overflow-x-auto bg-slate-950 font-mono text-sm">
          {highlightSyntax(code)}
        </div>
      )}
    </div>
  );
}
