// src/components/PersonDetail/PersonTimeline.jsx
import { useState, useEffect } from 'react';
import Card from '../common/Card';

const PersonTimeline = ({ person }) => {
  const [events, setEvents] = useState([]);
  
  // Generate sample timeline data when component mounts or person changes
  // In a production app, you would fetch this data from your API
  useEffect(() => {
    if (!person) return;
    
    // Sample timeline data (this would come from your backend in production)
    // These are important events related to the JFK assassination
    const sampleEvents = [
      {
        date: '1962-09-26',
        title: 'Connection to Oswald established',
        description: 'First documented meeting with Lee Harvey Oswald in New Orleans.',
        importance: 'high'
      },
      {
        date: '1963-01-15',
        title: 'Trip to Mexico City',
        description: 'Traveled to Mexico City where Cuban and Soviet embassies were located.',
        importance: 'medium'
      },
      {
        date: '1963-04-10',
        title: 'Israeli intelligence contact',
        description: 'Met with individuals associated with Israeli intelligence services.',
        importance: 'high', 
        isIsraeli: true
      },
      {
        date: '1963-11-13',
        title: 'Arrived in Dallas',
        description: 'Arrived in Dallas just over a week before the assassination.',
        importance: 'critical'
      },
      {
        date: '1963-11-21',
        title: 'Day before assassination',
        description: 'Last known whereabouts before the Kennedy assassination.',
        importance: 'critical'
      },
      {
        date: '1963-11-23',
        title: 'Post-assassination activities',
        description: 'Reported movements following the assassination of President Kennedy.',
        importance: 'high'
      }
    ];
    
    // Sort by date
    const sortedEvents = sampleEvents.sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    setEvents(sortedEvents);
  }, [person]);
  
  if (events.length === 0) {
    return (
      <Card>
        <div className="p-4 text-center">
          <p className="text-gray-500 italic">Timeline information coming soon.</p>
          <p className="text-gray-600 text-sm mt-2">
            We're working on a chronological view of this person's involvement in events related to the JFK assassination.
          </p>
        </div>
      </Card>
    );
  }
  
  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Helper function to get importance color
  const getImportanceColor = (importance) => {
    const colors = {
      low: 'bg-gray-600',
      medium: 'bg-blue-600',
      high: 'bg-orange-600',
      critical: 'bg-red-600'
    };
    
    return colors[importance] || colors.medium;
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-lg font-semibold mb-3">Key Events</h3>
        <div className="text-sm text-gray-400 mb-4">
          Timeline of events related to the JFK assassination
        </div>
        
        {/* Timeline visualization */}
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-700" />
          
          {/* Events */}
          <div className="space-y-8 relative pl-14">
            {events.map((event, index) => (
              <div 
                key={`${event.date}-${index}`}
                className="relative"
              >
                {/* Date indicator */}
                <div className="flex items-center mb-2">
                  {/* Dot on timeline */}
                  <div 
                    className={`absolute left-[-32px] w-4 h-4 rounded-full ${getImportanceColor(event.importance)} flex items-center justify-center border-2 border-gray-900`}
                  >
                    {event.isIsraeli && (
                      <span className="text-white text-xs">★</span>
                    )}
                  </div>
                  
                  <span className="text-gray-400 text-sm">
                    {formatDate(event.date)}
                  </span>
                  
                  {/* Importance indicator */}
                  <div 
                    className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getImportanceColor(event.importance)} bg-opacity-80 text-white`}
                  >
                    {event.importance}
                  </div>
                </div>
                
                {/* Event content */}
                <div 
                  className={`p-3 rounded-md ${
                    event.isIsraeli 
                      ? 'bg-orange-900 bg-opacity-20 border border-orange-800' 
                      : 'bg-gray-800 bg-opacity-30'
                  }`}
                >
                  <h4 className="font-medium">
                    {event.title}
                    {event.isIsraeli && (
                      <span className="ml-2 text-orange-500">★</span>
                    )}
                  </h4>
                  <p className="mt-1 text-gray-300 text-sm">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
      
      {/* Timeline legend */}
      <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-400">
        <div className="flex items-center">
          <span className={`inline-block w-3 h-3 rounded-full bg-gray-600 mr-1`} />
          Low Importance
        </div>
        <div className="flex items-center">
          <span className={`inline-block w-3 h-3 rounded-full bg-blue-600 mr-1`} />
          Medium Importance
        </div>
        <div className="flex items-center">
          <span className={`inline-block w-3 h-3 rounded-full bg-orange-600 mr-1`} />
          High Importance
        </div>
        <div className="flex items-center">
          <span className={`inline-block w-3 h-3 rounded-full bg-red-600 mr-1`} />
          Critical Importance
        </div>
        <div className="flex items-center">
          <span className="inline-block mr-1 text-orange-500">★</span>
          Israeli Connection
        </div>
      </div>
    </div>
  );
};

export default PersonTimeline;