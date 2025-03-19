import * as d3 from 'd3';

// Optimize color schema
export const colorScheme = {
  main: { fill: "#FFD700", stroke: "#B8860B" },
  suspect: { fill: "#DC143C", stroke: "#8B0000" },
  involved: { fill: "#FF8C00", stroke: "#CD6600" },
  witness: { fill: "#3CB371", stroke: "#2E8B57" },
  investigation: { fill: "#4169E1", stroke: "#0000CD" },
  israeli_intelligence: { fill: "#1E90FF", stroke: "#0000FF" },
  us_intelligence: { fill: "#9932CC", stroke: "#8B008B" },
  organized_crime: { fill: "#FF6347", stroke: "#CD5B45" },
  government: { fill: "#808080", stroke: "#696969" },
  other: { fill: "#A9A9A9", stroke: "#2F4F4F" }
};

// Performance configuration for D3 simulation
const PERFORMANCE_CONFIG = {
  // Reduce simulation complexity
  FORCE_STRENGTH: 0.05, // Lower value means less intense forces
  LINK_STRENGTH: 0.5, // Higher value makes links more rigid 
  CHARGE_STRENGTH: -30, // Less negative means less repulsion
  COLLISION_RADIUS: 20, // Larger value prevents nodes from overlapping too much
  
  // Limit visual complexity
  MAX_LINKS_RENDERED: 150, // Maximum number of connection lines to render
  LINK_OPACITY: 0.5, // Lower opacity for links
  USE_STRAIGHT_LINES: true, // Use straight lines instead of curved paths
  
  // Animation settings
  ALPHA_DECAY: 0.05, // Higher value makes simulation stabilize faster
  VELOCITY_DECAY: 0.4, // Higher value slows down node movement
  
  // Rendering optimization
  RENDER_THROTTLE: 16, // Render at ~60fps
};

