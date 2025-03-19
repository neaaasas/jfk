// src/components/Navigation/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import AudioControls from '../AudioControls';

const Navbar = () => {
  const location = useLocation();
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);
  
  // Placeholder for future crypto address or any other text to copy
  const copyPlaceholder = "Coming soon...";
  
  const handleCopyClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Copy placeholder text
    navigator.clipboard.writeText(copyPlaceholder)
      .then(() => {
        setShowCopiedTooltip(true);
        setTimeout(() => setShowCopiedTooltip(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };
  
  return (
    <nav className="bg-gradient-to-r from-[#1a1a1a] to-[#252525] border-b border-gray-800 shadow-md">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-blue-400 tracking-tight hover:text-blue-300 transition-colors">
          JEWS FULL KONTROL (JFK) 
        </Link>
        
        <div className="flex items-center space-x-6 text-base">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
          >
            About
          </Link>
          
          {/* Simple Copy Button */}
          <div className="relative">
            <button
              onClick={handleCopyClick}
              className="px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors flex items-center space-x-2"
              aria-label="Copy to clipboard"
              title="Copy to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span className="text-sm text-gray-300">28PL1UQ2BgnvawK4GfYVwEvP3woD9a1rne6TJXePpump</span>
            </button>
            
            {/* Copied Tooltip */}
            {showCopiedTooltip && (
              <div className="absolute top-full right-0 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-50 whitespace-nowrap">
                Copied to clipboard!
              </div>
            )}
          </div>
          
          <AudioControls />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;