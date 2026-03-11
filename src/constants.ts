import { Exercise } from './types';

export const CLUB_TYPES = [
  "Driver", "3 Wood", "5 Wood", "7 Wood", "4 Hybrid", "5 Hybrid",
  "3 Iron", "4 Iron", "5 Iron", "6 Iron", "7 Iron", "8 Iron", "9 Iron",
  "PW", "GW", "SW", "LW", "Putter"
];

export const BRANDS = [
  "Titleist", "TaylorMade", "Callaway", "Ping", "Mizuno", 
  "Cobra", "Srixon", "Cleveland", "PXG", "Wilson", "Honma"
];

export const POPULAR_MODELS: Record<string, string[]> = {
  "Titleist": ["T100", "T150", "T200", "T350", "Vokey SM10", "TSR2", "TSR3", "Scotty Cameron Newport"],
  "TaylorMade": ["Stealth 2", "Qi10", "P790", "P770", "MG4", "Spider GTX"],
  "Callaway": ["Paradym", "Apex 21", "Apex Pro", "Jaws Raw", "Odyssey AI-One", "strata"],
  "Ping": ["G430", "i230", "Blueprint S", "Glide 4.0", "Anser"],
  "Mizuno": ["JPX923 Hot Metal", "JPX923 Tour", "Mizuno Pro 225", "T24"],
  "Cobra": ["Aerojet", "King Tour", "King Forged TEC", "Snakebite"],
  "Srixon": ["ZX7 Mk II", "ZX5 Mk II", "ZX4 Mk II", "Z-Star"],
  "Cleveland": ["RTX 6 ZipCore", "CBX Full-Face 2", "Halo XL Full-Face"],
  "PXG": ["0311 P Gen6", "0311 XP Gen6", "0211 XCOR2"],
  "Wilson": ["Dynapower", "Staff Model Blade", "Staff Model CB"],
  "Honma": ["Beres", "T//World TW757", "T//World GS"]
};

export const SHOT_DIRECTIONS = ["Far Left", "Left", "Center", "Right", "Far Right"];
export const HIT_POINTS = ["Center", "Top", "Fat", "Thin", "Toe", "Heel"];
export const TRAJECTORIES = ["Low", "Mid", "High"];

export const CLUB_COLORS = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#6366F1', // Indigo
  '#D946EF', // Fuchsia
  '#14B8A6', // Teal
  '#FACC15', // Yellow
  '#475569', // Slate
  '#000000', // Black
  '#78350F', // Brown
  '#BE123C', // Rose
];

export const EXERCISES: Exercise[] = [
  {
    id: 'putt-1',
    title: 'Clock Drill',
    description: 'Place 12 balls in a circle around the hole at 3 feet. Make all 12 in a row.',
    category: 'Putting',
    difficulty: 'Beginner'
  },
  {
    id: 'chip-1',
    title: 'Landing Spot Drill',
    description: 'Place a towel on the green. Practice landing your chips on the towel to control carry distance.',
    category: 'Chipping',
    difficulty: 'Intermediate'
  },
  {
    id: 'iron-1',
    title: 'Gate Drill',
    description: 'Place two tees just wider than your clubhead. Practice hitting balls without hitting the tees.',
    category: 'Iron',
    difficulty: 'Intermediate'
  },
  {
    id: 'driver-1',
    title: 'Fairway Visualization',
    description: 'Pick two targets on the range representing a narrow fairway. Hit 10 drives and track how many stay in.',
    category: 'Driver',
    difficulty: 'Advanced'
  }
];
