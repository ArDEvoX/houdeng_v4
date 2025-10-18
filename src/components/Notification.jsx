import React, { useEffect } from 'react';

const Notification = ({ message, type = 'success', visible, onClose }) => {
  useEffect(() => {
    if (visible) {
      // Auto-fermeture après 5 secondes
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-100',
          border: 'border-green-500',
          text: 'text-green-800',
          icon: '✓'
        };
      case 'error':
        return {
          bg: 'bg-red-100',
          border: 'border-red-500',
          text: 'text-red-800',
          icon: '⚠️'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-100',
          border: 'border-yellow-500',
          text: 'text-yellow-800',
          icon: '⚠️'
        };
      case 'info':
        return {
          bg: 'bg-blue-100',
          border: 'border-blue-500',
          text: 'text-blue-800',
          icon: 'ℹ️'
        };
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-500',
          text: 'text-gray-800',
          icon: 'ℹ️'
        };
    }
  };

  const styles = getStyles();

  return (
    <div 
      className="fixed top-4 right-4 z-50 animate-slide-in"
      style={{ maxWidth: '500px' }}
    >
      <div 
        className={`${styles.bg} ${styles.text} border-l-4 ${styles.border} p-4 rounded shadow-lg flex items-start`}
        role="alert"
      >
        <span className="text-2xl mr-3">{styles.icon}</span>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`ml-4 ${styles.text} hover:opacity-70 font-bold text-xl`}
          aria-label="Fermer"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification;
