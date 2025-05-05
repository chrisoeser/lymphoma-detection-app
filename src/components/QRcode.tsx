// src/components/QRCodeBackground.tsx
import React, { useEffect, useState } from 'react';

const QRCodeBackground: React.FC = () => {
  const [isWideScreen, setIsWideScreen] = useState(false);

  // Check screen width on mount and when window is resized
  useEffect(() => {
    const checkWidth = () => {
      setIsWideScreen(window.innerWidth > 639);
    };
    
    // Initial check
    checkWidth();
    
    // Add event listener for resize
    window.addEventListener('resize', checkWidth);
    
    // Clean up event listener
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Only render QR code if screen is wide enough
  if (!isWideScreen) {
    return null;
  }

  return (
    <div className="qr-code-background">
    <img 
      src={`${process.env.PUBLIC_URL}/qr-code.svg`}
        width="160"
        height="160"
        className="mx-auto mt-6 opacity-80 pointer-events gelatine"
      />
      <div className="text-xs text-gray-400 mt-2 text-center hidden sm:block">
        Scan QR Code
      </div>
    </div>
    
  );
};

export default QRCodeBackground;