// src/components/BubbleMap/BubbleMap.jsx
import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { loadAndProcessData } from '../../utils/israeliConnectionUtils';
import Modal from '../common/Modal';
import PersonDetail from '../PersonDetail/PersonDetail';
import Menorah from './menorah';
import { 
  colorScheme, 
  renderNetworkGraph, 
  getPersonConnections,
  LegendItem 
} from './bubbleUtils';

const BubbleMap = () => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [networkData, setNetworkData] = useState({ nodes: [], links: [] });
  const [highlightIsraeli, setHighlightIsraeli] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredNode, setHoveredNode] = useState(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  
  console.log("Modal state:", isModalOpen, selectedPerson);
  
  // Load data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await loadAndProcessData();
        setNetworkData(data);
      } catch (error) {
        console.error('Error loading network data:', error);
        // Fallback to sample data
        setNetworkData({
          nodes: [
            { id: "jfk", name: "John F. Kennedy", group: "main" },
            { id: "lho", name: "Lee Harvey Oswald", group: "suspect" },
            { id: "ruby", name: "Jack Ruby", group: "involved" },
            { id: "connally", name: "John Connally", group: "witness" },
            { id: "warren", name: "Earl Warren", group: "investigation" }
          ],
          links: [
            { source: "jfk", target: "lho" },
            { source: "jfk", target: "connally" },
            { source: "lho", target: "ruby" },
            { source: "connally", target: "warren" },
            { source: "ruby", target: "warren" }
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Filter nodes based on search term
  const filteredNodes = useMemo(() => {
    if (!searchTerm.trim() || !networkData.nodes) return networkData.nodes;
    
    return networkData.nodes.filter(node => 
      node.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [networkData.nodes, searchTerm]);

  // Handle clicking on a node
  const handleNodeClick = (node) => {
    console.log("Node clicked:", node);
    setSelectedPerson(node);
    setIsModalOpen(true);
    console.log("Modal should be open now");
  };

  // Render network graph when data changes
  useEffect(() => {
    if (!svgRef.current || isLoading || !networkData.nodes || networkData.nodes.length === 0) return;
    
    // Use the renderNetworkGraph utility from bubbleUtils
    const cleanup = renderNetworkGraph({
      svgRef,
      containerRef,
      tooltipRef,
      networkData,
      highlightIsraeli,
      handleNodeClick,
      setHoveredNode
    });
    
    return cleanup;
  }, [networkData, isLoading, highlightIsraeli]);

  // Toggle Israeli connection highlighting
  const toggleIsraeliHighlight = () => {
    setHighlightIsraeli(!highlightIsraeli);
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
          <div className="ml-4 text-lg">Loading network data...</div>
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <button
              onClick={toggleIsraeliHighlight}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                highlightIsraeli 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {highlightIsraeli ? 'Highlighting Israeli Connections' : 'Show All Connections Equally'}
            </button>
            
            <div className="ml-auto flex">
              <input
                type="text"
                placeholder="Search people..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="px-4 py-2 rounded-l-md bg-gray-800 border border-gray-700 text-white w-64 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className="bg-orange-500 text-white px-4 py-2 rounded-r-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Fixed container with explicit height */}
          <div 
            ref={containerRef} 
            className="flex-grow relative bg-[#121212] rounded-lg border border-gray-800" 
            style={{ height: 'calc(100vh - 250px)', minHeight: '500px' }}
          >
            <svg ref={svgRef} className="w-full h-full" />
            
            {/* Tooltip */}
            <div 
              ref={tooltipRef} 
              className="absolute hidden bg-gray-900 border border-gray-700 shadow-xl rounded-md p-3 z-50 max-w-xs pointer-events-none"
              style={{ transform: 'translateY(-100%)' }}
            >
              {hoveredNode && (
                <>
                  <div className="font-semibold text-lg mb-1">{hoveredNode.name}</div>
                  <div className="flex items-center mb-2">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: colorScheme[hoveredNode.group || 'other'].fill }}
                    />
                    <span className="capitalize">{hoveredNode.group?.replace('_', ' ') || 'Other'}</span>
                  </div>
                  <div className="text-xs text-gray-400">Click to view details</div>
                </>
              )}
            </div>
          </div>
          
          {/* Person Detail Modal */}
          <Modal 
            isOpen={isModalOpen} 
            onClose={handleCloseModal}
            title={selectedPerson?.name}
            position="center" 
          >
            {selectedPerson && (
              <PersonDetail 
                person={selectedPerson} 
                connections={getPersonConnections(networkData, selectedPerson.id)}
                colorScheme={colorScheme}
                onPersonClick={handleNodeClick}
              />
            )}
          </Modal>
        </>
      )}
    </div>
  );
};

export default BubbleMap;