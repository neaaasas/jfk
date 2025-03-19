// src/components/Navigation/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  
  return (
    <nav className="bg-gradient-to-r from-[#1a1a1a] to-[#252525] border-b border-gray-800 shadow-md">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-blue-400 tracking-tight hover:text-blue-300 transition-colors">
          JFK Network
        </Link>
        
        <div className="flex items-center space-x-6 text-base">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link 
            to="/israeli-connections" 
            className="nav-link active-permanent"
          >
            Israeli Connections
          </Link>
          <Link 
            to="/about" 
            className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
          >
            About
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;