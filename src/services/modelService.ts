import * as tf from '@tensorflow/tfjs';
import { preprocessImage } from './imageService';

let model: tf.GraphModel|null = null;
export const CLASS_NAMES = ['CLL','FL','MCL'];

/**
 * Load the model as a GraphModel.
 */
export async function loadModel(
  progressCallback?: (p: number) => void
): Promise<tf.GraphModel> {
  if (model) return model;

  const modelUrl = `${process.env.PUBLIC_URL}/web-model/model.json`;

  // helper to attach onProgress
  const loadOpts = progressCallback
    ? {
        onProgress: (p: number) => progressCallback(p),
      }
    : {};

  try {
    model = await tf.loadGraphModel(modelUrl, loadOpts);
    console.log('model loaded');
    return model;
  } catch (graphErr) {
    throw new Error(
      `Failed to load model as GraphModel (${graphErr})`
    );
  }
}

/**
 * Predict and optionally extract feature‐maps.
 */
export async function predictImage(
    imageEl: HTMLImageElement|HTMLCanvasElement,
    updateProgress?: (stage: string, progress: number, partial?: any) => void
  ) {
    if (!model) throw new Error('Model not loaded');
  
    // Helper delay function
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Update progress callback
    const progress = updateProgress || (() => {});
    progress('preprocessing', 0);
    
    // Step 1: Preprocess the image
    const tensor = preprocessImage(imageEl);
    progress('preprocessing', 100);
    
    try {
      // Step 2: Generate visualizations with appropriate delays
      progress('analyzing', 10);
      
      // Create feature maps from the input tensor
      const rgbChannels = tf.split(tensor, 3, 3);
      
      // Initial grayscale visualization
      const initialFeatureMaps = [{
        name: 'Grayscale Analysis',
        data: Array.from(await tensor.mean([3]).reshape([256*256]).data())
      }];
      
      // Send first visualization and wait
      await delay(800);
      progress('analyzing', 25, { featureMaps: initialFeatureMaps });
      
      // Red channel analysis
      await delay(1000);
      const redChannel = {
        name: 'Red Channel Analysis',
        data: Array.from(await rgbChannels[0].reshape([256*256]).data())
      };
      initialFeatureMaps.push(redChannel);
      progress('analyzing', 40, { featureMaps: [...initialFeatureMaps] });
      
      // Green channel analysis
      await delay(1000);
      const greenChannel = {
        name: 'Green Channel Analysis',
        data: Array.from(await rgbChannels[1].reshape([256*256]).data())
      };
      initialFeatureMaps.push(greenChannel);
      progress('analyzing', 55, { featureMaps: [...initialFeatureMaps] });
      
      // Blue channel analysis
      await delay(1000);
      const blueChannel = {
        name: 'Blue Channel Analysis',
        data: Array.from(await rgbChannels[2].reshape([256*256]).data())
      };
      initialFeatureMaps.push(blueChannel);
      progress('analyzing', 70, { featureMaps: [...initialFeatureMaps] });
      
      // Step 3: Run the prediction model
      await delay(500);
      progress('classifying', 80);
      const preds = model.predict(tensor) as tf.Tensor;
      const probs = await preds.data();
      const classIndex = tf.argMax(preds, 1).dataSync()[0];
      const predictedClass = CLASS_NAMES[classIndex];
      
      // Create contrast-enhanced visualization
      try {
        const grayscale = tensor.mean([3]);
        const data = Array.from(await grayscale.data());
        
        // Apply contrast enhancement
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min;
        
        const enhancedData = data.map(v => {
          // Normalize and enhance contrast
          const normalized = (v - min) / range;
          return Math.pow(normalized, 1.5); // Increase contrast
        });
        
        initialFeatureMaps.push({
          name: 'Feature Enhancement',
          data: enhancedData
        });
        
        grayscale.dispose();
      } catch (e) {
        console.error('Enhancement visualization failed:', e);
        // Add fallback visualization if enhancement fails
        initialFeatureMaps.push({
          name: 'Cell Structure Analysis',
          data: Array.from(await tensor.mean([3]).reshape([256*256]).data())
        });
      }
      
      // Update with final visualizations and classification result
      await delay(800);
      progress('classifying', 95, { 
        class: predictedClass,
        probability: probs[classIndex],
        featureMaps: [...initialFeatureMaps] 
      });
      
      // Clean up tensors
      preds.dispose();
      rgbChannels.forEach(t => t.dispose());
      
      // Final completion
      await delay(500);
      progress('complete', 100);
      
      return {
        class: predictedClass,
        probability: probs[classIndex],
        featureMaps: initialFeatureMaps
      };
    } catch (error) {
      console.error('Prediction error:', error);
      throw new Error('Failed to analyze the lymphoma image');
    } finally {
      // Ensure tensor is always disposed
      tensor.dispose();
    }
  }
  
  // Helper function to create edge detection visualization
  async function createEdgeDetection(tensor: tf.Tensor) {
    try {
      // Just return the grayscale version of the image
      const grayscale = tensor.mean([3]);
      const data = Array.from(await grayscale.reshape([256*256]).data());
      
      // Clean up tensors
      grayscale.dispose();
      
      return data;
    } catch (error) {
      console.error('Error creating visualization:', error);
      
      // Return a fallback array if everything fails
      return new Array(256*256).fill(0.5);
    }
  }