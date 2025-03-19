// src/components/PersonDetail/ConnectionsList.jsx
import Card from '../common/Card';

const ConnectionsList = ({ connections = [], colorScheme, onPersonClick }) => {
  if (connections.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500 italic">No known connections.</p>
        </div>
      </Card>
    );
  }

  // Helper function to get role color
  const getRoleColor = (group) => {
    return colorScheme?.[group || 'other']?.fill || "#6c757d";
  };
  
  // Group connections by type
  const israeliConnections = connections.filter(conn => 
    conn.connectionType === 'israeli_connection' || conn.group === 'israeli_connection'
  );
  
  const otherConnections = connections.filter(conn => 
    conn.connectionType !== 'israeli_connection' && conn.group !== 'israeli_connection'
  );

  return (
    <div className="space-y-4">
      {/* Connection stats */}
      <Card>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Connection Summary</h3>
          <span className="text-gray-400 text-sm">{connections.length} total</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-800 bg-opacity-30 p-3 rounded-md">
            <div className="text-orange-400 font-medium">Israeli</div>
            <div className="text-2xl font-bold">{israeliConnections.length}</div>
          </div>
          
          <div className="bg-gray-800 bg-opacity-30 p-3 rounded-md">
            <div className="text-blue-400 font-medium">Other</div>
            <div className="text-2xl font-bold">{otherConnections.length}</div>
          </div>
        </div>
      </Card>
      
      {/* Israeli connections */}
      {israeliConnections.length > 0 && (
        <Card className="border-orange-800 bg-opacity-20 bg-orange-900">
          <h3 className="text-lg font-semibold text-orange-400 mb-3 flex items-center">
            <span className="mr-2">★</span>
            Israeli Connections
          </h3>
          
          <div className="space-y-3">
            {israeliConnections.map(connection => (
              <ConnectionItem 
                key={connection.id}
                connection={connection}
                colorScheme={colorScheme}
                onPersonClick={onPersonClick}
              />
            ))}
          </div>
        </Card>
      )}
      
      {/* Other connections */}
      {otherConnections.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold mb-3">Other Connections</h3>
          
          <div className="space-y-3">
            {otherConnections.map(connection => (
              <ConnectionItem 
                key={connection.id}
                connection={connection}
                colorScheme={colorScheme}
                onPersonClick={onPersonClick}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// Connection item component
const ConnectionItem = ({ connection, colorScheme, onPersonClick }) => {
  // Helper function to get role color
  const getRoleColor = (group) => {
    return colorScheme?.[group || 'other']?.fill || "#6c757d";
  };
  
  // Generate a placeholder relationship description if none exists
  const relationshipDescription = connection.relationship || 
    `Connected to ${connection.name}${connection.connectionType === 'israeli_connection' ? ' through Israeli networks' : ''}.`;
  
  return (
    <div 
      className="border-l-4 pl-3 py-2 hover:bg-gray-800 rounded-r-md transition-colors cursor-pointer"
      style={{ borderColor: getRoleColor(connection.group) }}
      onClick={() => onPersonClick && onPersonClick(connection)}
    >
      <div className="font-medium text-lg">
        {connection.name}
      </div>
      
      <div className="flex items-center mt-1">
        <span 
          className="inline-block w-2 h-2 rounded-full"
          style={{ backgroundColor: getRoleColor(connection.group) }}
        />
        <span className="ml-2 text-sm text-gray-400 capitalize">
          {connection.group?.replace('_', ' ') || 'Unknown'}
        </span>
        
        {connection.connectionType === 'israeli_connection' && (
          <span className="ml-2 text-orange-500">★</span>
        )}
      </div>
      
      <div className="mt-1 text-sm text-gray-400">
        {relationshipDescription}
      </div>
      
      {/* Confidence indicator */}
      <div className="mt-2 flex items-center">
        <span className="text-xs text-gray-500 mr-2">Connection strength:</span>
        <div className="flex space-x-1">
          {[1, 2, 3].map(i => (
            <div 
              key={i}
              className={`w-4 h-1 rounded-sm ${
                (connection.strength || 2) >= i 
                  ? 'bg-blue-400' 
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConnectionsList;