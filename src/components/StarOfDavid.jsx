import React from 'react';

const StarOfDavid = ({ animationProgress }) => {
  // Calculate the size and opacity based on progress
  const size = 60 + (animationProgress * 0.4); // Grows slightly with progress
  const glowOpacity = Math.min(0.8, animationProgress / 100 * 0.8);
  const glowRadius = 5 + (animationProgress / 10);
  
  return (
    <div className="star-container" style={{ 
      position: 'absolute',
      top: '25%', // Positioned above Israel/Middle East
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 100
    }}>
      <svg 
        width={size * 2} 
        height={size * 2} 
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Glow filter */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={glowRadius} result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Glow effect background */}
        <g filter="url(#glow)" opacity={glowOpacity}>
          <polygon points="50,10 90,70 10,70" fill="#0038b8" />
          <polygon points="50,90 90,30 10,30" fill="#0038b8" />
        </g>
        
        {/* Main star */}
        <polygon points="50,10 90,70 10,70" fill="none" stroke="#0038b8" strokeWidth="2.5" />
        <polygon points="50,90 90,30 10,30" fill="none" stroke="#0038b8" strokeWidth="2.5" />
        
        {/* Light beams emanating from star as progress increases */}
        {animationProgress > 30 && (
          <>
            <line 
              x1="50" y1="50" 
              x2={50 - (animationProgress - 30)} y2="50" 
              stroke="#0038b8" 
              strokeWidth="1.5" 
              opacity="0.6" 
              strokeDasharray="5,3"
            />
            <line 
              x1="50" y1="50" 
              x2={50 + (animationProgress - 30)} y2="50" 
              stroke="#0038b8" 
              strokeWidth="1.5" 
              opacity="0.6" 
              strokeDasharray="5,3"
            />
            <line 
              x1="50" y1="50" 
              x2="50" y2={50 - (animationProgress - 30)} 
              stroke="#0038b8" 
              strokeWidth="1.5" 
              opacity="0.6" 
              strokeDasharray="5,3"
            />
            <line 
              x1="50" y1="50" 
              x2="50" y2={50 + (animationProgress - 30)} 
              stroke="#0038b8" 
              strokeWidth="1.5" 
              opacity="0.6" 
              strokeDasharray="5,3"
            />
          </>
        )}
        
        {/* More light beams at higher progress */}
        {animationProgress > 60 && (
          <>
            <line 
              x1="50" y1="50" 
              x2={50 - (animationProgress - 30) * 0.7} y2={50 - (animationProgress - 30) * 0.7} 
              stroke="#0038b8" 
              strokeWidth="1.5" 
              opacity="0.6" 
              strokeDasharray="5,3"
            />
            <line 
              x1="50" y1="50" 
              x2={50 + (animationProgress - 30) * 0.7} y2={50 - (animationProgress - 30) * 0.7} 
              stroke="#0038b8" 
              strokeWidth="1.5" 
              opacity="0.6" 
              strokeDasharray="5,3"
            />
            <line 
              x1="50" y1="50" 
              x2={50 - (animationProgress - 30) * 0.7} y2={50 + (animationProgress - 30) * 0.7} 
              stroke="#0038b8" 
              strokeWidth="1.5" 
              opacity="0.6" 
              strokeDasharray="5,3"
            />
            <line 
              x1="50" y1="50" 
              x2={50 + (animationProgress - 30) * 0.7} y2={50 + (animationProgress - 30) * 0.7} 
              stroke="#0038b8" 
              strokeWidth="1.5" 
              opacity="0.6" 
              strokeDasharray="5,3"
            />
          </>
        )}
      </svg>
    </div>
  );
};

export default StarOfDavid;