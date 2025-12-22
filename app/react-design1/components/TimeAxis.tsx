'use client';

import { TimeLabel, Annotation } from './types';

interface TimeAxisProps {
  timeLabels: TimeLabel[];
  heightExtent: number;
  getShiftX?: (posX: number) => number;
  annotations?: Annotation[];
}

export default function TimeAxis({
  timeLabels,
  heightExtent,
  getShiftX = () => 0,
  annotations = []
}: TimeAxisProps) {
  return (
    <g className="time-axis">
      {/* Time labels and vertical rules */}
      {timeLabels.map((tl) => {
        const shift = getShiftX(tl.posX);
        const annotation = annotations.find(a => a.time === tl.label);

        return (
          <g key={tl.label} transform={`translate(${shift}, 0)`}>
            {/* Time label */}
            <text
              x={tl.posX}
              y={-30}
              fill={annotation ? annotation.color : "#94a3b8"}
              fontSize="13"
              textAnchor="middle"
              fontWeight="bold"
              className="select-none"
            >
              {tl.label}
            </text>

            {/* Vertical rule */}
            <line
              x1={tl.posX}
              y1={-20}
              x2={tl.posX}
              y2={heightExtent}
              stroke="#334155"
              strokeDasharray="4"
              opacity="0.4"
            />

            {/* Annotation text */}
            {annotation && (
              <text
                x={tl.posX}
                y={-50}
                fill={annotation.color}
                fontSize="11"
                textAnchor="middle"
                fontWeight="bold"
                className="select-none"
              >
                {annotation.text}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

// Demo version with animation
interface TimeAxisDemoProps {
  showLabels?: boolean;
  showRules?: boolean;
  showAnnotations?: boolean;
  animated?: boolean;
}

export function TimeAxisDemo({
  showLabels = true,
  showRules = true,
  showAnnotations = false,
  animated = false
}: TimeAxisDemoProps) {
  const demoLabels: TimeLabel[] = [
    { label: '2002', posX: 100 },
    { label: '2004', posX: 200 },
    { label: '2006', posX: 300 },
    { label: '2008', posX: 400 },
    { label: '2010', posX: 500 },
  ];

  const demoAnnotations: Annotation[] = [
    { time: '2004', text: 'UC Berkeley', color: '#CB1B45' },
    { time: '2009', text: 'Stanford', color: '#CB1B45' },
  ];

  return (
    <svg viewBox="0 0 600 200" className="w-full bg-slate-950 rounded-xl">
      <g transform="translate(0, 80)">
        {demoLabels.map((tl, idx) => {
          const annotation = showAnnotations ? demoAnnotations.find(a => a.time === tl.label) : null;
          const delay = animated ? idx * 0.1 : 0;

          return (
            <g
              key={tl.label}
              style={{
                opacity: 1,
                animation: animated ? `fadeIn 0.5s ease-out ${delay}s both` : 'none'
              }}
            >
              {/* Time label */}
              {showLabels && (
                <text
                  x={tl.posX}
                  y={-30}
                  fill={annotation ? annotation.color : "#94a3b8"}
                  fontSize="13"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {tl.label}
                </text>
              )}

              {/* Vertical rule */}
              {showRules && (
                <line
                  x1={tl.posX}
                  y1={-20}
                  x2={tl.posX}
                  y2={100}
                  stroke="#334155"
                  strokeDasharray="4"
                  opacity="0.4"
                />
              )}

              {/* Annotation */}
              {annotation && (
                <text
                  x={tl.posX}
                  y={-50}
                  fill={annotation.color}
                  fontSize="10"
                  textAnchor="middle"
                >
                  {annotation.text}
                </text>
              )}
            </g>
          );
        })}
      </g>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </svg>
  );
}
