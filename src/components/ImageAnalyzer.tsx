// src/components/ImageAnalyzer.tsx
import React, { useState, useEffect, useRef } from 'react';
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
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictionStage, setPredictionStage] = useState<string>('');
  const [predictionProgress, setPredictionProgress] = useState<number>(0);
  const [currentVisualization, setCurrentVisualization] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Helper function to draw a visualization to the canvas
  const drawVisualization = (featureMap: number[], width: number = 256, height: number = 256) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Create an ImageData object to display the feature map
    const imgData = ctx.createImageData(width, height);
    
    // Map the feature map values to RGB values
    for (let i = 0; i < featureMap.length; i++) {
      const val = Math.floor(featureMap[i] * 255);
      imgData.data[i * 4] = val;      // R
      imgData.data[i * 4 + 1] = val;  // G
      imgData.data[i * 4 + 2] = val;  // B
      imgData.data[i * 4 + 3] = 255;  // Alpha (fully opaque)
    }
    
    ctx.putImageData(imgData, 0, 0);
  };
  
  // Start analysis when component mounts
  useEffect(() => {
    if (imageFile && canvasRef.current) {
      handlePredict();
    }
  }, [imageFile]);
  
  const handlePredict = async () => {
    if (!imageFile || !canvasRef.current) {
      return;
    }
  
    try {
      setIsPredicting(true);
      setError(null);
      setPredictionStage('preparing');
      setPredictionProgress(0);
      
      // Create canvas from file
      const sourceCanvas = await createCanvasFromFile(imageFile);
      
      // Draw the original image on our canvas first
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(sourceCanvas, 0, 0, canvas.width, canvas.height);
      }
      
      // Add console.log to debug visualization process
      const updateProgress = async (stage: string, progress: number, partial?: any) => {
        console.log(`Stage: ${stage}, Progress: ${progress}`, partial ? `Visualization: ${partial.featureMaps ? partial.featureMaps.length : 'none'}` : 'No partial data');
        
        setPredictionStage(stage);
        setPredictionProgress(progress);
        
        // Update visualization if we have feature maps
        if (partial && partial.featureMaps && partial.featureMaps.length > 0) {
          const latestMap = partial.featureMaps[partial.featureMaps.length - 1];
          console.log(`Drawing visualization: ${latestMap.name}`);
          setCurrentVisualization(latestMap.name);
          
          // Make sure we have a valid canvas context
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              // Draw the visualization with a fade transition
              drawVisualization(latestMap.data);
            }
          }
        }
      };
      
      // Run prediction with progress updates
      console.log('Starting prediction process...');
      const result = await predictImage(sourceCanvas, updateProgress);
      console.log('Prediction complete:', result);
      
      // After prediction completes, show the original image again
      if (ctx && imagePreview) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setTimeout(() => {
            setIsPredicting(false);
            onAnalysisComplete(result);
          }, 1000);
        };
        img.onerror = (err) => {
          console.error('Error loading image:', err);
          setIsPredicting(false);
          onAnalysisComplete(result);
        };
        img.src = imagePreview;
      } else {
        setIsPredicting(false);
        onAnalysisComplete(result);
      }
    } catch (err) {
      console.error('Prediction error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Prediction failed';
      setError(errorMessage);
      setIsPredicting(false);
    }
  };

  if (!imageFile || !imagePreview) {
    return null;
  }

  return (
    <div className="mt-6">
      {error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          {/* Canvas for visualization transitions */}
          <div className="relative w-full max-w-md rounded-lg overflow-hidden mb-4">
            <canvas 
              ref={canvasRef} 
              width={256} 
              height={256} 
              className="w-full h-full object-contain bg-gray-100"
            />
            
            {isPredicting && currentVisualization && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-center text-sm">
                {currentVisualization}
              </div>
            )}
          </div>
          
          {isPredicting && (
            <div className="mb-6 relative w-full">
              <LoadingIndicator progress={predictionProgress} />
              <p className="mt-2 text-center text-gray-600 font-medium">
                {predictionStage === 'preprocessing' && 'Preprocessing lymphoma image...'}
                {predictionStage === 'analyzing' && 'Analyzing cellular features...'}
                {predictionStage === 'classifying' && 'Classifying lymphoma type...'}
                {predictionStage === 'complete' && 'Analysis complete!'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageAnalyzer;