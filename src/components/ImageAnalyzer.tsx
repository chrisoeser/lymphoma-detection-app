// src/components/ImageAnalyzer.tsx
import React, { useState, useEffect } from 'react';
import { predictImage } from '../services/modelService';
import { createCanvasFromFile } from '../services/imageService';
import LoadingIndicator from './LoadingIndicator';

interface ImageAnalyzerProps {
  imageFile: File | null;
  imagePreview: string | null;
  onAnalysisComplete: (result: any) => void;
}

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ 
  imageFile, 
  imagePreview, 
  onAnalysisComplete 
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Simple prebuilt visualizations for display purposes only
  const visualizationSteps = [
    { name: 'Grayscale Analysis', duration: 2000 },
    { name: 'Cell Structure Detection', duration: 1500 },
    { name: 'Feature Extraction', duration: 1500 },
    { name: 'Classification Analysis', duration: 1000 }
  ];
  
  // Start analysis when component mounts
  useEffect(() => {
    if (imageFile) {
      runAnalysis();
    }
  }, [imageFile]);

  // Progress animation
  useEffect(() => {
    if (!isAnalyzing) return;
    
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 50);
    
    return () => clearInterval(timer);
  }, [isAnalyzing]);
  
  // Visual steps animation
  useEffect(() => {
    if (!isAnalyzing) return;
    
    let currentStepIndex = 0;
    setAnalysisStep(visualizationSteps[0].name);
    
    const runVisualSteps = async () => {
      for (let i = 0; i < visualizationSteps.length; i++) {
        setAnalysisStep(visualizationSteps[i].name);
        await new Promise(resolve => setTimeout(resolve, visualizationSteps[i].duration));
      }
    };
    
    runVisualSteps();
  }, [isAnalyzing]);
  
  const runAnalysis = async () => {
    if (!imageFile) return;
    
    try {
      setIsAnalyzing(true);
      setError(null);
      setProgress(0);
      
      // Create canvas from file (this is still needed for the actual prediction)
      const sourceCanvas = await createCanvasFromFile(imageFile);
      
      // Run the actual prediction in the background
      const result = await predictImage(sourceCanvas);
      
      // Make sure the visual animations have enough time to complete
      // Minimum 5 seconds of visual feedback for user experience
      setTimeout(() => {
        setIsAnalyzing(false);
        onAnalysisComplete(result);
      }, 5000);
      
    } catch (err) {
      console.error('Analysis error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      setIsAnalyzing(false);
    }
  };

  if (!imageFile || !imagePreview) {
    return null;
  }

  return (
    <div className="mt-6">
      {error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          {isAnalyzing && (
            <div className="w-full mb-6 flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="font-medium text-gray-800">{analysisStep}</p>
                  <p className="text-sm text-gray-600 mt-1">Please wait while we analyze the image...</p>
                </div>
                
                <div className="flex justify-center mt-4 space-x-2">
                  {[0, 1, 2].map((i) => (
                    <div 
                      key={i}
                      className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageAnalyzer;