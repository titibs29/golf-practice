import React from 'react';
import { ClubStat, DistanceEntry } from '../types';

interface RangeVisualizationProps {
  stats: ClubStat[];
  distances: DistanceEntry[];
  t: (text: string) => string;
}

export const RangeVisualization: React.FC<RangeVisualizationProps> = ({ stats, distances, t }) => {
  const [hoveredClub, setHoveredClub] = React.useState<string | null>(null);
  const [selectedClub, setSelectedClub] = React.useState<string | null>(null);

  // Filter for clubs that are in the bag
  const bagStats = stats.filter(s => s.in_bag === 1 || s.in_bag === true);
  
  // Sort stats by distance to draw them in order
  const sortedStats = [...bagStats].sort((a, b) => b.avg_distance - a.avg_distance);
  
  // Auto-scale based on the farthest distance (min 100m for visual consistency)
  const maxDistValue = Math.max(...distances.map(d => d.distance), 100);
  const maxDist = Math.ceil(maxDistValue / 50) * 50; // Round up to nearest 50m
  
  // SVG dimensions
  const width = 400;
  const height = 300;
  const margin = { top: 20, right: 40, bottom: 40, left: 40 };
  
  // Helper to convert distance to Y coordinate
  const getY = (dist: number) => {
    return height - margin.bottom - (dist / maxDist) * (height - margin.top - margin.bottom);
  };

  const getSelectedClubRange = (clubName: string) => {
    const clubDistances = distances.filter(d => d.club === clubName);
    if (clubDistances.length === 0) return null;
    
    // Sort by date descending and take last 15
    clubDistances.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const last15 = clubDistances.slice(0, 15);
    
    const distancesOnly = last15.map(d => d.distance);
    const min = Math.min(...distancesOnly);
    const max = Math.max(...distancesOnly);
    const stat = stats.find(s => s.club === clubName);
    
    return {
      min,
      max,
      color: stat?.color || '#10B981',
      allShots: last15 // Include all 15 shots
    };
  };

  const selectedRange = selectedClub ? getSelectedClubRange(selectedClub) : null;

  return (
    <div className="bg-[#2D5A27] rounded-2xl p-6 shadow-inner relative overflow-hidden border-4 border-[#1E3D1A]">
      {/* Range Grass Texture/Gradients */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ background: 'radial-gradient(circle at 50% 100%, #ffffff 0%, transparent 70%)' }} />
      
      <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4 relative z-10">{t('Range Visualization')}</h3>
      
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
              fontSize="12" 
              textAnchor="end"
              className="font-mono"
            >
              {dist}m
            </text>
          </g>
        ))}

        {/* Selected Club Range Oval and Components (Higher Z-Index) */}
        {selectedRange && (() => {
          const ry = Math.abs(getY(selectedRange.max) - getY(selectedRange.min)) / 2 + 10;
          const rx = Math.min(34, ry);
          const cy = getY((selectedRange.min + selectedRange.max) / 2);
          
          return (
            <g className="relative z-20">
              <ellipse 
                cx={width / 2} 
                cy={cy} 
                rx={rx} 
                ry={ry} 
                fill={selectedRange.color} 
                fillOpacity="0.2" 
                stroke={selectedRange.color}
                strokeWidth="2"
                strokeDasharray="4 4"
                transform={`rotate(15, ${width / 2}, ${cy})`}
              />
              
              {/* Remaining shots (excluding min/max) */}
              {selectedRange.allShots
                .filter(shot => shot.distance !== selectedRange.min && shot.distance !== selectedRange.max)
                .map((shot, i) => {
                // Distribute shots horizontally to avoid overlap, keeping them centered
                const xOffset = (i % 2 === 0 ? 1 : -1) * (5 + (i * 1.5));
                return (
                  <g key={i} className="group cursor-help">
                    <circle cx={width / 2 + xOffset} cy={getY(shot.distance)} r="3" fill={selectedRange.color} fillOpacity="0.4" />
                    <text x={width / 2 + xOffset + 5} y={getY(shot.distance) + 3} fill="white" fontSize="8" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {shot.distance}m
                    </text>
                  </g>
                );
              })}

              {/* Min/Max Dots (Colored Contour) with Hover Labels */}
              {/* Rotate dots 15 degrees, but not text */}
              <g className="group cursor-help" transform={`rotate(15, ${width / 2}, ${cy})`}>
                <circle cx={width / 2 - 5} cy={getY(selectedRange.min)} r="5" fill="transparent" stroke={selectedRange.color} strokeWidth="2" />
              </g>
              <text x={width / 2 - 15} y={getY(selectedRange.min) + 4} fill="white" fontSize="10" textAnchor="end" className="opacity-0 group-hover:opacity-100 transition-opacity">
                {Math.round(selectedRange.min)}m
              </text>
              
              <g className="group cursor-help" transform={`rotate(15, ${width / 2}, ${cy})`}>
                <circle cx={width / 2 + 5} cy={getY(selectedRange.max)} r="5" fill="transparent" stroke={selectedRange.color} strokeWidth="2" />
              </g>
              <text x={width / 2 + 15} y={getY(selectedRange.max) + 4} fill="white" fontSize="10" className="opacity-0 group-hover:opacity-100 transition-opacity">
                {Math.round(selectedRange.max)}m
              </text>
            </g>
          );
        })()}

        {/* The "Tee" area */}
        <circle cx={width / 2} cy={height - margin.bottom + 10} r="5" fill="#ffffff" fillOpacity="0.2" />
        
        {/* Shot Arcs/Markers */}
        {sortedStats.map((stat, index) => {
          const y = getY(stat.avg_distance);
          const x = width / 2;
          const isLeft = index % 2 === 0;
          const clubColor = stat.color || '#10B981';
          const isHovered = hoveredClub === stat.club;
          
          // Label positioning
          const labelX = isLeft ? margin.left + 10 : width - margin.right - 10;
          const textAnchor = isLeft ? "start" : "end";
          
          return (
            <g 
              key={stat.club} 
              className="cursor-pointer"
              onMouseEnter={() => setHoveredClub(stat.club)}
              onMouseLeave={() => setHoveredClub(null)}
              onClick={() => setSelectedClub(selectedClub === stat.club ? null : stat.club)}
            >
              {/* Shot Path (Arc) */}
              <path 
                d={`M ${width/2} ${height - margin.bottom} Q ${width/2 + (isLeft ? -20 : 20)} ${y + (height - margin.bottom - y)/2} ${x} ${y}`}
                fill="none"
                stroke={clubColor}
                strokeOpacity={isHovered ? 0.5 : 0.15}
                strokeWidth={isHovered ? 2 : 1}
                className="transition-all"
              />
              
              {/* Leader Line to Label */}
              <line 
                x1={x} 
                y1={y} 
                x2={isLeft ? labelX + 5 : labelX - 5} 
                y2={y} 
                stroke={clubColor} 
                strokeOpacity={isHovered ? 0.8 : 0.3} 
                strokeWidth="0.5"
                strokeDasharray="2 2"
                className="transition-all"
              />
              
              {/* Landing Spot */}
              <circle 
                cx={x} 
                cy={y} 
                r={isHovered ? 6 : 3} 
                fill={isHovered ? 'white' : clubColor} 
                stroke={isHovered ? clubColor : 'none'}
                strokeWidth="2"
                className="transition-all"
              />
              
              {/* Label */}
              <g transform={`translate(${labelX}, ${y + 4})`}>
                <rect 
                  x="-48" 
                  y="-16" 
                  width="96" 
                  height="24" 
                  rx="8" 
                  fill="black" 
                  fillOpacity={isHovered ? 0.7 : 0.4} 
                  className="transition-all"
                />
                <text 
                  fill="white" 
                  fontSize="14" 
                  fontWeight="bold"
                  textAnchor="middle"
                  className="pointer-events-none"
                  y="4"
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
          <p className="text-white/40 text-[8px] font-bold uppercase tracking-tighter">{t('Bag Visualization')}</p>
          <p className="text-white font-bold text-sm">{t('Carry Distance Map')}</p>
        </div>
        <div className="text-right">
          <p className="text-emerald-400 font-mono text-xs font-bold">{bagStats.length} {t('Clubs in Bag')}</p>
        </div>
      </div>
    </div>
  );
};
