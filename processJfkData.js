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

// Enhanced version with weighted terms and contextual qualifiers
const ISRAELI_CONNECTION_CONFIG = {
  primaryTerms: [
    { term: 'Mossad', weight: 10 },
    { term: 'Israeli intelligence', weight: 10 },
    { term: 'Israel', weight: 8 },
    { term: 'Israeli', weight: 8 },
    { term: 'Shin Bet', weight: 8 },
    { term: 'Kidon', weight: 10 }
  ],
  secondaryTerms: [
    { term: 'Tel Aviv', weight: 5 },
    { term: 'Jerusalem', weight: 5 },
    { term: 'Zionist', weight: 6 },
    { term: 'Jewish Agency', weight: 6 },
    { term: 'Haganah', weight: 7 },
    { term: 'IDF', weight: 7 },
    { term: 'Dimona', weight: 6 },
    { term: 'Knesset', weight: 5 }
  ],
  // Context that strengthens the connection if found near a term
  positiveContext: [
    'agent', 'operative', 'spy', 'intelligence', 'connection', 
    'relationship', 'association', 'meeting', 'link', 'travel', 
    'collaborated', 'worked with', 'funded', 'supported'
  ],
  // Context that weakens the connection if found near a term
  negativeContext: [
    'denied', 'no evidence', 'unsubstantiated', 'rejected claims', 
    'conspiracy theory', 'dismissed allegations'
  ],
  // Threshold to consider it a reliable Israeli connection
  connectionThreshold: 5
};

// Enhanced relationship types to classify connections more specifically
const RELATIONSHIP_TYPES = [
  { name: 'professional', keywords: ['worked with', 'colleague', 'partner', 'associate', 'professional', 'business'] },
  { name: 'intelligence', keywords: ['agent', 'spy', 'operative', 'intelligence', 'CIA', 'FBI', 'Mossad', 'KGB', 'informant'] },
  { name: 'personal', keywords: ['friend', 'relative', 'acquaintance', 'family', 'married', 'dated', 'romantic'] },
  { name: 'adversarial', keywords: ['enemy', 'opponent', 'adversary', 'rival', 'accused', 'testified against'] },
  { name: 'conspiratorial', keywords: ['conspired', 'plotted', 'planned', 'scheme', 'secret', 'cover-up'] }
];

/**
 * Enhanced function to check if a person has connections to Israel based on their data
 * With confidence scoring and contextual analysis
 */
function analyzeIsraeliConnection(person) {
  // Skip if person is undefined or null
  if (!person) return { hasConnection: false, score: 0, evidence: [] };
  
  let connectionScore = 0;
  const evidence = [];
  
  // Search in infobox
  if (person.infobox) {
    for (const key in person.infobox) {
      const value = person.infobox[key];
      if (typeof value === 'string') {
        const result = analyzeTextForIsraeliConnection(value, `infobox.${key}`);
        if (result.score > 0) {
          connectionScore += result.score;
          evidence.push(...result.evidence);
        }
      }
    }
  }
  
  // Search in article sections
  if (person.article_sections) {
    for (const section in person.article_sections) {
      const content = person.article_sections[section];
      if (typeof content === 'string') {
        const result = analyzeTextForIsraeliConnection(content, `article_sections.${section}`);
        if (result.score > 0) {
          connectionScore += result.score;
          evidence.push(...result.evidence);
        }
      }
    }
  }
  
  // Search in internal links
  if (person.internal_links) {
    for (const link of person.internal_links) {
      if (link.text) {
        const result = analyzeTextForIsraeliConnection(link.text, 'internal_links');
        if (result.score > 0) {
          connectionScore += result.score * 0.7; // Reduce weight for link text
          evidence.push(...result.evidence);
        }
      }
      
      if (link.href) {
        // Check for specific Israeli-related links
        const linkResult = analyzeTextForIsraeliConnection(link.href, 'internal_links_href');
        if (linkResult.score > 0) {
          connectionScore += linkResult.score * 0.8;
          evidence.push(...linkResult.evidence);
        }
      }
    }
  }
  
  // Determine if the connection is strong enough
  const hasConnection = connectionScore >= ISRAELI_CONNECTION_CONFIG.connectionThreshold;
  
  return { 
    hasConnection, 
    score: connectionScore, 
    evidence: evidence,
    confidenceLevel: getConfidenceLevel(connectionScore)
  };
}

/**
 * Analyze a specific text for Israeli connection indicators
 */
