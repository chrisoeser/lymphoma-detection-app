import React, { useState } from 'react';


const Header: React.FC = () => {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <header className="bg-primary-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-4xl">
        <div className="flex items-center">
        <img 
            src={`${process.env.PUBLIC_URL}/green-microscope.png`} 
            alt="Microscope" 
            className="w-16 h-16"
            />
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