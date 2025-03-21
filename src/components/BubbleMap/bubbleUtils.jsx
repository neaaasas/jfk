import * as d3 from 'd3';

// Enhanced color scheme
export const colorScheme = {
  main: { fill: '#e63946', stroke: '#c81d29' },
  suspect: { fill: '#f1c453', stroke: '#d9aa33' },
  witness: { fill: '#a8dadc', stroke: '#7dbdc0' },
  involved: { fill: '#457b9d', stroke: '#2a6183' },
  investigation: { fill: '#1d3557', stroke: '#0a2440' },
  other: { fill: '#6c757d', stroke: '#495057' },
  israeli_connection: { fill: '#ff8c00', stroke: '#e67e00' },
};

// Helper function to get connected node ids
export function getConnectedNodes(networkData, nodeId) {
  return networkData.links
    .filter(l => {
      const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
      const targetId = typeof l.target === 'object' ? l.target.id : l.target;
      return sourceId === nodeId || targetId === nodeId;
    })
    .map(l => {
      const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
      const targetId = typeof l.target === 'object' ? l.target.id : l.target;
      return sourceId === nodeId ? targetId : sourceId;
    });
}

// Get connections for a specific person
export function getPersonConnections(networkData, personId) {
  if (!networkData.links) return [];
  
  const connections = [];
  
  networkData.links.forEach(link => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    
    if (sourceId === personId) {
      const connectedPerson = networkData.nodes.find(n => n.id === targetId);
      if (connectedPerson) {
        connections.push({
          ...connectedPerson,
          connectionType: link.type || 'standard'
        });
      }
    } else if (targetId === personId) {
      const connectedPerson = networkData.nodes.find(n => n.id === sourceId);
      if (connectedPerson) {
        connections.push({
          ...connectedPerson,
          connectionType: link.type || 'standard'
        });
      }
    }
  });
  
  return connections;
}

// Initialize and render the D3 network graph
export function renderNetworkGraph({
  svgRef, 
  containerRef, 
  tooltipRef,
  networkData, 
  highlightIsraeli, 
  handleNodeClick,
  setHoveredNode
}) {
  // Clear any existing SVG content
  d3.select(svgRef.current).selectAll("*").remove();

  // Get container dimensions
  const container = containerRef.current;
  const width = container ? container.clientWidth : 800;
  const height = container ? container.clientHeight : 600;
  
  // Create the SVG
  const svg = d3.select(svgRef.current)
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height]);
    
  // Add a subtle grid pattern for better visual depth
  const defs = svg.append("defs");
  
  // Add a subtle grid pattern
  const pattern = defs.append("pattern")
    .attr("id", "grid")
    .attr("width", 40)
    .attr("height", 40)
    .attr("patternUnits", "userSpaceOnUse");
    
  pattern.append("path")
    .attr("d", "M 40 0 L 0 0 0 40")
    .attr("fill", "none")
    .attr("stroke", "#222")
    .attr("stroke-width", 0.5);
    
  // Add a radial gradient for node backgrounds
  const gradient = defs.selectAll(".node-gradient")
    .data(Object.entries(colorScheme))
    .enter()
    .append("radialGradient")
    .attr("id", d => `gradient-${d[0]}`)
    .attr("cx", "50%")
    .attr("cy", "50%")
    .attr("r", "50%");
    
  gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", d => {
      try {
        return d3.color(d[1].fill).brighter(0.5);
      } catch (e) {
        console.warn("Error with color:", e);
        return "#ffffff"; // Default to white if there's an error
      }
    });
    
  gradient.append("stop")
    .attr("offset", "80%")
    .attr("stop-color", d => d[1].fill);
    
  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", d => {
      try {
        return d3.color(d[1].fill).darker(0.5);
      } catch (e) {
        console.warn("Error with color:", e);
        return "#000000"; // Default to black if there's an error
      }
    });
  
  // Add glow filter for highlighted nodes
  const filter = defs.append("filter")
    .attr("id", "glow")
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%");
    
  filter.append("feGaussianBlur")
    .attr("stdDeviation", "3")
    .attr("result", "coloredBlur");
    
  const femerge = filter.append("feMerge");
  femerge.append("feMergeNode")
    .attr("in", "coloredBlur");
  femerge.append("feMergeNode")
    .attr("in", "SourceGraphic");
  
  // Add background rect with grid pattern
  svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "#121212");
  
  // Add a subtle grid
  svg.append("g")
    .attr("class", "grid")
    .selectAll("line")
    .data(d3.range(0, width, 40))
    .enter()
    .append("line")
    .attr("x1", d => d)
    .attr("y1", 0)
    .attr("x2", d => d)
    .attr("y2", height)
    .attr("stroke", "#222")
    .attr("stroke-width", 0.5);
    
  svg.append("g")
    .attr("class", "grid")
    .selectAll("line")
    .data(d3.range(0, height, 40))
    .enter()
    .append("line")
    .attr("x1", 0)
    .attr("y1", d => d)
    .attr("x2", width)
    .attr("y2", d => d)
    .attr("stroke", "#222")
    .attr("stroke-width", 0.5);
  
  // Add zoom functionality
  const zoom = d3.zoom()
    .scaleExtent([0.3, 5])
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
    });
  
  svg.call(zoom);
  
  // Create a group for all elements (for zooming)
  const g = svg.append("g");

  // Pre-position nodes in a more stable pattern to reduce initial chaotic movement
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Setup nodes in a circular pattern for more stable initial positions
  const nodeCount = networkData.nodes.length;
  const radius = Math.min(width, height) * 0.35;
  
  networkData.nodes.forEach((node, i) => {
    // Position nodes in a circle to start
    const angle = (i / nodeCount) * 2 * Math.PI;
    // Add a small random offset to prevent perfect overlaps
    const jitter = Math.random() * 5;
    node.x = centerX + radius * Math.cos(angle) + jitter;
    node.y = centerY + radius * Math.sin(angle) + jitter;
    
    // Store initial position for fast reset
    node.initialX = node.x;
    node.initialY = node.y;
  });

  // Create a force simulation with optimized settings for less movement and better anti-overlap
  const simulation = d3.forceSimulation(networkData.nodes)
    .force("link", d3.forceLink(networkData.links)
      .id(d => d.id)
      .distance(162.5) // Increased by 25% from 130 for better spacing
      .strength(0.25)) // Reduced for less aggressive pulling
    .force("charge", d3.forceManyBody()
      .strength(-437.5) // Increased by 25% from -350 for more repulsive force
      .distanceMax(375)) // Increased by 25% from 300 to extend effect range
    .force("center", d3.forceCenter(width / 2, height / 2).strength(0.05)) // Gentle centering force
    .force("collision", d3.forceCollide()
      .radius(d => d.group === 'israeli_connection' ? 62.5 : 50) // Increased by 25% from 50/40
      .strength(1.0)) // Maximum strength to prevent overlaps
    .force("x", d3.forceX(width / 2).strength(0.02)) // Very gentle force to pull toward center X
    .force("y", d3.forceY(height / 2).strength(0.02)) // Very gentle force to pull toward center Y
    .velocityDecay(0.7) // Higher friction to dampen movement
    .alphaDecay(0.15) // Faster decay for quicker stabilization
    .alphaMin(0.001); // Stop simulation sooner

  // Stop simulation after shorter time (2.5 seconds) to prevent continuous CPU usage
  setTimeout(() => {
    if (simulation) {
      simulation.stop();
      console.log("Force simulation stopped to save resources");
    }
  }, 2500);
  
  // Draw lines with simplified styling
  const link = g.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(networkData.links)
    .enter()
    .append("line")
    .attr("stroke", d => d.type === 'israeli_connection' ? "#ff8c00" : "#444")
    .attr("stroke-opacity", d => d.type === 'israeli_connection' ? 0.8 : 0.4)
    .attr("stroke-width", d => d.type === 'israeli_connection' ? 2 : 1) // Slightly reduced for performance
    .attr("stroke-dasharray", d => d.type === 'israeli_connection' ? "none" : "3,3")
    // Render lines with simplified path calculation
    .attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y);

  // Add Menorah image to defs
  defs.append("symbol")
    .attr("id", "menorah-symbol")
    .attr("viewBox", "0 0 100 100")
    .attr("width", 70)
    .attr("height", 70)
    .html(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#3b82f6">
        <!-- Base -->
        <rect x="40" y="85" width="20" height="10" rx="2" />
        <rect x="35" y="80" width="30" height="5" rx="1" />
        
        <!-- Center stem -->
        <rect x="48" y="30" width="4" height="50" />
        
        <!-- Candle holders -->
        <circle cx="50" cy="25" r="4" />
        <circle cx="35" cy="25" r="4" />
        <circle cx="20" cy="25" r="4" />
        <circle cx="65" cy="25" r="4" />
        <circle cx="80" cy="25" r="4" />
        <circle cx="27.5" cy="25" r="4" />
        <circle cx="42.5" cy="25" r="4" />
        <circle cx="57.5" cy="25" r="4" />
        <circle cx="72.5" cy="25" r="4" />
        
        <!-- Arms -->
        <path d="M50,30 Q35,50 35,25" stroke-width="4" stroke="#3b82f6" fill="none" />
        <path d="M50,30 Q20,70 20,25" stroke-width="4" stroke="#3b82f6" fill="none" />
        <path d="M50,30 Q65,50 65,25" stroke-width="4" stroke="#3b82f6" fill="none" />
        <path d="M50,30 Q80,70 80,25" stroke-width="4" stroke="#3b82f6" fill="none" />
        <path d="M50,30 Q27.5,60 27.5,25" stroke-width="4" stroke="#3b82f6" fill="none" />
        <path d="M50,30 Q42.5,45 42.5,25" stroke-width="4" stroke="#3b82f6" fill="none" />
        <path d="M50,30 Q57.5,45 57.5,25" stroke-width="4" stroke="#3b82f6" fill="none" />
        <path d="M50,30 Q72.5,60 72.5,25" stroke-width="4" stroke="#3b82f6" fill="none" />
        
        <!-- Shamash (taller center candle) -->
        <rect x="48" y="15" width="4" height="10" />
        <circle cx="50" cy="12" r="4" />
      </svg>
    `);

  // Create node groups
  const node = g.append("g")
    .attr("class", "nodes")
    .selectAll(".node")
    .data(networkData.nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended))
    .on("click", (event, d) => {
      event.stopPropagation();
      handleNodeClick(d);
    })
    .on("mouseover", (event, d) => {
      setHoveredNode(d);
      
      // Highlight this node and connected nodes
      const connected = getConnectedNodes(networkData, d.id);
      
      node.style("opacity", n => {
        if (n.id === d.id) return 1;
        if (connected.includes(n.id)) return 0.8;
        return 0.3;
      });
      
      link.style("opacity", l => {
        const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
        const targetId = typeof l.target === 'object' ? l.target.id : l.target;
        
        if (sourceId === d.id || targetId === d.id) return 1;
        return 0.1;
      });
      
      // Show tooltip
      const tooltip = d3.select(tooltipRef.current);
      tooltip
        .style("display", "block")
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 10}px`);
    })
    .on("mousemove", (event) => {
      // Move tooltip with mouse
      const tooltip = d3.select(tooltipRef.current);
      tooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 10}px`);
    })
    .on("mouseout", () => {
      setHoveredNode(null);
      
      // Reset opacity
      node.style("opacity", d => {
        if (highlightIsraeli) {
          return d.group === 'israeli_connection' ? 1 : 0.5;
        }
        return 1;
      });
      
      link.style("opacity", l => {
        if (highlightIsraeli) {
          return l.type === 'israeli_connection' ? 0.9 : 0.2;
        }
        return 0.7;
      });
      
      // Hide tooltip
      d3.select(tooltipRef.current).style("display", "none");
    });

  // Add circles to nodes with gradient fills and error handling
  node.append("circle")
    .attr("r", d => d.group === 'israeli_connection' ? 35 : 28)
    .attr("fill", d => {
      try {
        // Make sure we have a valid group or default to 'other'
        const group = d.group && colorScheme[d.group] ? d.group : 'other';
        return `url(#gradient-${group})`;
      } catch (e) {
        console.warn("Error with fill gradient:", e);
        return "url(#gradient-other)"; // Default to 'other' if there's an error
      }
    })
    .attr("stroke", d => {
      try {
        // Make sure we have a valid group or default to 'other'
        const group = d.group && colorScheme[d.group] ? d.group : 'other';
        return colorScheme[group].stroke;
      } catch (e) {
        console.warn("Error with stroke:", e);
        return "#495057"; // Default to 'other' stroke if there's an error
      }
    })
    .attr("stroke-width", d => d.group === 'israeli_connection' ? 3 : 2)
    .attr("filter", d => d.group === 'israeli_connection' ? "url(#glow)" : "none");

  // Add Menorah icon for Israeli connections instead of star
  node.filter(d => d.group === 'israeli_connection')
    .append("use")
    .attr("href", "#menorah-symbol")
    .attr("x", -25)
    .attr("y", -25)
    .attr("width", 50)
    .attr("height", 50);

  // Add labels to nodes
  node.append("text")
    .text(d => d.name)
    .attr("font-size", "10px")
    .attr("text-anchor", "middle")
    .attr("fill", "#fff")
    .attr("dy", "0.35em")
    .attr("pointer-events", "none")
    .style("text-shadow", "0 0 3px rgba(0,0,0,0.8)");

  // Apply a visual effect to highlight Israeli connections
  if (highlightIsraeli) {
    node.filter(d => d.group !== 'israeli_connection')
      .style("opacity", 0.5);
    
    link.filter(d => d.type !== 'israeli_connection')
      .style("opacity", 0.2);
  }

  // Add a reset button to help when layout gets messy
  const resetButton = svg.append("g")
    .attr("class", "reset-button")
    .attr("transform", `translate(${width - 60}, 30)`)
    .style("cursor", "pointer")
    .on("click", resetLayout);
    
  resetButton.append("rect")
    .attr("width", 50)
    .attr("height", 25)
    .attr("rx", 5)
    .attr("fill", "#333")
    .attr("stroke", "#666")
    .attr("stroke-width", 1);
    
  resetButton.append("text")
    .text("Reset")
    .attr("x", 25)
    .attr("y", 16)
    .attr("text-anchor", "middle")
    .attr("fill", "#fff")
    .style("font-size", "12px");

  // Limit number of ticks to reduce performance impact
  let tickCounter = 0;
  const MAX_TICKS = 80; // Limit total simulation steps
  
  // Update positions on each tick with limited iterations
  simulation.on("tick", () => {
    tickCounter++;
    
    // Only update DOM every other tick for better performance
    if (tickCounter % 2 !== 0 && tickCounter < MAX_TICKS - 1) {
      return; // Skip DOM updates on odd ticks
    }
    
    // Stop after MAX_TICKS iterations
    if (tickCounter >= MAX_TICKS) {
      simulation.stop();
      console.log("Force simulation stopped after reaching max ticks");
      return;
    }
    
    // Keep nodes within bounds for better visibility
    networkData.nodes.forEach(d => {
      // Use node radius with padding
      const radius = d.group === 'israeli_connection' ? 40 : 35;
      d.x = Math.max(radius, Math.min(width - radius, d.x));
      d.y = Math.max(radius, Math.min(height - radius, d.y));
    });
    
    // Update link positions
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    // Update node positions
    node
      .attr("transform", d => `translate(${d.x}, ${d.y})`);
  });

  // Reset layout function - returns bubbles to initial positions with error handling
  function resetLayout() {
    try {
      simulation.stop();
      
      // Create a transition for smooth reset
      const t = d3.transition()
        .duration(800)
        .ease(d3.easeElastic);
      
      // Animate nodes back to initial positions with safety checks
      node.transition(t)
        .attr("transform", d => {
          // Check if initialX/Y exists, otherwise use current position
          const x = typeof d.initialX === 'number' ? d.initialX : d.x;
          const y = typeof d.initialY === 'number' ? d.initialY : d.y;
          return `translate(${x}, ${y})`;
        });
      
      // Update node positions in the data
      networkData.nodes.forEach(node => {
        if (typeof node.initialX === 'number' && typeof node.initialY === 'number') {
          node.x = node.initialX;
          node.y = node.initialY;
        }
      });
      
      // Update link positions with transition and safety checks
      link.transition(t)
        .attr("x1", d => {
          const source = typeof d.source === 'object' ? d.source : {};
          return typeof source.initialX === 'number' ? source.initialX : source.x || 0;
        })
        .attr("y1", d => {
          const source = typeof d.source === 'object' ? d.source : {};
          return typeof source.initialY === 'number' ? source.initialY : source.y || 0;
        })
        .attr("x2", d => {
          const target = typeof d.target === 'object' ? d.target : {};
          return typeof target.initialX === 'number' ? target.initialX : target.x || 0;
        })
        .attr("y2", d => {
          const target = typeof d.target === 'object' ? d.target : {};
          return typeof target.initialY === 'number' ? target.initialY : target.y || 0;
        });
    } catch (error) {
      console.error("Error in reset layout:", error);
    }
  }

  // Modified drag functions for better stability
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
    
    // Update position immediately for responsive dragging
    d3.select(this).attr("transform", `translate(${event.x}, ${event.y})`);
    
    // Update connected links for immediate feedback
    link
      .filter(l => l.source === d || l.target === d)
      .attr("x1", l => (l.source === d) ? event.x : l.source.x)
      .attr("y1", l => (l.source === d) ? event.y : l.source.y)
      .attr("x2", l => (l.target === d) ? event.x : l.target.x)
      .attr("y2", l => (l.target === d) ? event.y : l.target.y);
  }

  function dragended(event, d) {
    if (!event.active) {
      simulation.alphaTarget(0).alpha(0.1);
      // Stop simulation after short delay
      setTimeout(() => simulation.stop(), 300);
    }
    // Keep node fixed where the user dropped it
    d.fx = event.x;
    d.fy = event.y;
  }

  // Return cleanup function
  return () => {
    if (simulation) simulation.stop();
  };
}

// Helper component for legend items
export const LegendItem = ({ color, label }) => (
  <div className="flex items-center mr-4">
    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color }} />
    <span className="text-sm text-gray-300">{label}</span>
  </div>
);