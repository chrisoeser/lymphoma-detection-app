import React from 'react';

interface LoadingIndicatorProps {
  progress?: number;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ progress }) => {
  // If progress is provided, show a progress bar, otherwise show a spinner
  return progress !== undefined ? (
    <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
      <div 
        className="bg-primary-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
        style={{ width: `${progress}%` }}
      ></div>
      
      {/* Pulsing dots to indicate activity */}
      <div className="flex justify-center mt-4">
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div 
              key={i}
              className={`w-2 h-2 bg-primary-600 rounded-full animate-pulse`}
              style={{ 
                animationDelay: `${i * 0.2}s` 
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  ) : (
    <div className="flex justify-center items-center">
      <div className="spinner">
        <div className="relative">
          <div className="w-12 h-12 rounded-full absolute border-4 border-solid border-gray-200"></div>
          <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-solid border-primary-600 border-t-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;