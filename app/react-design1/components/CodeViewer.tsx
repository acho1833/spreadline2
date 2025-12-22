'use client';

import { useState } from 'react';

interface CodeViewerProps {
  code: string;
  language?: string;
  title?: string;
  defaultExpanded?: boolean;
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

  // Simple syntax highlighting
  const highlightCode = (code: string) => {
    return code
      // Keywords
      .replace(/\b(const|let|var|function|return|if|else|for|while|import|export|default|interface|type|extends|implements|class|new|this|async|await|try|catch|throw)\b/g,
        '<span class="text-purple-400">$1</span>')
      // Types
      .replace(/\b(string|number|boolean|void|null|undefined|any|never|unknown|React|HTMLElement|SVGElement)\b/g,
        '<span class="text-cyan-400">$1</span>')
      // Functions and methods
      .replace(/(\w+)(?=\()/g, '<span class="text-yellow-300">$1</span>')
      // Strings
      .replace(/(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, '<span class="text-green-400">$&</span>')
      // Numbers
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-orange-400">$1</span>')
      // Comments
      .replace(/(\/\/.*$)/gm, '<span class="text-slate-500">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-slate-500">$1</span>')
      // JSX tags
      .replace(/(&lt;\/?[\w]+)/g, '<span class="text-blue-400">$1</span>')
      .replace(/(\/>|&gt;)/g, '<span class="text-blue-400">$1</span>');
  };

  const escapeHtml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  return (
    <div className="mt-4 rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
      {/* Header */}
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

      {/* Code Block */}
      {isExpanded && (
        <div className="relative">
          <pre className="p-4 overflow-x-auto text-sm leading-relaxed bg-slate-950">
            <code
              className="font-mono"
              dangerouslySetInnerHTML={{ __html: highlightCode(escapeHtml(code)) }}
            />
          </pre>
          {/* Line numbers overlay */}
          <div className="absolute top-0 left-0 p-4 select-none pointer-events-none">
            <div className="flex flex-col text-slate-600 text-sm font-mono leading-relaxed pr-4 border-r border-slate-800">
              {code.split('\n').map((_, i) => (
                <span key={i}>{String(i + 1).padStart(3, ' ')}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export code snippets for each component
export const CODE_SNIPPETS = {
  types: `// Types for SpreadLine components
export interface Point {
  id: number;
  name: string;
  label: string;
  posX: number;
  posY: number;
  scaleX: number;  // PCA position (0-1)
  scaleY: number;  // PCA position (0-1)
  group: number;
  visibility: 'visible' | 'hidden';
}

export interface Storyline {
  id: number;
  name: string;
  color: string;
  lines: string[];    // SVG path strings
  lifespan: number;
  crossingCheck: boolean;
}`,

  timeAxis: `// TimeAxis Component
function TimeAxis({ timeLabels, heightExtent, getShiftX }) {
  return (
    <g className="time-axis">
      {timeLabels.map((tl) => {
        const shift = getShiftX(tl.posX);
        return (
          <g key={tl.label} transform={\`translate(\${shift}, 0)\`}>
            <text
              x={tl.posX}
              y={-30}
              fill="#94a3b8"
              fontSize="13"
              textAnchor="middle"
            >
              {tl.label}
            </text>
            <line
              x1={tl.posX}
              y1={-20}
              x2={tl.posX}
              y2={heightExtent}
              stroke="#334155"
              strokeDasharray="4"
              opacity="0.4"
            />
          </g>
        );
      })}
    </g>
  );
}`,

  storyline: `// Storyline Component
function Storyline({
  storyline,
  isEgo,
  isHighlighted,
  getShiftX,
  onHover,
  onPin
}) {
  return (
    <g
      className={\`storyline \${isHighlighted ? 'opacity-100' : 'opacity-20'}\`}
      onMouseEnter={() => onHover(storyline.name)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onPin(storyline.name)}
    >
      {storyline.lines.map((line, idx) => {
        const startX = parseFloat(line.match(/M([\\d.]+)/)?.[1] || '0');
        return (
          <path
            key={idx}
            d={line}
            transform={\`translate(\${getShiftX(startX)}, 0)\`}
            stroke={storyline.color}
            strokeWidth={isEgo ? 6 : isHighlighted ? 4 : 2}
            fill="none"
          />
        );
      })}
    </g>
  );
}`,

  block: `// Block Component with Expansion
function Block({
  block,
  isExpanded,
  animProgress,
  onToggleExpand
}) {
  const expandW = block.moveX * easeOutQuad(animProgress);

  return (
    <g onClick={onToggleExpand}>
      {/* Background when expanded */}
      {animProgress > 0 && (
        <rect
          x={baseX - expandW / 2}
          y={minY}
          width={blockWidth + expandW}
          height={blockHeight}
          rx="20"
          fill="white"
          opacity={animProgress * 0.95}
        />
      )}

      {/* Left and Right arcs */}
      <path
        d={block.outline.left}
        transform={\`translate(\${-expandW / 2}, 0)\`}
        stroke={isExpanded ? "#3b82f6" : "#64748b"}
        strokeWidth="2"
        fill="none"
      />

      {/* Points spread based on PCA */}
      {block.points.map((pt) => {
        const px = baseX + computeEmbedding(pt.scaleX, expandW);
        const py = topY + computeEmbedding(pt.scaleY, expandW);
        return <NodePoint key={pt.id} cx={px} cy={py} />;
      })}
    </g>
  );
}`,

  nodePoint: `// NodePoint Component
function NodePoint({
  point,
  cx,
  cy,
  isHighlighted,
  onHover,
  onPin
}) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={point.name === ego ? 8 : 6}
      fill={getNodeColor(parseInt(point.label))}
      stroke={isHighlighted ? "#000" : "#666"}
      strokeWidth={isHighlighted ? 2 : 1}
      className="cursor-pointer transition-all"
      onMouseEnter={(e) => onHover(point.name, e)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onPin(point.name)}
    />
  );
}

// Color scale function
function getNodeColor(label: number) {
  if (label < 10) return '#ffffff';
  if (label < 50) return '#fcdaca';
  if (label < 100) return '#e599a6';
  if (label < 500) return '#c94b77';
  return '#740980';
}`,

  filterControls: `// FilterControls Component
function FilterControls({
  minLifespan,
  maxLifespan,
  crossingOnly,
  onLifespanChange,
  onCrossingChange,
  filteredCount,
  totalCount
}) {
  return (
    <div className="flex items-center gap-6">
      <div>
        <label>Min Years: {minLifespan}</label>
        <input
          type="range"
          min="1"
          max={maxLifespan}
          value={minLifespan}
          onChange={(e) => onLifespanChange(parseInt(e.target.value))}
        />
      </div>

      <label>
        <input
          type="checkbox"
          checked={crossingOnly}
          onChange={(e) => onCrossingChange(e.target.checked)}
        />
        Crossing Only
      </label>

      <div>
        {filteredCount} of {totalCount} alters visible
      </div>
    </div>
  );
}`,

  computeEmbedding: `// Point positioning with PCA values
const computeEmbedding = (scale: number, length: number): number => {
  const whiteSpace = 0.15;
  return (scale + whiteSpace / 2) * length * (1 - whiteSpace);
};

// Usage: When block expands by 180px
const expandWidth = 180;
const px = computeEmbedding(point.scaleX, expandWidth);
const py = computeEmbedding(point.scaleY, expandWidth);

// scaleX=0.5 with length=180 => ~85px from left
// scaleY=0.5 with length=180 => ~85px from top`,

  animation: `// Animation with requestAnimationFrame
const [animProgress, setAnimProgress] = useState<{[id: number]: number}>({});

useEffect(() => {
  const interval = setInterval(() => {
    setAnimProgress((prev) => {
      const next = { ...prev };

      // Animate expanding blocks
      expandedBlocks.forEach((id) => {
        if ((next[id] || 0) < 1) {
          next[id] = Math.min(1, (next[id] || 0) + 0.05);
        }
      });

      // Animate collapsing blocks
      Object.keys(next).forEach((k) => {
        const id = parseInt(k);
        if (!expandedBlocks.has(id) && next[id] > 0) {
          next[id] = Math.max(0, next[id] - 0.05);
        }
      });

      return next;
    });
  }, 16); // ~60fps

  return () => clearInterval(interval);
}, [expandedBlocks]);

// Easing function
const easeOutQuad = (t: number) => t * (2 - t);`,
};
