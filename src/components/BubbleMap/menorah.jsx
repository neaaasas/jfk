import React from 'react';

const Menorah = ({ size = 30, color = "#3b82f6" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 100 100"
      fill={color}
    >
      {/* Base */}
      <rect x="40" y="85" width="20" height="10" rx="2" />
      <rect x="35" y="80" width="30" height="5" rx="1" />
      
      {/* Center stem */}
      <rect x="48" y="30" width="4" height="50" />
      
      {/* Candle holders */}
      <circle cx="50" cy="25" r="4" />
      <circle cx="35" cy="25" r="4" />
      <circle cx="20" cy="25" r="4" />
      <circle cx="65" cy="25" r="4" />
      <circle cx="80" cy="25" r="4" />
      <circle cx="27.5" cy="25" r="4" />
      <circle cx="42.5" cy="25" r="4" />
      <circle cx="57.5" cy="25" r="4" />
      <circle cx="72.5" cy="25" r="4" />
      
      {/* Arms */}
      <path d="M50,30 Q35,50 35,25" strokeWidth="4" stroke={color} fill="none" />
      <path d="M50,30 Q20,70 20,25" strokeWidth="4" stroke={color} fill="none" />
      <path d="M50,30 Q65,50 65,25" strokeWidth="4" stroke={color} fill="none" />
      <path d="M50,30 Q80,70 80,25" strokeWidth="4" stroke={color} fill="none" />
      <path d="M50,30 Q27.5,60 27.5,25" strokeWidth="4" stroke={color} fill="none" />
      <path d="M50,30 Q42.5,45 42.5,25" strokeWidth="4" stroke={color} fill="none" />
      <path d="M50,30 Q57.5,45 57.5,25" strokeWidth="4" stroke={color} fill="none" />
      <path d="M50,30 Q72.5,60 72.5,25" strokeWidth="4" stroke={color} fill="none" />
      
      {/* Shamash (taller center candle) */}
      <rect x="48" y="15" width="4" height="10" />
      <circle cx="50" cy="12" r="4" />
    </svg>
  );
};

export default Menorah;
