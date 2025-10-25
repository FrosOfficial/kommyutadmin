import React from 'react';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface MetricsChartProps {
  title: string;
  data: DataPoint[];
  type?: 'bar' | 'line' | 'progress';
  maxValue?: number;
  unit?: string;
  height?: number;
}

export const MetricsChart: React.FC<MetricsChartProps> = ({
  title,
  data,
  type = 'bar',
  maxValue,
  unit = '',
  height = 200
}) => {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);

  const getBarColor = (value: number, customColor?: string) => {
    if (customColor) return customColor;
    if (value > max * 0.8) return 'bg-red-500';
    if (value > max * 0.6) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (type === 'progress') {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          {title}
        </h3>
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = (item.value / max) * 100;
            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {item.label}
                  </span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {item.value}{unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getBarColor(item.value, item.color)}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'bar') {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          {title}
        </h3>
        <div className="flex items-end justify-between space-x-2" style={{ height: `${height}px` }}>
          {data.map((item, index) => {
            const barHeight = (item.value / max) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-end justify-center" style={{ height: '100%' }}>
                  <div
                    className={`w-full rounded-t-md transition-all hover:opacity-80 ${getBarColor(item.value, item.color)}`}
                    style={{ height: `${barHeight}%` }}
                    title={`${item.label}: ${item.value}${unit}`}
                  />
                </div>
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 text-center truncate w-full">
                  {item.label}
                </div>
                <div className="text-xs font-medium text-gray-900 dark:text-white">
                  {item.value}{unit}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Line chart (simple version)
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
        {title}
      </h3>
      <div className="relative" style={{ height: `${height}px` }}>
        <svg className="w-full h-full">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((fraction, i) => (
            <line
              key={i}
              x1="0"
              y1={`${(1 - fraction) * 100}%`}
              x2="100%"
              y2={`${(1 - fraction) * 100}%`}
              stroke="currentColor"
              className="text-gray-200 dark:text-gray-700"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Line path */}
          {data.length > 1 && (
            <polyline
              points={data
                .map((item, index) => {
                  const x = (index / (data.length - 1)) * 100;
                  const y = (1 - item.value / max) * 100;
                  return `${x}%,${y}%`;
                })
                .join(' ')}
              fill="none"
              stroke="currentColor"
              className="text-blue-500"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / Math.max(data.length - 1, 1)) * 100;
            const y = (1 - item.value / max) * 100;
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={`${y}%`}
                r="4"
                fill="currentColor"
                className="text-blue-600 dark:text-blue-400"
              >
                <title>{`${item.label}: ${item.value}${unit}`}</title>
              </circle>
            );
          })}
        </svg>

        {/* Labels */}
        <div className="flex justify-between mt-2">
          {data.map((item, index) => (
            <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
