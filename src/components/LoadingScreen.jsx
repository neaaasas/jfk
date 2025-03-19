import React, { useState, useEffect } from 'react';
import StarOfDavid from './StarOfDavid';
import WorldMap from './WorldMap';
// Removed import for LoadingScreen.css as styles are in index.css

const LoadingScreen = ({ isLoading, progress = 0 }) => {
  const [animationProgress, setAnimationProgress] = useState(0);
  
  useEffect(() => {
    // Simulate loading or use actual progress
    const timer = setTimeout(() => {
      if (animationProgress < 100) {
        setAnimationProgress(prev => Math.min(prev + 5, 100));
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, [animationProgress]);
  
  // If not loading, don't render the component
  if (!isLoading && animationProgress === 100) return null;
  
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <WorldMap animationProgress={animationProgress} />
        <StarOfDavid animationProgress={animationProgress} />
        <div className="loading-text">
          <h2>Loading Jewish Connections...</h2>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${animationProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;