function analyzeTextForIsraeliConnection(text, source) {
  if (!text) return { score: 0, evidence: [] };
  
  const textLower = text.toLowerCase();
  let score = 0;
  const evidence = [];
  
  // Check for primary terms (strong indicators)
  for (const term of ISRAELI_CONNECTION_CONFIG.primaryTerms) {
    if (textLower.includes(term.term.toLowerCase())) {
      const context = extractContext(textLower, term.term.toLowerCase());
      
      // Check if there are positive or negative contextual modifiers
      const contextScore = analyzeContext(context);
      
      // Calculate the final term score
      const termScore = term.weight * contextScore;
      score += termScore;
      
      evidence.push({
        term: term.term,
        source,
        context,
        score: termScore,
        contextScore
      });
    }
  }
  
  // Check for secondary terms (weaker indicators)
  for (const term of ISRAELI_CONNECTION_CONFIG.secondaryTerms) {
    if (textLower.includes(term.term.toLowerCase())) {
      const context = extractContext(textLower, term.term.toLowerCase());
      
      // Check if there are positive or negative contextual modifiers
      const contextScore = analyzeContext(context);
      
      // Calculate the final term score
      const termScore = term.weight * contextScore;
      score += termScore;
      
      evidence.push({
        term: term.term,
        source,
        context,
        score: termScore,
        contextScore
      });
    }
  }
  
  return { score, evidence };
}

/**
 * Extract surrounding context for a term
 */
function extractContext(text, term) {
  const index = text.indexOf(term);
  if (index === -1) return '';
  
  const start = Math.max(0, index - 100);
  const end = Math.min(text.length, index + term.length + 100);
  
  return text.substring(start, end);
}

/**
 * Analyze context for modifiers that strengthen or weaken a connection
 * Returns a multiplier (0.1 to 1.5)
 */
function analyzeContext(context) {
  let contextScore = 1.0; // Default neutral score
  
  // Check for positive context that strengthens the connection
  for (const positive of ISRAELI_CONNECTION_CONFIG.positiveContext) {
    if (context.includes(positive.toLowerCase())) {
      contextScore += 0.3; // Increased from 0.25
    }
  }
  
  // Check for negative context that weakens the connection
  for (const negative of ISRAELI_CONNECTION_CONFIG.negativeContext) {
    if (context.includes(negative.toLowerCase())) {
      contextScore -= 0.2; // Decreased from 0.3 to be less punitive
    }
  }
  
  // Increased upper bound
  return Math.max(0.1, Math.min(contextScore, 2.0)); // Increased from 1.5
}

/**
 * Determine confidence level based on score
 */
function getConfidenceLevel(score) {
  if (score >= 12) return 'very_high';  // Decreased from 15
  if (score >= 8) return 'high';       // Decreased from 12
  if (score >= 5) return 'medium';     // Matches new threshold
  if (score >= 3) return 'low';        // Decreased from 5
  return 'very_low';
}

/**
 * Generate a consistent ID from a person's name
 */
function generateId(name) {
  return name.toLowerCase().replace(/[^\w]/g, '_');
}

/**
 * Analyze the type of relationship between two people
 */
function analyzeRelationship(person1, person2) {
  if (!person1 || !person2) return { type: 'unknown', strength: 0 };
  
  // Check if person2 is mentioned in person1's article
  const mentionedIn = findMentions(person1, person2.name);
  if (!mentionedIn.found) return { type: 'unknown', strength: 0 };
  
  // Determine relationship type based on context
  const relationshipTypes = [];
  const context = mentionedIn.context.toLowerCase();
  
  for (const relType of RELATIONSHIP_TYPES) {
    for (const keyword of relType.keywords) {
      if (context.includes(keyword.toLowerCase())) {
        relationshipTypes.push({
          type: relType.name,
          keyword,
          // Count occurrences to estimate strength
          count: countOccurrences(context, keyword.toLowerCase())
        });
      }
    }
  }
  
  // Calculate the relationship strength (1-3)
  // Based on number of mentions and context clarity
  const mentionCount = mentionedIn.count;
  let strength = 1; // Default low strength
  
  if (mentionCount >= 3 || (mentionCount >= 1 && relationshipTypes.length >= 2)) {
    strength = 3; // Strong relationship
  } else if (mentionCount >= 2 || (mentionCount >= 1 && relationshipTypes.length >= 1)) {
    strength = 2; // Medium relationship
  }
  
  // Determine the dominant relationship type
  let dominantType = 'unknown';
  if (relationshipTypes.length > 0) {
    // Sort by count and take the highest
    relationshipTypes.sort((a, b) => b.count - a.count);
    dominantType = relationshipTypes[0].type;
  }
  
  return {
    type: dominantType,
    strength,
    types: relationshipTypes,
    mentionCount,
    excerpt: mentionedIn.context
  };
}

