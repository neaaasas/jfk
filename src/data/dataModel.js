// src/data/dataModel.js

/**
 * Data model for the JFK Assassination Network
 */

// Define possible connection types
export const ConnectionTypes = {
    ISRAELI: 'israeli',
    CIA: 'cia',
    MOB: 'mob',
    BUSINESS: 'business',
    POLITICAL: 'political',
    PERSONAL: 'personal',
    PROFESSIONAL: 'professional',
    INVESTIGATIVE: 'investigative',
    UNKNOWN: 'unknown'
  };
  
  // Define possible person groups/roles
  export const PersonGroups = {
    MAIN: 'main',
    SUSPECT: 'suspect',
    WITNESS: 'witness',
    INVESTIGATOR: 'investigation',
    INVOLVED: 'involved',
    ISRAELI_CONNECTION: 'israeli_connection',
    CIA_CONNECTION: 'cia_connection',
    MOB_CONNECTION: 'mob_connection',
    POLITICAL: 'political',
    FAMILY: 'family',
    OTHER: 'other'
  };
  
  /**
   * Format raw person data into a standardized person object
   * @param {Object} rawPerson - Raw person data from the source
   * @returns {Object} Formatted person object
   */
  export function formatPerson(rawPerson) {
    // Extract basic info from the raw data
    const { name, url } = rawPerson;
    
    // Extract biography from article sections
    const biography = extractBiography(rawPerson.article_sections);
    
    // Determine the person's primary role/group
    const group = determinePersonGroup(rawPerson);
    
    // Extract dates if available
    const birthDate = extractDate(rawPerson.infobox?.Born);
    const deathDate = extractDate(rawPerson.infobox?.Died);
    
    // Format the person object
    return {
      id: generateId(name),
      name,
      url,
      biography,
      group,
      birthDate,
      deathDate,
      occupation: rawPerson.infobox?.Occupation || 'Unknown',
      // Store the raw data for reference
      rawData: rawPerson
    };
  }
  
  /**
   * Create a connection between two people
   * @param {Object} sourcePerson - Source person
   * @param {Object} targetPerson - Target person
   * @param {string} connectionType - Type of connection
   * @param {string} description - Description of the connection
   * @returns {Object} Formatted connection object
   */
  export function createConnection(sourcePerson, targetPerson, connectionType = ConnectionTypes.UNKNOWN, description = '') {
    return {
      source: sourcePerson.id,
      target: targetPerson.id,
      type: connectionType,
      description
    };
  }
  
  /**
   * Extract a biography from article sections
   * @param {Object} sections - Article sections
   * @returns {string} Biography text
   */
  function extractBiography(sections) {
    // If there's a Lead section, use that
    if (sections?.Lead) {
      return sections.Lead;
    }
    
    // Otherwise, concatenate relevant sections
    const relevantSections = ['Lead', 'Early life', 'Biography', 'Background', 'Career'];
    let biography = '';
    
    for (const section of relevantSections) {
      if (sections?.[section]) {
        biography += sections[section] + '\n\n';
      }
    }
    
    return biography.trim() || 'No biography available.';
  }
  
  /**
   * Determine the person's primary group/role
   * @param {Object} person - Person data
   * @returns {string} Group identifier
   */
  function determinePersonGroup(person) {
    // Check for Israeli connections first (our primary focus)
    const israeliKeywords = ['Israel', 'Israeli', 'Mossad', 'Tel Aviv', 'Jerusalem', 'Zionist'];
    for (const section in person.article_sections || {}) {
      const content = person.article_sections[section];
      if (typeof content === 'string') {
        for (const keyword of israeliKeywords) {
          if (content.includes(keyword)) {
            return PersonGroups.ISRAELI_CONNECTION;
          }
        }
      }
    }
    
    // Check for other known classifications
    if (person.name === 'John F. Kennedy') {
      return PersonGroups.MAIN;
    }
    
    if (person.name === 'Lee Harvey Oswald') {
      return PersonGroups.SUSPECT;
    }
    
    // Default to 'other' if no specific group is identified
    return PersonGroups.OTHER;
  }
  
  /**
   * Extract a date from a text string
   * @param {string} dateString - Raw date string
   * @returns {string|null} Formatted date or null
   */
  function extractDate(dateString) {
    if (!dateString) return null;
    
    // Simple regex to extract dates in various formats
    const dateMatch = dateString.match(/\b(\w+ \d{1,2}, \d{4}|\d{1,2} \w+ \d{4}|\d{4})\b/);
    return dateMatch ? dateMatch[0] : null;
  }
  
  /**
   * Generate a consistent ID from a person's name
   * @param {string} name - Person's name
   * @returns {string} ID suitable for D3
   */
  export function generateId(name) {
    return name.toLowerCase().replace(/[^\w]/g, '_');
  }