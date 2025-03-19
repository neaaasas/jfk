// src/components/BubbleMap/PersonBubble.jsx
// This will be used later for more complex bubble visualizations

const PersonBubble = ({ person, onClick }) => {
    const { name, group, importance = 5 } = person;
    
    // Size based on importance
    const size = 20 + (importance * 3);
    
    // We'll implement this more fully when integrating with BubbleMap
    return (
      <div 
        className="person-bubble"
        style={{
          width: size,
          height: size,
          borderRadius: '50%'
        }}
        onClick={() => onClick(person)}
      >
        {name}
      </div>
    );
  };
  
  export default PersonBubble;