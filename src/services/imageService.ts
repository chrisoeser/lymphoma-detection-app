import * as tf from '@tensorflow/tfjs';

/**
 * Preprocesses an image for model input
 * Resizes to 256x256, normalizes to [0,1], and adds batch dimension
 * 
 * @param imageElement HTML Image Element or Canvas to process
 * @returns Tensor ready for model input
 */
export const preprocessImage = (
  imageElement: HTMLImageElement | HTMLCanvasElement
): tf.Tensor => {
  return tf.tidy(() => {
    // Read the image into a tensor
    let imageTensor = tf.browser.fromPixels(imageElement);
    
    // Resize to the model's expected input dimensions
    const resized = tf.image.resizeBilinear(imageTensor, [256, 256]);
    
    // Normalize pixel values to [0, 1]
    const normalized = resized.div(tf.scalar(255));
    
    // Add batch dimension
    const batched = normalized.expandDims(0);
    
    return batched;
  });
};

/**
 * Applies preprocessing to an image file and returns a canvas element
 * This is useful for preview and analysis
 * 
 * @param file Image file to process
 * @returns Promise resolving to a canvas element
 */
export const createCanvasFromFile = (file: File): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }
    
    const img = new Image();
    
    img.onload = () => {
      // Draw the image on the canvas, resizing to 256x256
      ctx.drawImage(img, 0, 0, 256, 256);
      resolve(canvas);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    // Load image from file
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Creates a visual heatmap from a feature map
 * 
 * @param featureMap 1D array representing a 2D feature map
 * @param width Width of the resulting image
 * @param height Height of the resulting image
 * @returns Canvas element with the heatmap
 */
export const createHeatmapFromFeatures = (
  featureMap: number[],
  width: number = 256,
  height: number = 256
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  // Determine the dimensions of the feature map
  // Assuming it's a square for simplicity
  const size = Math.sqrt(featureMap.length);
  const cellWidth = width / size;
  const cellHeight = height / size;
  
  // Find min and max values for normalization
  const minVal = Math.min(...featureMap);
  const maxVal = Math.max(...featureMap);
  const range = maxVal - minVal;
  
  // Draw heatmap
  featureMap.forEach((value, index) => {
    const row = Math.floor(index / size);
    const col = index % size;
    
    // Normalize value
    const normalizedValue = range === 0 
      ? 0.5 
      : (value - minVal) / range;
    
    // Use a viridis-like color scale (blue to green to yellow)
    let r, g, b;
    
    if (normalizedValue < 0.5) {
      // Blue to green (0 to 0.5)
      const t = normalizedValue * 2;
      r = Math.round(0 * (1 - t) + 0 * t);
      g = Math.round(0 * (1 - t) + 255 * t);
      b = Math.round(255 * (1 - t) + 0 * t);
    } else {
      // Green to yellow (0.5 to 1)
      const t = (normalizedValue - 0.5) * 2;
      r = Math.round(0 * (1 - t) + 255 * t);
      g = Math.round(255 * (1 - t) + 255 * t);
      b = Math.round(0 * (1 - t) + 0 * t);
    }
    
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
  });
  
  return canvas;
};

/**
 * Overlays a heatmap on an original image with transparency
 * 
 * @param originalImage Original image (as HTMLImageElement or canvas)
 * @param heatmapCanvas Heatmap canvas to overlay
 * @param opacity Opacity of the heatmap (0-1)
 * @returns Canvas with the overlaid result
 */
export const overlayHeatmap = (
  originalImage: HTMLImageElement | HTMLCanvasElement,
  heatmapCanvas: HTMLCanvasElement,
  opacity: number = 0.7
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  // Draw original image
  ctx.drawImage(originalImage, 0, 0, 256, 256);
  
  // Overlay heatmap with transparency
  ctx.globalAlpha = opacity;
  ctx.drawImage(heatmapCanvas, 0, 0, 256, 256);
  ctx.globalAlpha = 1.0;
  
  return canvas;
};