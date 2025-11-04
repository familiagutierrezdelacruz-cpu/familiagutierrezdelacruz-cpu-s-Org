import React from 'react';

interface EvolutionChartProps {
  data: { label: string; value: number }[];
  title: string;
  unit: string;
  lineColorClassName: string;
  pointColorClassName: string;
}

const EvolutionChart: React.FC<EvolutionChartProps> = ({ data, title, unit, lineColorClassName, pointColorClassName }) => {
  if (data.length < 2) {
    return null; // Don't render a chart with less than 2 points
  }

  const width = 500;
  const height = 300;
  const margin = { top: 20, right: 20, bottom: 60, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const values = data.map(d => d.value);
  const minY = Math.min(...values) * 0.95;
  const maxY = Math.max(...values) * 1.05;

  const getX = (index: number) => margin.left + (index / (data.length - 1)) * chartWidth;
  
  const getY = (value: number) => {
    if (maxY === minY) return margin.top + chartHeight / 2; // Handle case where all values are the same
    return margin.top + chartHeight - ((value - minY) / (maxY - minY)) * chartHeight;
  };

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${getX(i)},${getY(d.value)}`).join(' ');

  const yTicks = [];
  const tickCount = 5;
  for (let i = 0; i < tickCount; i++) {
    const value = minY + (i / (tickCount - 1)) * (maxY - minY);
    yTicks.push({
      value: value.toFixed(1),
      y: getY(value),
    });
  }

  return (
    <div className="w-full">
      <h4 className="font-bold text-slate-700 text-center text-sm mb-2">{title}</h4>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Y Axis */}
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} className="stroke-slate-300" />
        {yTicks.map(tick => (
          <g key={tick.value}>
            <line x1={margin.left - 5} y1={tick.y} x2={margin.left} y2={tick.y} className="stroke-slate-300" />
            <text x={margin.left - 8} y={tick.y} dy="0.32em" textAnchor="end" className="text-[10px] fill-slate-500">
              {tick.value}
            </text>
          </g>
        ))}
        <text transform={`rotate(-90)`} y={0} x={-(height / 2)} dy="1em" textAnchor="middle" className="text-xs fill-slate-600 font-medium">
          {unit}
        </text>

        {/* X Axis */}
        <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} className="stroke-slate-300" />
        {data.map((d, i) => (
          <g key={i}>
            <text 
              x={getX(i)} 
              y={height - margin.bottom + 5} 
              textAnchor="middle" 
              transform={`rotate(-45, ${getX(i)}, ${height - margin.bottom + 5})`}
              className="text-[10px] fill-slate-500"
            >
              {d.label}
            </text>
          </g>
        ))}

        {/* Data Line */}
        <path d={linePath} fill="none" className={lineColorClassName} strokeWidth="2" />
        
        {/* Data Points */}
        {data.map((d, i) => (
          <circle key={i} cx={getX(i)} cy={getY(d.value)} r="4" className={`${pointColorClassName} cursor-pointer`}>
            <title>{`${d.label}: ${d.value.toFixed(1)} ${unit}`}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
};

export default EvolutionChart;
