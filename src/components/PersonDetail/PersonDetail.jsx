// src/components/PersonDetail/PersonDetail.jsx
import { useState, useEffect, useRef } from 'react';
import Card from '../common/Card';
import ConnectionsList from './ConnectionsList';
import PersonTimeline from './PersonTimeline';
import * as d3 from 'd3';
import israeliConnectionsData from '../../../public/data/israeli_connections_analysis.json';

const PersonDetail = ({ person, connections = [], colorScheme, onPersonClick }) => {
  const [activeTab, setActiveTab] = useState('biography');
  const miniNetworkRef = useRef(null);
  const [israeliPerson, setIsraeliPerson] = useState(null);
  const [israeliConnections, setIsraeliConnections] = useState([]);

  useEffect(() => {
    if (person && israeliConnectionsData) {
      const foundPerson = israeliConnectionsData.find(item => item.id === person.id);
      setIsraeliPerson(foundPerson || null);

      // Mock connections based on the first person in the data
      if (foundPerson) {
        const mockConnections = israeliConnectionsData.slice(0, 5).map(item => ({
          id: item.id,
          name: item.name,
          group: 'israeli_connection', // Assuming all are Israeli connections for this mock
          connectionType: 'israeli_connection',
          relationship: `Connected through shared interests in the JFK case (Confidence: ${item.confidenceLevel})`,
          strength: Math.floor(Math.random() * 3) + 1 // Random strength for mock data
        }));
        setIsraeliConnections(mockConnections);
      } else {
        setIsraeliConnections([]);
      }
    }
  }, [person]);

  // Create mini relationship visualization
  useEffect(() => {
    if (!miniNetworkRef.current || !person || !connections || connections.length === 0) return;
    
    // Clear any existing content
    d3.select(miniNetworkRef.current).selectAll("*").remove();
    
    const width = 260;
    const height = 200;
    
    // Create SVG
    const svg = d3.select(miniNetworkRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);
    
    // Add background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#121212")
      .attr("rx", 6)
      .attr("ry", 6);
      
    // Create nodes and links data
    const nodes = [
      { id: person.id, name: person.name, group: person.group, isMain: true },
      ...connections.map(conn => ({ 
        id: conn.id, 
        name: conn.name, 
        group: conn.group || 'other',
        connectionType: conn.connectionType 
      }))
    ];
    
    const links = connections.map(conn => ({
      source: person.id,
      target: conn.id,
      type: conn.connectionType
    }));
    
    // Create a force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(70))
      .force("charge", d3.forceManyBody().strength(-150))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(25));
    
    // Draw links
    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", d => d.type === 'israeli_connection' ? "#ff8c00" : "#444")
      .attr("stroke-opacity", d => d.type === 'israeli_connection' ? 0.9 : 0.5)
      .attr("stroke-width", d => d.type === 'israeli_connection' ? 2 : 1)
      .attr("stroke-dasharray", d => d.type === 'israeli_connection' ? "none" : "3,3");

    // Create node groups
    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node");
    
    // Add circles to nodes
    node.append("circle")
      .attr("r", d => d.isMain ? 18 : 12)
      .attr("fill", d => {
        const color = colorScheme?.[d.group || 'other']?.fill || "#6c757d";
        return d.isMain ? color : d3.color(color).brighter(0.3);
      })
      .attr("stroke", d => {
        const color = colorScheme?.[d.group || 'other']?.stroke || "#495057";
        return color;
      })
      .attr("stroke-width", d => d.isMain ? 2 : 1);
    
    // Add labels to nodes
    node.append("text")
      .text(d => d.name.split(' ').pop()) // Just show last name to save space
      .attr("font-size", d => d.isMain ? "10px" : "8px")
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("dy", d => d.isMain ? "0.35em" : "2.5em")
      .attr("pointer-events", "none")
      .style("text-shadow", "0 0 3px rgba(0,0,0,0.8)");
    
    // Add a special marker for Israeli connections
    node.filter(d => d.group === 'israeli_connection')
      .append("text")
      .text("★")
      .attr("font-size", "10px")
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("dy", -14)
      .attr("pointer-events", "none")
      .style("text-shadow", "0 0 4px rgba(0,0,0,0.8)");
    
    // Update positions on each tick of the simulation
    simulation.on("tick", () => {
      // Pin main person in center
      nodes.find(n => n.isMain).fx = width / 2;
      nodes.find(n => n.isMain).fy = height / 2;
      
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("transform", d => `translate(${d.x}, ${d.y})`);
    });
    
    // Warm up simulation then stop it
    simulation.alpha(1).restart();
    setTimeout(() => simulation.stop(), 1500);
    
    return () => {
      simulation.stop();
    };
  }, [person, connections, colorScheme]);

  if (!person) return null;

  const getGroupColor = (group) => {
    return colorScheme?.[group || 'other']?.fill || "#6c757d";
  };
  
  const tabs = [
    { id: 'biography', label: 'Biography' },
    { id: 'connections', label: 'Connections' },
    { id: 'timeline', label: 'Timeline' }
  ];

  return (
    <div className="person-detail text-white">
      {/* Person header with image and basic info */}
      <Card className="mb-4 border-2" style={{ 
        borderColor: getGroupColor(person.group),
        backgroundColor: '#1e1e1e',
        backgroundImage: person.group === 'israeli_connection' 
          ? 'radial-gradient(circle at top right, rgba(255, 140, 0, 0.15), transparent 70%)' 
          : 'none'
      }}>
        <div className="flex flex-col md:flex-row items-start md:items-center">
          {/* We could add person image here if available */}
          <div className="flex-grow">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold">{person.name}</h2>
              {person.group === 'israeli_connection' && (
                <span className="ml-2 text-orange-500 text-2xl">★</span>
              )}
            </div>
            
            <div className="flex items-center mt-2">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: getGroupColor(person.group) }}
              />
              <span className="capitalize text-gray-300">
                {person.group?.replace('_', ' ') || 'Unknown'}
              </span>
            </div>
            
            {person.aliases && person.aliases.length > 0 && (
              <div className="mt-3 text-sm text-gray-400">
                <span className="font-medium">Known aliases: </span>
                {person.aliases.join(', ')}
              </div>
            )}
          </div>
        </div>
      </Card>
      
      {/* Tab navigation */}
      <div className="border-b border-gray-800 mb-4">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id 
                  ? 'text-white border-b-2 border-orange-500' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab content */}
      <div className="tab-content">
        {activeTab === 'biography' && (
          <div className="biography">
            <Card>
              <h3 className="text-lg font-semibold mb-4">Biography</h3>
              
              {israeliPerson?.evidence ? (
                <div className="text-gray-300">
                  {/* Changed from <p> to <div> to avoid invalid nesting */}
                  <div>
                    {israeliPerson.evidence.map((evidenceItem, index) => (
                      <div key={index} className="mb-4">
                        <div className="font-semibold">{evidenceItem.source}:</div>
                        <div>{evidenceItem.context}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 italic">
                  <p>Biographical information is limited. This individual is connected to the JFK assassination network through various relationships and events.</p>
                  
                  {person.group === 'israeli_connection' && (
                    <p className="mt-3 text-orange-400">This person has been identified as having Israeli connections.</p>
                  )}
                </div>
              )}
              
              {/* Additional biographical details could be added here */}
              <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Role</h4>
                  <p className="text-white capitalize">{person.group?.replace('_', ' ') || 'Unknown'}</p>
                </div>
                
                {person.birth && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Born</h4>
                    <p className="text-white">{person.birth}</p>
                  </div>
                )}
                
                {person.death && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Died</h4>
                    <p className="text-white">{person.death}</p>
                  </div>
                )}
                
                {person.location && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Location</h4>
                    <p className="text-white">{person.location}</p>
                  </div>
                )}
              </div>
            </Card>
            
            {/* Network visualization info */}
            <Card className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Network visualization</h3>
              <p className="text-sm text-gray-400 mb-3">
                This person is connected to {connections.length} other individuals in the JFK assassination network.
              </p>
              
              <div className="bg-gray-800 bg-opacity-50 rounded-md p-3">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">Israeli connections:</span>
                  <span className="font-medium">
                    {connections.filter(c => c.group === 'israeli_connection' || c.connectionType === 'israeli_connection').length}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Other connections:</span>
                  <span className="font-medium">
                    {connections.filter(c => c.group !== 'israeli_connection' && c.connectionType !== 'israeli_connection').length}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}
        
        {activeTab === 'connections' && (
          <ConnectionsList 
            connections={israeliConnections} 
            colorScheme={colorScheme}
            onPersonClick={onPersonClick}
          />
        )}
        
        {activeTab === 'timeline' && (
          <PersonTimeline person={person} />
        )}
      </div>
    </div>
  );
};

export default PersonDetail;