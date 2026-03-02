import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface DataPoint {
  date: string;
  timestamp: number;
  stability: number;
  smoothness: number;
  accuracy: number;
  jitter: number;
}

interface ProgressChartsProps {
  data: DataPoint[];
  selectedMetric?: 'stability' | 'smoothness' | 'accuracy' | 'jitter';
  onMetricSelect?: (metric: 'stability' | 'smoothness' | 'accuracy' | 'jitter') => void;
}

/**
 * Simple SVG-based line chart component
 */
function LineChart({ 
  data, 
  metric, 
  height = 200 
}: { 
  data: DataPoint[]; 
  metric: 'stability' | 'smoothness' | 'accuracy' | 'jitter'; 
  height?: number;
}) {
  if (data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  const values = data.map(d => d[metric]);
  const maxValue = Math.max(...values, 100);
  const minValue = Math.min(...values, 0);
  const range = maxValue - minValue || 1;

  const padding = 40;
  const width = Math.max(200, data.length * 20);
  const pointSpacing = (width - padding * 2) / Math.max(data.length - 1, 1);

  // Create path for line chart
  let pathData = '';
  values.forEach((value, i) => {
    const x = padding + i * pointSpacing;
    const normalizedValue = (value - minValue) / range;
    const y = height - padding + 20 - (normalizedValue * (height - padding - 40));

    if (i === 0) {
      pathData += `M ${x} ${y}`;
    } else {
      pathData += ` L ${x} ${y}`;
    }
  });

  // Color based on metric
  const colors: Record<string, { line: string; fill: string }> = {
    stability: { line: '#3b82f6', fill: '#3b82f650' },
    smoothness: { line: '#10b981', fill: '#10b98150' },
    accuracy: { line: '#f59e0b', fill: '#f59e0b50' },
    jitter: { line: '#ef4444', fill: '#ef444450' },
  };

  const color = colors[metric];

  return (
    <svg width={width} height={height} className="w-full">
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((val) => {
        const y = height - padding + 20 - ((val - minValue) / range * (height - padding - 40));
        return (
          <line
            key={`grid-${val}`}
            x1={padding}
            x2={width - padding}
            y1={y}
            y2={y}
            stroke="#e5e7eb"
            strokeDasharray="4"
            strokeWidth="1"
          />
        );
      })}

      {/* Y-axis labels */}
      {[0, 25, 50, 75, 100].map((val) => {
        const y = height - padding + 20 - ((val - minValue) / range * (height - padding - 40));
        return (
          <text
            key={`label-${val}`}
            x={padding - 25}
            y={y + 4}
            fontSize="12"
            fill="#6b7280"
            textAnchor="end"
          >
            {val}
          </text>
        );
      })}

      {/* Line */}
      <path
        d={pathData}
        fill="none"
        stroke={color.line}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {values.map((value, i) => {
        const x = padding + i * pointSpacing;
        const normalizedValue = (value - minValue) / range;
        const y = height - padding + 20 - (normalizedValue * (height - padding - 40));

        return (
          <circle
            key={`point-${i}`}
            cx={x}
            cy={y}
            r="3"
            fill={color.line}
            stroke="white"
            strokeWidth="2"
          />
        );
      })}

      {/* X-axis */}
      <line
        x1={padding}
        x2={width - padding}
        y1={height - padding + 20}
        y2={height - padding + 20}
        stroke="#374151"
        strokeWidth="1"
      />
    </svg>
  );
}

/**
 * Statistical summary card
 */
function StatSummary({ 
  label, 
  value, 
  unit = '',
  trend,
  color = 'blue'
}: { 
  label: string; 
  value: number; 
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: 'blue' | 'green' | 'yellow' | 'red';
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50',
    green: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/50',
    red: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50',
  };

  const trendIcons: Record<string, string> = {
    up: '📈',
    down: '📉',
    stable: '→',
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="text-sm font-medium opacity-75">{label}</div>
      <div className="flex items-baseline gap-2 mt-2">
        <div className="text-2xl font-bold">{Math.round(value)}</div>
        <div className="text-sm opacity-75">{unit}</div>
        {trend && <span className="text-lg">{trendIcons[trend]}</span>}
      </div>
    </div>
  );
}

/**
 * Main Progress Charts Component
 */
export function ProgressCharts({
  data,
  selectedMetric = 'stability',
  onMetricSelect,
}: ProgressChartsProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Tracking</CardTitle>
          <CardDescription>No sessions recorded yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            Complete exercises to see your progress here
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate statistics
  const calculateStats = (metric: 'stability' | 'smoothness' | 'accuracy' | 'jitter') => {
    const values = data.map(d => d[metric]);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    // Calculate trend (compare last 3 with previous 3)
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (data.length >= 6) {
      const recent = values.slice(-3).reduce((a, b) => a + b, 0) / 3;
      const previous = values.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
      if (recent > previous + 5) trend = 'up';
      else if (recent < previous - 5) trend = 'down';
    }

    return { avg, max, min, trend };
  };

  const metrics = ['stability', 'smoothness', 'accuracy', 'jitter'] as const;
  const stats = Object.fromEntries(
    metrics.map(m => [m, calculateStats(m)])
  );

  const metricColors: Record<string, 'blue' | 'green' | 'yellow' | 'red'> = {
    stability: 'blue',
    smoothness: 'green',
    accuracy: 'yellow',
    jitter: 'red',
  };

  const metricLabels: Record<string, string> = {
    stability: 'Hand Stability',
    smoothness: 'Movement Smoothness',
    accuracy: 'Shape Accuracy',
    jitter: 'Low Tremor',
  };

  return (
    <div className="space-y-6">
      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map(metric => {
          const s = stats[metric];
          return (
            <StatSummary
              key={metric}
              label={metricLabels[metric]}
              value={s.avg}
              unit="%"
              trend={s.trend}
              color={metricColors[metric]}
            />
          );
        })}
      </div>

      {/* Chart Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trend Analysis</CardTitle>
          <CardDescription>Your performance over time</CardDescription>
          
          {/* Metric Selector */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {metrics.map(metric => (
              <button
                key={metric}
                onClick={() => onMetricSelect?.(metric)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedMetric === metric
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {metricLabels[metric]}
              </button>
            ))}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="w-full overflow-x-auto">
            <LineChart data={data} metric={selectedMetric} height={300} />
          </div>

          {/* New Session Stats */}
          {data.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-sm mb-3">Latest Session</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Stability</div>
                  <div className="font-bold text-lg">{data[data.length - 1].stability}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Smoothness</div>
                  <div className="font-bold text-lg">{data[data.length - 1].smoothness}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Accuracy</div>
                  <div className="font-bold text-lg">{data[data.length - 1].accuracy}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Jitter</div>
                  <div className="font-bold text-lg">{data[data.length - 1].jitter}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detailed Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics.map(metric => {
            const s = stats[metric];
            return (
              <div key={metric} className="border-b pb-4 last:border-b-0 last:pb-0">
                <div className="font-semibold mb-2">{metricLabels[metric]}</div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Average</div>
                    <div className="text-lg font-bold">{Math.round(s.avg)}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Best</div>
                    <div className="text-lg font-bold text-green-600">{s.max}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Needs Work</div>
                    <div className="text-lg font-bold text-orange-600">{s.min}%</div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
