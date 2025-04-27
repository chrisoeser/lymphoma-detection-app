import React, { useState } from 'react';

const Header: React.FC = () => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <header className="bg-primary-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-4xl">
        <div className="flex items-center">
          <svg 
            className="w-8 h-8 mr-3" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" 
            />
          </svg>
          <div>
            <h1 className="text-xl font-bold">Lymphoma Detector</h1>
            <p className="text-xs text-white text-opacity-80">Self-Supervised Learning Model</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsInfoOpen(!isInfoOpen)}
          className="bg-primary-600 hover:bg-primary-800 text-white px-3 py-1 rounded-full text-sm flex items-center transition-colors"
        >
          <span>About</span>
          <svg 
            className="w-4 h-4 ml-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </button>
      </div>
      
      {isInfoOpen && (
        <div className="container mx-auto px-4 py-4 bg-primary-800 text-white text-sm max-w-4xl">
          <h2 className="font-semibold mb-2">About This Project</h2>
          <p className="mb-2">
            This application uses an enhanced self-supervised learning model for lymphoma classification.
            The model was trained on three types of lymphoma: Chronic Lymphocytic Leukemia (CLL), 
            Follicular Lymphoma (FL), and Mantle Cell Lymphoma (MCL).
          </p>
          <p className="mb-2">
            The model employs multi-task self-supervised learning with both masked image reconstruction
            and image rotation prediction as pretext tasks, allowing it to learn robust features
            even with limited labeled data.
          </p>
          <p>
            <strong>Note:</strong> This is a research prototype and should not be used for actual
            medical diagnosis. Always consult with a healthcare professional.
          </p>
        </div>
      )}
    </header>
  );
};

export default Header;