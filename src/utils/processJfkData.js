// processJfkData.js
// Place this file in the root of your project (same level as package.json)
import fs from 'fs';
import path from 'path';

// Keywords that suggest Israeli connections
const ISRAELI_KEYWORDS = [
  'Israel', 'Israeli', 'Mossad', 'Tel Aviv', 'Jerusalem', 'Zionist', 
  'Hebrew', 'Jewish Agency', 'Jewish state', 'Haganah', 'IDF',
  'Shin Bet', 'Kidon', 'Negev', 'Galilee', 'Dimona', 'Knesset'
];

/**
 * Check if a person has connections to Israel based on their data
 */
function hasIsraeliConnection(person) {
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
 */
function generateId(name) {
  return name.toLowerCase().replace(/[^\w]/g, '_');
}

/**
 * Process the JFK data
 */
function processJfkData(inputFilePath, outputFilePath) {
  try {
    console.log(`Reading data from ${inputFilePath}...`);
    const rawData = fs.readFileSync(inputFilePath, 'utf8');
    const peopleData = JSON.parse(rawData);
    
    console.log(`Processing ${peopleData.length} people...`);
    
    // Identify people with Israeli connections
    const israeliConnected = peopleData.filter(person => 
      hasIsraeliConnection(person).hasConnection
    );
    
    console.log(`Found ${israeliConnected.length} people with Israeli connections`);
    
    // Create nodes for the network graph
    const nodes = peopleData.map(person => {
      const id = generateId(person.name);
      const isIsraeliConnected = hasIsraeliConnection(person).hasConnection;
      
      return {
        id,
        name: person.name,
        group: isIsraeliConnected ? 'israeli_connection' : 'other',
        url: person.url || '',
        // Extract a short bio if available
        bio: extractBiography(person)
      };
    });
    
    // Create links between Israeli-connected people and others they're connected to
    const links = [];
    
    // For each Israeli-connected person
    israeliConnected.forEach(sourcePerson => {
      const sourceId = generateId(sourcePerson.name);
      
      // For each other Israeli-connected person
      israeliConnected.forEach(targetPerson => {
        // Skip self-connections
        if (sourcePerson.name === targetPerson.name) return;
        
        const targetId = generateId(targetPerson.name);
        
        // Add a connection if the source mentions the target
        if (isPersonMentioned(sourcePerson, targetPerson.name)) {
          links.push({
            source: sourceId,
            target: targetId,
            type: 'israeli_connection'
          });
        }
      });

      // Also connect to some non-Israeli people who are mentioned
      peopleData
        .filter(p => !hasIsraeliConnection(p).hasConnection)
        .forEach(targetPerson => {
          if (isPersonMentioned(sourcePerson, targetPerson.name)) {
            links.push({
              source: sourceId,
              target: generateId(targetPerson.name),
              type: 'standard'
            });
          }
        });
    });
    
    // Create the network data structure
    const networkData = {
      nodes,
      links,
      metadata: {
        totalPeople: peopleData.length,
        israeliConnections: israeliConnected.length,
        generatedDate: new Date().toISOString()
      }
    };
    
    // Ensure the directory exists
    const dir = path.dirname(outputFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write to output file
    console.log(`Writing processed data to ${outputFilePath}...`);
    fs.writeFileSync(
      outputFilePath, 
      JSON.stringify(networkData, null, 2),
      'utf8'
    );
    
    console.log('Processing complete!');
    console.log(`Generated ${nodes.length} nodes and ${links.length} links`);
    
  } catch (error) {
    console.error('Error processing JFK data:', error);
    process.exit(1);
  }
}

/**
 * Extract a short biography from person data
 */
function extractBiography(person) {
  if (!person.article_sections) return '';
  
  // Try to use the Lead section if available
  if (person.article_sections.Lead) {
    return truncate(person.article_sections.Lead, 200);
  }
  
  // Otherwise find the first non-empty section
  for (const section in person.article_sections) {
    if (person.article_sections[section]) {
      return truncate(person.article_sections[section], 200);
    }
  }
  
  return '';
}

/**
 * Truncate text to a specific length
 */
function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Check if one person is mentioned in another's data
 */
function isPersonMentioned(person, targetName) {
  if (!person.article_sections) return false;
  
  for (const section in person.article_sections) {
    const content = person.article_sections[section];
    if (typeof content === 'string' && content.includes(targetName)) {
      return true;
    }
  }
  
  return false;
}

// Get command line arguments
const args = process.argv.slice(2);
const inputFilePath = args[0];
const outputFilePath = args[1] || 'public/data/jfk-network.json';

if (!inputFilePath) {
  console.error('Usage: node processJfkData.js <input-file> [output-file]');
  process.exit(1);
}

// Run the processing
processJfkData(inputFilePath, outputFilePath);