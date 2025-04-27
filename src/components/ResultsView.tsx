import React from 'react';

type PredictionResult = {
  class: string;
  probability: number;
  featureMaps?: any[];
};

interface ResultsViewProps {
  result: PredictionResult;
}

const ResultsView: React.FC<ResultsViewProps> = ({ result }) => {
  // Format the confidence percentage
  const confidencePercent = (result.probability * 100).toFixed(2);
  
  // Define class info
  const classInfo = {
    'CLL': {
      name: 'Chronic Lymphocytic Leukemia',
      description: 'A type of cancer that starts from white blood cells (lymphocytes) in the bone marrow. CLL affects a particular lymphocyte, the B cell, which normally fights infections.',
      color: 'blue'
    },
    'FL': {
      name: 'Follicular Lymphoma',
      description: 'A type of non-Hodgkin lymphoma that begins in the lymphatic system. FL is characterized by the appearance of malignant germinal center B cells that typically grow in a follicular pattern.',
      color: 'green'
    },
    'MCL': {
      name: 'Mantle Cell Lymphoma',
      description: 'A rare type of B-cell non-Hodgkin lymphoma that arises from cells originating in the "mantle zone" of the lymph node, and typically affects men over the age of 60.',
      color: 'purple'
    }
  };
  
  // Get information about the detected class
  const classData = result.class in classInfo 
    ? classInfo[result.class as keyof typeof classInfo] 
    : { name: result.class, description: 'No additional information available', color: 'gray' };
  
  // Determine confidence level color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-blue-600';
    if (confidence >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const confidenceColor = getConfidenceColor(result.probability);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-fade-in">
      <h2 className="text-xl font-semibold mb-3">Analysis Results</h2>
      
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
        <div className="mb-2">
          <span className="text-gray-600 text-sm">Detected Lymphoma Type:</span>
          <h3 className="text-2xl font-bold text-primary-700">{classData.name}</h3>
        </div>
        
        <div className="mb-3">
          <span className="text-gray-600 text-sm">Confidence:</span>
          <div className="flex items-center mt-1">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary-600 h-2.5 rounded-full" 
                style={{ width: `${confidencePercent}%` }}
              ></div>
            </div>
            <span className={`ml-2 font-semibold ${confidenceColor}`}>
              {confidencePercent}%
            </span>
          </div>
        </div>
        
        <div>
          <span className="text-gray-600 text-sm">Description:</span>
          <p className="text-gray-800 mt-1">{classData.description}</p>
        </div>
      </div>
      
      <div className="text-sm text-gray-500 italic mt-4">
        <div className="flex items-start">
          <svg 
            className="w-4 h-4 mr-1 mt-0.5 text-yellow-500" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          <p>
            For research purposes only and not intended for clinical use.
            Always consult with a qualified healthcare professional.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;