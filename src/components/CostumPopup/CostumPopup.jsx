import React, { useEffect } from 'react';

const CustomPopup = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <p>{message}</p>
      </div>
    </div>
  );
};

export default CustomPopup;
