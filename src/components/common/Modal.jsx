// src/components/common/Modal.jsx
import { useEffect, useState } from 'react';

const Modal = ({ isOpen, onClose, title, children, position = 'center' }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Handle animation timing
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;
  
  // Different positioning styles
  const positionStyles = {
    center: 'items-center justify-center',
    right: 'items-center justify-end pr-8',
    left: 'items-center justify-start pl-8',
    top: 'items-start justify-center pt-20',
  };
  
  const positionClasses = positionStyles[position] || positionStyles.center;
  
  const animationClass = isOpen ? 'opacity-100' : 'opacity-0';
  const contentAnimationClass = isOpen ? 'scale-100' : 'scale-95';
  
  return (
    <div 
      className={`fixed inset-0 z-50 bg-black bg-opacity-70 flex ${positionClasses} backdrop-blur-sm transition-opacity duration-300 modal-backdrop ${animationClass}`}
      onClick={onClose}
      style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
    >
      <div 
        className={`bg-gray-900 bg-opacity-95 rounded-lg p-5 shadow-2xl w-full max-w-2xl mx-4 border border-gray-700 transform transition-all duration-300 ease-out modal-content ${contentAnimationClass}`}
        style={{ 
          maxHeight: '85vh', 
          overflowY: 'auto',
          transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
          backdropFilter: 'blur(4px)',
          backgroundColor: '#1a1a1a',
          backgroundImage: 'radial-gradient(circle at center, #252525 0%, #1a1a1a 100%)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 sticky top-0 py-2 border-b border-gray-800 z-10" 
             style={{ background: 'linear-gradient(to bottom, #1a1a1a, #1a1a1a 90%, transparent)' }}>
          <h3 className="text-xl font-medium text-white">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full h-8 w-8 flex items-center justify-center transition-colors duration-200"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;