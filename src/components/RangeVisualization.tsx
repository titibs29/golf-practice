import React from 'react';
import { ClubStat } from '../types';

interface RangeVisualizationProps {
  stats: ClubStat[];
}

export const RangeVisualization: React.FC<RangeVisualizationProps> = ({ stats }) => {
  // Filter for clubs that are in the bag
  const bagStats = stats.filter(s => s.in_bag === 1 || s.in_bag === true);
  
  // Sort stats by distance to draw them in order
  const sortedStats = [...bagStats].sort((a, b) => b.avg_distance - a.avg_distance);
  
  // Auto-scale based on the farthest average distance (min 100m for visual consistency)
  const maxAvgDist = Math.max(...bagStats.map(s => s.avg_distance), 100);
  const maxDist = Math.ceil(maxAvgDist / 50) * 50; // Round up to nearest 50m
  
  // SVG dimensions
  const width = 400;
  const height = 300;
  const margin = { top: 20, right: 40, bottom: 40, left: 40 };
  
  // Helper to convert distance to Y coordinate
  const getY = (dist: number) => {
    return height - margin.bottom - (dist / maxDist) * (height - margin.top - margin.bottom);
  };

  return (
    <div className="bg-[#2D5A27] rounded-2xl p-6 shadow-inner relative overflow-hidden border-4 border-[#1E3D1A]">
      {/* Range Grass Texture/Gradients */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ background: 'radial-gradient(circle at 50% 100%, #ffffff 0%, transparent 70%)' }} />
      
      <h3 className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-4 relative z-10">Range Visualization (Bag Only)</h3>
      
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto drop-shadow-lg">
        {/* Distance Markers (Horizontal Lines) */}
        {Array.from({ length: Math.floor(maxDist / 50) }, (_, i) => (i + 1) * 50).map(dist => (
          <g key={dist}>
            <line 
              x1={margin.left} 
              y1={getY(dist)} 
              x2={width - margin.right} 
              y2={getY(dist)} 
              stroke="white" 
              strokeOpacity="0.1" 
              strokeDasharray="4 4"
            />
            <text 
              x={margin.left - 5} 
              y={getY(dist) + 4} 
              fill="white" 
              fillOpacity="0.4" 
              fontSize="10" 
              textAnchor="end"
              className="font-mono"
            >
              {dist}m
            </text>
          </g>
        ))}

        {/* The "Tee" area */}
        <circle cx={width / 2} cy={height - margin.bottom + 10} r="5" fill="#ffffff" fillOpacity="0.2" />
        
        {/* Shot Arcs/Markers */}
        {sortedStats.map((stat, index) => {
          const y = getY(stat.avg_distance);
          const x = width / 2;
          const isLeft = index % 2 === 0;
          const clubColor = stat.color || '#10B981';
          
          // Label positioning
          const labelX = isLeft ? margin.left + 10 : width - margin.right - 10;
          const textAnchor = isLeft ? "start" : "end";
          
          return (
            <g key={stat.club} className="group cursor-pointer">
              {/* Shot Path (Arc) */}
              <path 
                d={`M ${width/2} ${height - margin.bottom} Q ${width/2 + (isLeft ? -20 : 20)} ${y + (height - margin.bottom - y)/2} ${x} ${y}`}
                fill="none"
                stroke={clubColor}
                strokeOpacity="0.15"
                strokeWidth="1"
                className="transition-all group-hover:stroke-opacity-50"
              />
              
              {/* Leader Line to Label */}
              <line 
                x1={x} 
                y1={y} 
                x2={isLeft ? labelX + 5 : labelX - 5} 
                y2={y} 
                stroke={clubColor} 
                strokeOpacity="0.3" 
                strokeWidth="0.5"
                strokeDasharray="2 2"
                className="group-hover:stroke-opacity-80 transition-all"
              />
              
              {/* Landing Spot */}
              <circle 
                cx={x} 
                cy={y} 
                r="3" 
                fill={clubColor} 
                className="transition-all group-hover:scale-150 group-hover:fill-white"
              />
              
              {/* Label */}
              <g transform={`translate(${labelX}, ${y + 4})`}>
                <rect 
                  x={isLeft ? "-4" : "-64"} 
                  y="-10" 
                  width="68" 
                  height="14" 
                  rx="4" 
                  fill="black" 
                  fillOpacity="0.3" 
                  className="group-hover:fill-opacity-60 transition-all"
                />
                <text 
                  fill="white" 
                  fontSize="8" 
                  fontWeight="bold"
                  textAnchor={textAnchor}
                  className="pointer-events-none"
                >
                  {stat.club.substring(0, 8)} <tspan fill={clubColor}>{Math.round(stat.avg_distance)}m</tspan>
                </text>
              </g>
            </g>
          );
        })}
      </svg>
      
      <div className="mt-4 flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-white/40 text-[8px] font-bold uppercase tracking-tighter">Bag Visualization</p>
          <p className="text-white font-bold text-sm">Carry Distance Map</p>
        </div>
        <div className="text-right">
          <p className="text-emerald-400 font-mono text-xs font-bold">{bagStats.length} Clubs in Bag</p>
        </div>
      </div>
    </div>
  );
};
