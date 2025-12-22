'use client';

interface LineLegendConfig {
  domain: string[];
  range: string[];
}

interface NodeLegendConfig {
  title: string;
  domain: number[];
  range: string[];
}

interface LegendProps {
  lineConfig: LineLegendConfig;
  nodeConfig: NodeLegendConfig;
}

export default function Legend({ lineConfig, nodeConfig }: LegendProps) {
  return (
    <div className="flex flex-wrap items-center gap-6 text-sm">
      {/* Line Legend */}
      <div className="flex items-center gap-3">
        <span className="text-slate-400">Lines:</span>
        {lineConfig.domain.map((label, i) => (
          <span key={label} className="flex items-center gap-1">
            <span
              className="w-4 h-1 rounded"
              style={{ backgroundColor: lineConfig.range[i] }}
            />
            <span className="text-slate-300">{label}</span>
          </span>
        ))}
      </div>

      {/* Node Legend */}
      <div className="flex items-center gap-3">
        <span className="text-slate-400">{nodeConfig.title}:</span>
        {nodeConfig.domain.map((threshold, i) => {
          const prevThreshold = i === 0 ? 0 : nodeConfig.domain[i - 1];
          const label = i === 0 ? `<${threshold}` :
                        i === nodeConfig.domain.length - 1 ? `${prevThreshold}+` :
                        `${prevThreshold}-${threshold}`;
          return (
            <span key={i} className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded-full border border-slate-500"
                style={{ backgroundColor: nodeConfig.range[i] }}
              />
              <span className="text-slate-400 text-xs">{label}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// Interactive demo component
export function LegendDemo() {
  const lineConfig = {
    domain: ['Ego', 'Collaborator', 'Colleague'],
    range: ['#424242', '#146b6b', '#FA9902']
  };

  const nodeConfig = {
    title: 'Citations',
    domain: [10, 50, 100, 500],
    range: ['#ffffff', '#fcdaca', '#e599a6', '#c94b77', '#740980']
  };

  return (
    <div className="space-y-6">
      {/* Line Legend Demo */}
      <div className="p-4 bg-slate-800 rounded-xl">
        <h4 className="text-white font-semibold text-sm mb-3">Line Legend</h4>
        <div className="flex flex-wrap items-center gap-4">
          {lineConfig.domain.map((label, i) => (
            <div key={label} className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg">
              <svg width="40" height="8">
                <line
                  x1="0"
                  y1="4"
                  x2="40"
                  y2="4"
                  stroke={lineConfig.range[i]}
                  strokeWidth={label === 'Ego' ? 4 : 2}
                />
              </svg>
              <span className="text-slate-300 text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Node Legend Demo */}
      <div className="p-4 bg-slate-800 rounded-xl">
        <h4 className="text-white font-semibold text-sm mb-3">Node Legend (Citations)</h4>
        <div className="flex flex-wrap items-center gap-3">
          {nodeConfig.range.map((color, i) => {
            const prevThreshold = i === 0 ? 0 : nodeConfig.domain[i - 1];
            const label = i === 0 ? '<10' :
                          i === nodeConfig.domain.length ? '500+' :
                          `${prevThreshold}-${nodeConfig.domain[i] || '500+'}`;
            return (
              <div key={i} className="flex flex-col items-center gap-1 p-2 bg-slate-900 rounded-lg">
                <svg width="30" height="30">
                  <circle
                    cx="15"
                    cy="15"
                    r="12"
                    fill={color}
                    stroke="#424242"
                    strokeWidth="1"
                  />
                </svg>
                <span className="text-slate-400 text-xs">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Combined view */}
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-700">
        <h4 className="text-white font-semibold text-sm mb-3">Combined Legend (as in visualization)</h4>
        <Legend lineConfig={lineConfig} nodeConfig={nodeConfig} />
      </div>
    </div>
  );
}