/**
 * Find mentions of a name in a person's data
 */
function findMentions(person, targetName) {
  if (!person.article_sections) return { found: false, count: 0 };
  
  let totalCount = 0;
  let bestContext = '';
  let found = false;
  
  // Prepare variations of the target name to check
  const nameParts = targetName.split(' ');
  const lastName = nameParts[nameParts.length - 1];
  const nameVariations = [
    targetName,
    lastName
  ];
  
  // Check each article section
  for (const section in person.article_sections) {
    const content = person.article_sections[section];
    if (typeof content !== 'string') continue;
    
    // Check for each name variation
    for (const nameVar of nameVariations) {
      const count = countOccurrences(content, nameVar);
      if (count > 0) {
        found = true;
        totalCount += count;
        
        // Extract the best context (prioritize full name mentions)
        if (nameVar === targetName || bestContext === '') {
          bestContext = extractContext(content, nameVar);
        }
      }
    }
  }
  
  return {
    found,
    count: totalCount,
    context: bestContext
  };
}

/**
 * Count occurrences of a substring in a string
 */
function countOccurrences(text, subtext) {
  let count = 0;
  let index = text.indexOf(subtext);
  
  while (index !== -1) {
    count++;
    index = text.indexOf(subtext, index + 1);
  }
  
  return count;
}

/**
 * Process the JFK data with enhanced analysis
 */
