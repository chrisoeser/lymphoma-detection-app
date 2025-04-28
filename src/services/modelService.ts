// src/services/modelService.ts
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
 * Simplified prediction function that just returns the result.
 */
export async function predictImage(
    imageEl: HTMLImageElement|HTMLCanvasElement
  ) {
    if (!model) throw new Error('Model not loaded');
  
    // Preprocess the image
    const tensor = preprocessImage(imageEl);
    
    try {
      // Run the prediction
      const preds = model.predict(tensor) as tf.Tensor;
      const probs = await preds.data();
      const classIndex = tf.argMax(preds, 1).dataSync()[0];
      const predictedClass = CLASS_NAMES[classIndex];
      
      // Create some simple example feature maps for visualization
      const featureMaps = [
        {
          name: 'Grayscale Analysis',
          data: Array.from(await tensor.mean([3]).reshape([256*256]).data())
        }
      ];
      
      // Clean up tensors
      preds.dispose();
      
      return {
        class: predictedClass,
        probability: probs[classIndex],
        featureMaps: featureMaps
      };
    } catch (error) {
      console.error('Prediction error:', error);
      throw new Error('Failed to analyze the lymphoma image');
    } finally {
      // Ensure tensor is always disposed
      tensor.dispose();
    }
  }