// src/components/common/Card.jsx
const Card = ({ children, className = "", onClick }) => {
  return (
    <div 
      className={`bg-[#1a1a1a] bg-opacity-95 border border-gray-800 rounded-lg p-6 shadow-lg transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-gray-700 hover:bg-[#1c1c1c]' : ''
      } ${className}`}
      onClick={onClick}
      style={{
        backdropFilter: 'blur(2px)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
    >
      {children}
    </div>
  );
};

export default Card;