function processJfkData(inputFilePath, outputFilePath) {
  try {
    console.log(`Reading data from ${inputFilePath}...`);
    const rawData = fs.readFileSync(inputFilePath, 'utf8');
    const peopleData = JSON.parse(rawData);
    
    console.log(`Processing ${peopleData.length} people...`);
    
    // Analyze Israeli connections with confidence scoring
    const israeliAnalysis = peopleData.map(person => {
      const analysis = analyzeIsraeliConnection(person);
      return {
        name: person.name,
        id: generateId(person.name),
        hasConnection: analysis.hasConnection,
        score: analysis.score,
        confidenceLevel: analysis.confidenceLevel,
        evidence: analysis.evidence
      };
    });
    
    // Filter those with confirmed Israeli connections
    const israeliConnected = israeliAnalysis.filter(person => person.hasConnection);
    
    console.log(`Found ${israeliConnected.length} people with Israeli connections:`);
    israeliConnected.forEach(person => {
      console.log(`- ${person.name} (Confidence: ${person.confidenceLevel}, Score: ${person.score.toFixed(1)})`);
    });
    
    // Create nodes for the network graph with improved attributes
    const nodes = peopleData.map(person => {
      const id = generateId(person.name);
      const israeliAnalysisResult = israeliAnalysis.find(a => a.id === id) || 
        { hasConnection: false, score: 0, confidenceLevel: 'none' };
      
      // Determine group more specifically
      let group = 'other';
      
      // Check for specific roles mentioned in the data
      if (israeliAnalysisResult.hasConnection) {
        group = 'israeli_connection';
      } else if (isInRole(person, ["suspect", "accused", "assassin", "shooter", "gunman"])) {
        group = 'suspect';
      } else if (isInRole(person, ["witness", "witnessed", "testimony", "saw", "observed"])) {
        group = 'witness';
      } else if (isInRole(person, ["fbi", "cia", "police", "investigation", "commission", "detective", "agent", "investigator"])) {
        group = 'investigation';
      } else if (isInRole(person, ["involved", "participant", "associate", "accomplice"])) {
        group = 'involved';
      } else if (person.name.includes("Kennedy") || person.name === "John F. Kennedy") {
        group = 'main';
      }
      
      return {
        id,
        name: person.name,
        group,
        url: person.url || '',
        bio: extractBiography(person),
        // New enhanced fields
        israeliConnection: israeliAnalysisResult.hasConnection,
        israeliConnectionScore: israeliAnalysisResult.score,
        israeliConnectionConfidence: israeliAnalysisResult.confidenceLevel,
        // Extract basic info
        birth: person.infobox?.Born || null,
        death: person.infobox?.Died || null,
        occupation: person.infobox?.["Occupation(s)"] || person.infobox?.Occupation || null,
        // Include original data reference for detailed views
        dataRef: person
      };
    });
    
    // Create enhanced links with relationship types and strengths
    const links = [];
    
    // Process connections between all people
    for (let i = 0; i < peopleData.length; i++) {
      const sourcePerson = peopleData[i];
      const sourceId = generateId(sourcePerson.name);
      const sourceNode = nodes.find(n => n.id === sourceId);
      
      for (let j = 0; j < peopleData.length; j++) {
        if (i === j) continue; // Skip self-connections
        
        const targetPerson = peopleData[j];
        const targetId = generateId(targetPerson.name);
        const targetNode = nodes.find(n => n.id === targetId);
        
        // Analyze the relationship
        const relationship = analyzeRelationship(sourcePerson, targetPerson);
        
        // Only create links for relationships with sufficient evidence
        if (relationship.strength > 0) {
          // Determine link type (prioritize israeli_connection if either node has it)
          let linkType = relationship.type;
          if (sourceNode.israeliConnection && targetNode.israeliConnection) {
            linkType = 'israeli_connection';
          } else if (sourceNode.israeliConnection || targetNode.israeliConnection) {
            // If only one has Israeli connection, check if the relationship context mentions Israel
            if (relationship.excerpt && ISRAELI_KEYWORDS.some(keyword => 
              relationship.excerpt.toLowerCase().includes(keyword.toLowerCase())
            )) {
              linkType = 'israeli_connection';
            }
          }
          
          links.push({
            source: sourceId,
            target: targetId,
            type: linkType,
            relationshipType: relationship.type,
            strength: relationship.strength,
            excerpt: relationship.excerpt
          });
        }
      }
    }
    
    // Create the network data structure with enhanced metadata
    const networkData = {
      nodes,
      links,
      metadata: {
        totalPeople: peopleData.length,
        israeliConnections: israeliConnected.length,
        relationshipTypes: RELATIONSHIP_TYPES.map(rt => rt.name),
        generatedDate: new Date().toISOString(),
        // Group statistics
        groups: {
          israeli_connection: nodes.filter(n => n.group === 'israeli_connection').length,
          main: nodes.filter(n => n.group === 'main').length,
          suspect: nodes.filter(n => n.group === 'suspect').length,
          witness: nodes.filter(n => n.group === 'witness').length,
          investigation: nodes.filter(n => n.group === 'investigation').length,
          involved: nodes.filter(n => n.group === 'involved').length,
          other: nodes.filter(n => n.group === 'other').length
        }
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
    
    // Write a detailed report of Israeli connections for reference
    const reportPath = path.join(dir, 'israeli_connections_analysis.json');
    fs.writeFileSync(
      reportPath,
      JSON.stringify(israeliConnected, null, 2),
      'utf8'
    );
    
    console.log('Processing complete!');
    console.log(`Generated ${nodes.length} nodes and ${links.length} links`);
    console.log(`Israeli connections report written to ${reportPath}`);
    
  } catch (error) {
    console.error('Error processing JFK data:', error);
    process.exit(1);
  }
}

/**
 * Check if a person's data indicates a specific role
 */
function isInRole(person, roleKeywords) {
  if (!person) return false;
  
  // Helper to check text for role keywords
  const checkText = (text) => {
    if (!text || typeof text !== 'string') return false;
    const lowerText = text.toLowerCase();
    return roleKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
  };
  
  // Check infobox
  if (person.infobox) {
    for (const key in person.infobox) {
      if (checkText(person.infobox[key])) return true;
    }
  }
  
  // Check article sections
  if (person.article_sections) {
    for (const section in person.article_sections) {
      if (checkText(person.article_sections[section])) return true;
    }
  }
  
  return false;
}

/**
 * Extract a short biography from person data
 */
function extractBiography(person) {
  if (!person.article_sections) return '';
  
  // Try to use the Lead section if available
  if (person.article_sections.Lead) {
    return truncate(person.article_sections.Lead, 300);
  }
  
  // Otherwise find the first non-empty section
  for (const section in person.article_sections) {
    if (person.article_sections[section]) {
      return truncate(person.article_sections[section], 300);
    }
  }
  
  return '';
}

/**
 * Truncate text to a specific length
 */
function truncate(text, maxLength) {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength) + '...';
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