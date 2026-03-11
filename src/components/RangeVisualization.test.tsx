import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RangeVisualization } from './RangeVisualization';

describe('RangeVisualization', () => {
  it('renders without crashing', () => {
    const mockStats = [
      { club: '7 Iron', avg_distance: 150, count: 10, in_bag: 1, color: '#10B981' }
    ];
    const mockDistances = [
      { id: 1, club: '7 Iron', distance: 150, date: '2023-01-01', direction: 'Center', hit_point: 'Center', trajectory: 'Mid' }
    ];

    render(<RangeVisualization stats={mockStats} distances={mockDistances} />);
    
    expect(screen.getByText('Range Visualization')).toBeInTheDocument();
    expect(screen.getByText('1 Clubs in Bag')).toBeInTheDocument();
  });
});