// Throttle function to limit how often a function runs
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const renderNetworkGraph = ({
  svgRef,
  containerRef,
  tooltipRef,
  networkData,
  highlightIsraeli,
  handleNodeClick,
  setHoveredNode
}) => {
  const svg = d3.select(svgRef.current);
  const container = d3.select(containerRef.current);
  const tooltip = d3.select(tooltipRef.current);
  
  svg.selectAll("*").remove();
  
  // Get container dimensions for responsive sizing
  const width = containerRef.current.clientWidth;
  const height = containerRef.current.clientHeight;
  
  // Create the main SVG group for all elements
  const g = svg.append("g");
  
  // Create zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([0.1, 5])
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
    });
  
  svg.call(zoom);
  
  // Prioritize links to show (limit number of links to improve performance)
  const prioritizedLinks = [...networkData.links]
    .sort((a, b) => {
      // Prioritize links connected to important nodes
      const aImportance = getNodeImportance(a.source, networkData.nodes) + 
                         getNodeImportance(a.target, networkData.nodes);
      const bImportance = getNodeImportance(b.source, networkData.nodes) + 
                         getNodeImportance(b.target, networkData.nodes);
      return bImportance - aImportance;
    })
    .slice(0, PERFORMANCE_CONFIG.MAX_LINKS_RENDERED);
  
  // Create the force simulation
  const simulation = d3.forceSimulation(networkData.nodes)
    .force("link", d3.forceLink(prioritizedLinks)
      .id(d => d.id)
      .distance(60)
      .strength(PERFORMANCE_CONFIG.LINK_STRENGTH))
    .force("charge", d3.forceManyBody()
      .strength(PERFORMANCE_CONFIG.CHARGE_STRENGTH))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide(PERFORMANCE_CONFIG.COLLISION_RADIUS))
    .alphaDecay(PERFORMANCE_CONFIG.ALPHA_DECAY)
    .velocityDecay(PERFORMANCE_CONFIG.VELOCITY_DECAY);
  
  // Draw links with optimized rendering
  const link = g.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(prioritizedLinks)
    .enter().append("line")
    .attr("stroke", d => {
      // Determine if this is an Israeli connection
      const sourceIsIsraeli = d.source.group === 'israeli_intelligence' || d.source.israeli_connection;
      const targetIsIsraeli = d.target.group === 'israeli_intelligence' || d.target.israeli_connection;
      
      if (highlightIsraeli && (sourceIsIsraeli || targetIsIsraeli)) {
        return "#0038b8"; // Israeli blue
      }
      return "#444";
    })
    .attr("stroke-width", d => {
      // Make important connections more visible
      const sourceIsIsraeli = d.source.group === 'israeli_intelligence' || d.source.israeli_connection;
      const targetIsIsraeli = d.target.group === 'israeli_intelligence' || d.target.israeli_connection;
      
      if (highlightIsraeli && (sourceIsIsraeli || targetIsIsraeli)) {
        return 1.5;
      }
      return 0.8;
    })
    .attr("stroke-opacity", PERFORMANCE_CONFIG.LINK_OPACITY);
  
  // Draw nodes with optimized rendering
  const node = g.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(networkData.nodes)
    .enter().append("circle")
    .attr("r", d => {
      // Adjust node size based on importance
      return 5 + (getNodeImportance(d.id, networkData.nodes) * 3);
    })
    .attr("fill", d => {
      if (d.israeli_connection && highlightIsraeli) {
        return "#0038b8"; // Israeli blue
      }
      return colorScheme[d.group || 'other'].fill;
    })
    .attr("stroke", d => {
      if (d.israeli_connection && highlightIsraeli) {
        return "#ffffff";
      }
      return colorScheme[d.group || 'other'].stroke;
    })
    .attr("stroke-width", d => d.israeli_connection && highlightIsraeli ? 2 : 1)
    .call(drag(simulation));
  
  // Optimize tooltip events using throttling
  node.on("mouseover", throttle(function(event, d) {
    setHoveredNode(d);
    tooltip.style("display", "block")
      .style("left", `${event.pageX + 10}px`)
      .style("top", `${event.pageY - 10}px`);
  }, 100))
  .on("mouseout", () => {
    setHoveredNode(null);
    tooltip.style("display", "none");
  })
  .on("click", (event, d) => {
    event.stopPropagation();
    handleNodeClick(d);
  });
  
  // Throttled tick function to improve performance
  const tickFunction = () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);
    
    node
      .attr("cx", d => {
        // Keep nodes within bounds
        return d.x = Math.max(10, Math.min(width - 10, d.x));
      })
      .attr("cy", d => {
        return d.y = Math.max(10, Math.min(height - 10, d.y));
      });
  };
  
  // Create throttled tick handler for better performance
  const throttledTick = throttle(tickFunction, PERFORMANCE_CONFIG.RENDER_THROTTLE);
  simulation.on("tick", throttledTick);
  
  // Drag functionality
  function drag(simulation) {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }
  
  // Helper function to determine node importance
  function getNodeImportance(nodeId, nodes) {
    // Count connections to this node
    const node = typeof nodeId === 'object' ? nodeId : 
                 nodes.find(n => n.id === nodeId);
    
    if (!node) return 1;
    
    // Base importance on predefined groups
    const groupImportance = {
      'main': 5,
      'suspect': 4,
      'israeli_intelligence': 4,
      'us_intelligence': 3.5,
      'involved': 3,
      'witness': 2,
      'investigation': 2.5,
      'organized_crime': 3,
      'government': 2,
      'other': 1
    };
    
    return groupImportance[node.group] || 1;
  }
  
  // Return cleanup function
  return () => {
    simulation.stop();
    svg.selectAll("*").remove();
  };
};

export function getPersonConnections(networkData, personId) {
  if (!networkData.links) return [];
  
  return networkData.links
    .filter(link => link.source.id === personId || link.target.id === personId || 
                    link.source === personId || link.target === personId)
    .map(link => {
      const otherId = link.source.id === personId || link.source === personId 
        ? (link.target.id || link.target) 
        : (link.source.id || link.source);
      
      const otherNode = networkData.nodes.find(node => node.id === otherId);
      
      return {
        id: otherId,
        name: otherNode ? otherNode.name : otherId,
        group: otherNode ? otherNode.group : 'unknown',
        relationship: link.relationship || 'connected to'
      };
    });
}

// Legend item component
export const LegendItem = ({ color, label }) => (
  <div className="flex items-center mb-1">
    <div 
      className="w-4 h-4 mr-2 rounded-sm" 
      style={{ backgroundColor: color }}
    ></div>
    <span className="text-sm">{label}</span>
  </div>
);
