import React from 'react';

interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
}

interface TimeSeriesSeries {
  name: string;
  data: TimeSeriesDataPoint[];
  color: string;
  unit?: string;
}

interface MetricsTimeSeriesChartProps {
  title: string;
  series: TimeSeriesSeries[];
  height?: number;
  showLegend?: boolean;
  yAxisLabel?: string;
  formatValue?: (value: number) => string;
}

export const MetricsTimeSeriesChart: React.FC<MetricsTimeSeriesChartProps> = ({
  title,
  series,
  height = 300,
  showLegend = true,
  yAxisLabel,
  formatValue = (val) => val.toFixed(2)
}) => {
  // Find global min and max across all series
  const allValues = series.flatMap(s => s.data.map(d => d.value));
  const maxValue = Math.max(...allValues, 1);
  const minValue = Math.min(...allValues, 0);
  const range = maxValue - minValue || 1;

  // Get all unique timestamps
  const allTimestamps = Array.from(
    new Set(series.flatMap(s => s.data.map(d => d.timestamp)))
  ).sort();

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Calculate SVG points for each series
  const calculatePoints = (seriesData: TimeSeriesDataPoint[]) => {
    if (seriesData.length === 0) return '';

    const svgWidth = 100; // Percentage
    const svgHeight = 100; // Percentage

    return seriesData
      .map((point, index) => {
        const x = (index / Math.max(seriesData.length - 1, 1)) * svgWidth;
        const normalizedValue = (point.value - minValue) / range;
        const y = (1 - normalizedValue) * svgHeight;
        return `${x},${y}`;
      })
      .join(' ');
  };

  // Check if data is available
  const hasData = series.some(s => s.data.length > 0);

  if (!hasData) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          {title}
        </h3>
        <div
          className="flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm"
          style={{ height: `${height}px` }}
        >
          No data available (consumption metrics may require Scale/Business/Enterprise plan)
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {title}
          </h3>
          {yAxisLabel && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {yAxisLabel}
            </p>
          )}
        </div>
        {showLegend && series.length > 1 && (
          <div className="flex flex-wrap gap-3">
            {series.map((s, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {s.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((fraction, i) => (
            <line
              key={i}
              x1="0"
              y1={`${(1 - fraction) * 100}`}
              x2="100"
              y2={`${(1 - fraction) * 100}`}
              stroke="currentColor"
              className="text-gray-200 dark:text-gray-700"
              strokeWidth="0.3"
              strokeDasharray="1 1"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Draw each series */}
          {series.map((s, seriesIndex) => {
            if (s.data.length === 0) return null;

            const points = calculatePoints(s.data);

            return (
              <g key={seriesIndex}>
                {/* Area fill (optional) */}
                {s.data.length > 1 && (
                  <polygon
                    points={`0,100 ${points} ${((s.data.length - 1) / Math.max(s.data.length - 1, 1)) * 100},100`}
                    fill={s.color}
                    opacity="0.1"
                  />
                )}

                {/* Line */}
                {s.data.length > 1 && (
                  <polyline
                    points={points}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="0.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                )}

                {/* Data points */}
                {s.data.map((point, index) => {
                  const x = (index / Math.max(s.data.length - 1, 1)) * 100;
                  const normalizedValue = (point.value - minValue) / range;
                  const y = (1 - normalizedValue) * 100;

                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="0.8"
                      fill={s.color}
                      className="hover:r-1.5 transition-all"
                      vectorEffect="non-scaling-stroke"
                    >
                      <title>{`${s.name} at ${formatTime(point.timestamp)}: ${formatValue(point.value)}${s.unit || ''}`}</title>
                    </circle>
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 pr-2">
          {[1, 0.75, 0.5, 0.25, 0].map((fraction, i) => (
            <span key={i} className="text-right">
              {formatValue(minValue + range * fraction)}
            </span>
          ))}
        </div>
      </div>

      {/* X-axis labels (time) */}
      <div className="flex justify-between mt-2 px-1">
        {series[0]?.data.length > 0 && (
          <>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(series[0].data[0].timestamp)}
            </span>
            {series[0].data.length > 1 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(series[0].data[series[0].data.length - 1].timestamp)}
              </span>
            )}
          </>
        )}
      </div>

      {/* Current values */}
      {series.length > 0 && series[0].data.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-4">
            {series.map((s, index) => {
              const latestValue = s.data[s.data.length - 1]?.value || 0;
              return (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {s.name}:
                  </span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {formatValue(latestValue)}{s.unit || ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
