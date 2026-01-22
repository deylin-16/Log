// constants/shapes.js

export const SHAPES = {
  square: () => (
    <rect x="0" y="0" width="100" height="100" rx="12" ry="12" />
  ),
  rectangle: () => (
    <rect x="0" y="20" width="100" height="60" rx="8" ry="8" />
  ),
  circle: () => (
    <circle cx="50" cy="50" r="45" />
  ),
  ellipse: () => (
    <ellipse cx="50" cy="50" rx="45" ry="30" />
  ),
  triangle: () => (
    <polygon points="50,10 90,90 10,90" />
  ),
  invertedTriangle: () => (
    <polygon points="50,90 90,10 10,10" />
  ),
  diamond: () => (
    <polygon points="50,10 90,50 50,90 10,50" />
  ),
  pentagon: () => (
    <polygon points="50,10 90,35 80,90 20,90 10,35" />
  ),
  hexagon: () => (
    <polygon points="25,10 75,10 90,50 75,90 25,90 10,50" />
  ),
  star: () => (
    <polygon points="50,10 61,35 90,35 65,55 75,90 50,70 25,90 35,55 10,35 39,35" />
  ),
  heart: () => (
    <path d="M50 30 Q 20 0, 0 30 Q 0 60, 25 80 Q 50 100, 75 80 Q 100 60, 100 30 Q 80 0, 50 30 Z" />
  ),
  star4: () => (  // estrella de 4 puntas
    <polygon points="50,10 60,40 90,50 60,60 50,90 40,60 10,50 40,40" />
  ),
  cloud: () => (
    <path d="M20,60 Q0,40 20,20 Q40,0 60,20 Q80,0 100,20 Q120,40 100,60 Q80,80 60,60 Q40,80 20,60 Z" />
  )
};