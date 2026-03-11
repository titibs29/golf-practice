export interface Club {
  id: number;
  name: string; // e.g. "7 Iron"
  brand: string;
  model: string;
  shaft?: string;
  grip?: string;
  notes?: string;
  color: string;
  in_bag: boolean;
}

export interface DistanceEntry {
  id: number;
  club: string;
  distance: number;
  direction?: string;
  hit_point?: string;
  trajectory?: string;
  date: string;
}

export interface ClubStat {
  club: string;
  avg_distance: number;
  max_distance: number;
  count: number;
  color?: string;
  in_bag?: boolean;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  category: 'Putting' | 'Chipping' | 'Iron' | 'Driver' | 'Mental';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}
