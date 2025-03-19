// src/components/Navigation/FilterControls.jsx
import { useState, useEffect } from 'react';

const FilterControls = ({ onFilterChange, data }) => {
  const [activeFilters, setActiveFilters] = useState({
    // Connection types
    israeliConnection: true,
    cia: false,
    mob: false,
    political: false,
    personal: false,
    
    // Person roles
    witnesses: false,
    suspects: false,
    investigators: false,
    
    // Time periods
    pre1963: false,
    assassination: false,
    post1963: false,
    
    // Connection strength
    primaryConnections: true,
    secondaryConnections: true
  });
  
  // Statistics about the network data
  const [stats, setStats] = useState({
    totalPeople: 0,
    totalConnections: 0,
    israeliConnections: 0,
    otherConnections: {
      cia: 0,
      mob: 0
    }
  });
  
  // Calculate statistics when data changes
  useEffect(() => {
    if (!data || !data.nodes || !data.links) return;
    
    const israeliConnections = data.links.filter(link => link.type === 'israeli_connection').length;
    const ciaConnections = data.links.filter(link => link.type === 'cia').length;
    const mobConnections = data.links.filter(link => link.type === 'mob').length;
    
    setStats({
      totalPeople: data.nodes.length,
      totalConnections: data.links.length,
      israeliConnections,
      otherConnections: {
        cia: ciaConnections,
        mob: mobConnections
      }
    });
  }, [data]);

  const handleFilterToggle = (filterName) => {
    const updatedFilters = {
      ...activeFilters,
      [filterName]: !activeFilters[filterName]
    };
    
    setActiveFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Filter Network</h3>
        
        {/* Network statistics */}
        <div className="text-sm text-gray-400">
          <span className="mr-4">{stats.totalPeople} people</span>
          <span>{stats.totalConnections} connections</span>
        </div>
      </div>
      
      {/* Connection Type Filters */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-500 mb-2">Connection Types</h4>
        <div className="flex flex-wrap gap-2">
          <FilterButton 
            label={`Israeli (${stats.israeliConnections})`} 
            active={activeFilters.israeliConnection} 
            onClick={() => handleFilterToggle('israeliConnection')}
            color="#ff8c00"
          />
          
          <FilterButton 
            label={`CIA (${stats.otherConnections.cia || 0})`} 
            active={activeFilters.cia} 
            onClick={() => handleFilterToggle('cia')}
            color="#4CAF50"
          />
          
          <FilterButton 
            label={`Mob (${stats.otherConnections.mob || 0})`} 
            active={activeFilters.mob} 
            onClick={() => handleFilterToggle('mob')}
            color="#f44336"
          />
          
          <FilterButton 
            label="Political" 
            active={activeFilters.political} 
            onClick={() => handleFilterToggle('political')}
            color="#9c27b0"
          />
          
          <FilterButton 
            label="Personal" 
            active={activeFilters.personal} 
            onClick={() => handleFilterToggle('personal')}
            color="#2196f3"
          />
        </div>
      </div>
      
      {/* Person Role Filters */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-500 mb-2">Person Roles</h4>
        <div className="flex flex-wrap gap-2">
          <FilterButton 
            label="Witnesses" 
            active={activeFilters.witnesses} 
            onClick={() => handleFilterToggle('witnesses')}
            color="#a8dadc"
          />
          
          <FilterButton 
            label="Suspects" 
            active={activeFilters.suspects} 
            onClick={() => handleFilterToggle('suspects')}
            color="#f1c453"
          />
          
          <FilterButton 
            label="Investigators" 
            active={activeFilters.investigators} 
            onClick={() => handleFilterToggle('investigators')}
            color="#1d3557"
          />
        </div>
      </div>
      
      {/* Time Period Filters */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-500 mb-2">Time Period</h4>
        <div className="flex flex-wrap gap-2">
          <FilterButton 
            label="Pre-1963" 
            active={activeFilters.pre1963} 
            onClick={() => handleFilterToggle('pre1963')}
            color="#78909c"
          />
          
          <FilterButton 
            label="Assassination" 
            active={activeFilters.assassination} 
            onClick={() => handleFilterToggle('assassination')}
            color="#e63946"
          />
          
          <FilterButton 
            label="Post-1963" 
            active={activeFilters.post1963} 
            onClick={() => handleFilterToggle('post1963')}
            color="#607d8b"
          />
        </div>
      </div>
      
      {/* Network Depth */}
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-2">Connection Depth</h4>
        <div className="flex flex-wrap gap-2">
          <FilterButton 
            label="Primary Connections" 
            active={activeFilters.primaryConnections} 
            onClick={() => handleFilterToggle('primaryConnections')}
            color="#03a9f4"
          />
          
          <FilterButton 
            label="Secondary Connections" 
            active={activeFilters.secondaryConnections} 
            onClick={() => handleFilterToggle('secondaryConnections')}
            color="#8bc34a"
          />
        </div>
      </div>
      
      {/* Advanced filter options could be added here */}
    </div>
  );
};

const FilterButton = ({ label, active, onClick, color }) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center ${
        active 
          ? 'bg-opacity-90 text-white' 
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
      style={{ backgroundColor: active ? color : undefined }}
    >
      <span className={`mr-1.5 inline-block w-3 h-3 rounded-full ${active ? 'bg-white' : ''}`} 
            style={{ border: `2px solid ${color}` }}></span>
      {label}
    </button>
  );
};

export default FilterControls;