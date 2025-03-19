// src/pages/PersonPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import { loadAndProcessData } from '../utils/israeliConnectionUtils';

const PersonPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load person data and their connections
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load network data
        const networkData = await loadAndProcessData();
        
        // Find the person by ID
        const personData = networkData.nodes.find(p => p.id === id);
        
        if (!personData) {
          setError(`Person with ID "${id}" not found`);
          setIsLoading(false);
          return;
        }
        
        // Get connections from the links
        const personConnections = networkData.links
          .filter(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            return sourceId === id || targetId === id;
          })
          .map(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            const connectedId = sourceId === id ? targetId : sourceId;
            const connectedPerson = networkData.nodes.find(p => p.id === connectedId);
            
            return {
              ...connectedPerson,
              connectionType: link.type || 'standard'
            };
          });
        
        // Set data
        setPerson(personData);
        setConnections(personConnections);
      } catch (err) {
        console.error('Error loading person data:', err);
        setError('Failed to load person data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // If the person is not found
  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4 text-red-400">Error</h1>
          <p className="text-red-200">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700"
          >
            Return to Network
          </button>
        </div>
      </div>
    );
  }
  
  if (isLoading || !person) {
    return (
      <div className="max-w-4xl mx-auto py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
        <div className="ml-4 text-lg">Loading person data...</div>
      </div>
    );
  }

  const getRoleColor = (group) => {
    const colors = {
      main: 'bg-red-600',
      suspect: 'bg-yellow-600',
      witness: 'bg-blue-400',
      involved: 'bg-blue-600',
      investigation: 'bg-blue-900',
      israeli_connection: 'bg-orange-500',
      other: 'bg-gray-600'
    };
    
    return colors[group] || colors.other;
  };
  
  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-6">
        <Link to="/" className="text-blue-400 hover:text-blue-300 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Network
        </Link>
      </div>
      
      <div className="flex items-center mb-6">
        <h1 className="text-4xl font-bold">{person.name}</h1>
        {person.group && (
          <span className={`${getRoleColor(person.group)} ml-4 px-3 py-1 rounded-full text-sm font-medium`}>
            {person.group.replace('_', ' ')}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="md:col-span-2">
          <Card className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Biography</h2>
            {person.bio ? (
              <p className="text-gray-300">{person.bio}</p>
            ) : (
              <div className="bg-gray-800 p-4 rounded-md">
                <p className="text-gray-400 italic">No biographical information available.</p>
                <p className="text-gray-500 text-sm mt-2">
                  This person was identified as part of the JFK assassination network, but detailed biographical information has not been processed yet.
                </p>
              </div>
            )}
          </Card>
          
          {/* Israeli connection info */}
          {person.group === 'israeli_connection' && (
            <Card className="mb-6 border-orange-800">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center mr-3">
                  <span className="text-xl">★</span>
                </div>
                <h2 className="text-2xl font-semibold text-orange-400">Israeli Connection</h2>
              </div>
              
              {person.connectionInfo ? (
                <div>
                  <p className="mb-2">
                    <span className="font-medium text-orange-300">Source:</span>{' '}
                    <span className="text-gray-300">{person.connectionInfo.source}</span>
                  </p>
                  {person.connectionInfo.excerpt && (
                    <div className="mt-3">
                      <p className="font-medium text-orange-300 mb-2">Relevant excerpt:</p>
                      <div className="bg-gray-800 p-3 rounded-md text-gray-300 text-sm italic">
                        "{person.connectionInfo.excerpt}"
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 italic">
                  This person has been identified as having Israeli connections.
                </p>
              )}
            </Card>
          )}
          
          {/* Timeline placeholder */}
          <Card>
            <h2 className="text-2xl font-semibold mb-4">Timeline</h2>
            <div className="bg-gray-800 p-4 rounded-md">
              <p className="text-gray-400 italic">Timeline information coming soon.</p>
              <p className="text-gray-500 text-sm mt-2">
                We're working on a chronological view of this person's involvement in events related to the JFK assassination.
              </p>
            </div>
          </Card>
        </div>
        
        {/* Connections sidebar */}
        <div>
          <Card>
            <h2 className="text-2xl font-semibold mb-4">Connections</h2>
            {connections.length > 0 ? (
              <div className="space-y-4">
                {connections.map(connection => (
                  <div 
                    key={connection.id} 
                    className={`border-l-4 ${
                      connection.connectionType === 'israeli_connection' 
                        ? 'border-orange-500' 
                        : 'border-gray-700'
                    } pl-3 py-1`}
                  >
                    <Link 
                      to={`/person/${connection.id}`}
                      className="font-medium text-blue-400 hover:text-blue-300 hover:underline block"
                    >
                      {connection.name}
                    </Link>
                    
                    <div className="flex items-center mt-1">
                      <span 
                        className={`inline-block w-2 h-2 rounded-full ${getRoleColor(connection.group)}`}
                      />
                      <span className="ml-2 text-sm text-gray-400 capitalize">
                        {connection.group?.replace('_', ' ') || 'Unknown'}
                      </span>
                    </div>
                    
                    {connection.connectionType === 'israeli_connection' && (
                      <div className="mt-1 text-xs text-orange-500 flex items-center">
                        <span className="mr-1">★</span> Israeli connection
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">No known connections in the dataset.</p>
            )}
          </Card>
          
          {/* External resources */}
          <Card className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Resources</h2>
            {person.url ? (
              <div>
                <a 
                  href={person.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 hover:underline flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                  Wikipedia Page
                </a>
              </div>
            ) : (
              <p className="text-gray-400 italic">No external resources available.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PersonPage;