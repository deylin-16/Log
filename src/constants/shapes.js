// constants/shapes.js
import React from 'react'; // Necesario en la mayoría de entornos React

export const SHAPES = {
  square: () => (
    <rect x="5" y="5" width="90" height="90" rx="12" ry="12" />
  ),
  rectangle: () => (
    <rect x="5" y="25" width="90" height="50" rx="8" ry="8" />
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
    <polygon points="50,5 95,38 78,92 22,92 5,38" />
  ),
  hexagon: () => (
    <polygon points="25,10 75,10 95,50 75,90 25,90 5,50" />
  ),
  star: () => (
    <polygon points="50,5 63,38 98,38 70,59 78,95 50,75 22,95 30,59 2,38 37,38" />
  ),
  heart: () => (
    <path d="M50,85 L44,80 C25,62 10,48 10,32 C10,19 19,10 32,10 C39,10 46,14 50,20 C54,14 61,10 68,10 C81,10 90,19 90,32 C90,48 75,62 56,80 L50,85 Z" />
  ),
  star4: () => (
    <polygon points="50,5 62,38 95,50 62,62 50,95 38,62 5,50 38,38" />
  ),
  cloud: () => (
    <path d="M25,80 C10,80 5,65 15,55 C10,35 30,20 45,30 C55,10 85,15 85,40 C95,45 95,70 80,80 Z" />
  )
};
