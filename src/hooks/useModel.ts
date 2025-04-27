import { useState, useEffect, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import { loadModel, predictImage } from '../services/modelService';
import { createCanvasFromFile } from '../services/imageService';

interface ModelHookResult {
  isModelLoading: boolean;
  modelLoadingProgress: number;
  isPredicting: boolean;
  error: string | null;
  predict: (imageFile: File) => Promise<any>;
  resetError: () => void;
}

/**
 * Custom hook for managing TensorFlow.js model interactions
 * Handles loading the model and making predictions
 */
export const useModel = (): ModelHookResult => {
  const [isModelLoading, setIsModelLoading] = useState<boolean>(true);
  const [modelLoadingProgress, setModelLoadingProgress] = useState<number>(0);
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModelReady, setIsModelReady] = useState<boolean>(false);

  // Load the model on component mount
  useEffect(() => {
    const initModel = async () => {
      try {
        setIsModelLoading(true);
        setError(null);
        
        // Track progress during model loading
        const onProgress = (progress: number) => {
          setModelLoadingProgress(progress * 100);
        };
        
        await loadModel(onProgress);
        setIsModelReady(true);
        setIsModelLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load the model';
        setError(errorMessage);
        setIsModelLoading(false);
        console.error('Model loading error:', err);
      }
    };

    initModel();

    // Memory cleanup on unmount
    return () => {
      // Dispose of any tensors if needed
      tf.disposeVariables();
    };
  }, []);

  // Function to make predictions with the model
  const predict = useCallback(async (imageFile: File) => {
    if (!isModelReady) {
      setError('Model is not ready yet. Please wait for it to load.');
      return null;
    }

    try {
      setIsPredicting(true);
      setError(null);

      // Convert the file to a canvas element
      const canvas = await createCanvasFromFile(imageFile);
      
      // Make the prediction
      const result = await predictImage(canvas);
      
      setIsPredicting(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Prediction failed';
      setError(errorMessage);
      setIsPredicting(false);
      console.error('Prediction error:', err);
      return null;
    }
  }, [isModelReady]);

  // Function to reset error state
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isModelLoading,
    modelLoadingProgress,
    isPredicting,
    error,
    predict,
    resetError
  };
}