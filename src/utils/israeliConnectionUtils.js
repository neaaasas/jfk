// src/utils/israeliConnectionUtils.js

// Keywords that suggest Israeli connections
const ISRAELI_KEYWORDS = [
  'Israel', 'Israeli', 'Mossad', 'Tel Aviv', 'Jerusalem', 'Zionist', 
  'Hebrew', 'Jewish Agency', 'Jewish state', 'Haganah', 'IDF',
  'Shin Bet', 'Kidon', 'Negev', 'Galilee', 'Dimona', 'Knesset'
];

/**
 * Check if a person has connections to Israel based on their data
 * @param {Object} person - Person data object
 * @returns {Object} Result with connection info
 */
export function hasIsraeliConnection(person) {
  // Skip if person is undefined or null
  if (!person) return { hasConnection: false };
  
  // Search in infobox
  if (person.infobox) {
    for (const key in person.infobox) {
      const value = person.infobox[key];
      if (typeof value === 'string') {
        for (const keyword of ISRAELI_KEYWORDS) {
          if (value.includes(keyword)) {
            return {
              hasConnection: true,
              source: `infobox.${key}`,
              keyword
            };
          }
        }
      }
    }
  }
  
  // Search in article sections
  if (person.article_sections) {
    for (const section in person.article_sections) {
      const content = person.article_sections[section];
      if (typeof content === 'string') {
        for (const keyword of ISRAELI_KEYWORDS) {
          if (content.includes(keyword)) {
            return {
              hasConnection: true,
              source: `article_sections.${section}`,
              keyword,
              excerpt: extractExcerpt(content, keyword)
            };
          }
        }
      }
    }
  }
  
  // Search in internal links
  if (person.internal_links) {
    for (const link of person.internal_links) {
      for (const keyword of ISRAELI_KEYWORDS) {
        if ((link.text && link.text.includes(keyword)) || 
            (link.href && link.href.includes(keyword))) {
          return {
            hasConnection: true,
            source: 'internal_links',
            keyword,
            link
          };
        }
      }
    }
  }
  
  return { hasConnection: false };
}

/**
 * Extract a relevant excerpt around the keyword
 * @param {string} text - Full text to search in
 * @param {string} keyword - Keyword to find
 * @returns {string} Excerpt containing the keyword
 */
function extractExcerpt(text, keyword) {
  const index = text.indexOf(keyword);
  if (index === -1) return '';
  
  const start = Math.max(0, index - 100);
  const end = Math.min(text.length, index + keyword.length + 100);
  
  return text.substring(start, end) + '...';
}

/**
 * Generate a consistent ID from a person's name
 * @param {string} name - Person's name
 * @returns {string} ID suitable for D3
 */
export function generateId(name) {
  return name.toLowerCase().replace(/[^\w]/g, '_');
}

/**
 * Load and process network data
 */
export async function loadAndProcessData() {
  try {
    const response = await fetch('/data/jfk-network.json');
    if (!response.ok) {
      throw new Error('Failed to load network data');
    }
    
    const data = await response.json();
    return enhanceNetworkData(data);
  } catch (error) {
    console.error('Error loading data:', error);
    // Return empty data structure instead of fake data
    return {
      nodes: [],
      links: [],
      centralNodes: [],
      metadata: {
        totalPeople: 0,
        israeliConnections: 0,
        error: error.message
      }
    };
  }
}

/**
 * Enhance network data with additional derived properties
 */
function enhanceNetworkData(data) {
  const { nodes, links } = data;
  
  // Calculate connection weights and centrality
  const nodeDegrees = {};
  
  // Count connections for each node
  links.forEach(link => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    
    nodeDegrees[sourceId] = (nodeDegrees[sourceId] || 0) + 1;
    nodeDegrees[targetId] = (nodeDegrees[targetId] || 0) + 1;
  });
  
  // Enhance nodes with additional information
  const enhancedNodes = nodes.map(node => ({
    ...node,
    degree: nodeDegrees[node.id] || 0,
    // Scale node size by number of connections
    size: calculateNodeSize(nodeDegrees[node.id] || 0),
    // Count Israeli connections specifically
    israeliConnectionsCount: links.filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return (
        (sourceId === node.id || targetId === node.id) && 
        link.type === 'israeli_connection'
      );
    }).length
  }));
  
  // Process links to ensure they have complete information
  const enhancedLinks = links.map(link => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    
    const sourceNode = enhancedNodes.find(n => n.id === sourceId);
    const targetNode = enhancedNodes.find(n => n.id === targetId);
    
    return {
      ...link,
      source: sourceId,
      target: targetId,
      // Use relationship strength or default to a medium value
      value: link.strength || 2,
      // Generate a tooltip description if none exists
      description: link.excerpt || generateConnectionDescription(sourceNode, targetNode, link)
    };
  });
  
  // Calculate most central nodes
  const centralNodes = [...enhancedNodes]
    .sort((a, b) => b.degree - a.degree)
    .slice(0, 10)
    .map(n => n.id);
  
  return {
    nodes: enhancedNodes,
    links: enhancedLinks,
    centralNodes,
    metadata: data.metadata || {
      totalPeople: enhancedNodes.length,
      israeliConnections: enhancedNodes.filter(n => n.group === 'israeli_connection').length
    }
  };
}

/**
 * Calculate node size based on degree (number of connections)
 */
function calculateNodeSize(degree) {
  // Base size + additional size based on connections
  const baseSize = 25;
  const additionalSize = Math.min(degree * 2, 20); // Cap the additional size
  return baseSize + additionalSize;
}

/**
 * Generate a description for a connection if none exists
 */
function generateConnectionDescription(sourceNode, targetNode, link) {
  if (!sourceNode || !targetNode) {
    return "Connected in the JFK assassination network.";
  }
  
  let relationshipDesc = "";
  
  // Use relationship type if available
  if (link.relationshipType) {
    switch (link.relationshipType) {
      case 'professional':
        relationshipDesc = "had a professional relationship with";
        break;
      case 'intelligence':
        relationshipDesc = "worked with in intelligence operations";
        break;
      case 'personal':
        relationshipDesc = "had a personal connection to";
        break;
      case 'adversarial':
        relationshipDesc = "was an adversary of";
        break;
      case 'conspiratorial':
        relationshipDesc = "was allegedly involved in plotting with";
        break;
      default:
        relationshipDesc = "was connected to";
    }
  } else {
    relationshipDesc = "was connected to";
  }
  
  // Special description for Israeli connections
  if (link.type === 'israeli_connection') {
    return `${sourceNode.name} had Israeli intelligence connections with ${targetNode.name}.`;
  }
  
  return `${sourceNode.name} ${relationshipDesc} ${targetNode.name}.`;
}