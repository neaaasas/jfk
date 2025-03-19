import React from 'react';
// Import your SVG directly
import WorldSvg from '../assets/world.svg';

const WorldMap = ({ animationProgress }) => {
  // Calculate filter intensity based on progress
  const glowIntensity = Math.min(animationProgress / 100 * 10, 8);
  
  return (
    <div className="world-map-container">
      {/* Apply a filter to the entire world map that increases with progress */}
      <div 
        className="world-svg-wrapper" 
        style={{ 
          filter: `drop-shadow(0 0 ${glowIntensity}px rgba(58, 134, 255, 0.5))`,
          transition: 'filter 0.5s ease'
        }}
      >
        <img 
          src={WorldSvg} 
          alt="World Map" 
          className="world-svg" 
          style={{
            width: '100%',
            maxWidth: '800px',
            opacity: 0.7 + (animationProgress / 100 * 0.3), // Gets more opaque as loading progresses
            transition: 'opacity 0.5s ease'
          }}
        />
      </div>
      
      {/* Overlay mask that recedes as loading progresses */}
      <div 
        className="world-mask" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, transparent, #121212 70%)',
          opacity: 1 - (animationProgress / 100),
          pointerEvents: 'none',
          transition: 'opacity 0.8s ease-out'
        }}
      />
    </div>
  );
};

export default WorldMap;