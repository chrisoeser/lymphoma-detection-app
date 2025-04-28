import React, { useState, useEffect, useRef } from 'react';

interface FeatureMap {
  name: string;
  data: number[];
}

interface VisualizationPanelProps {
  featureMaps: FeatureMap[];
  originalImage: string;
  activeFeatureIndex?: number;
}

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({ 
    featureMaps, 
    originalImage,
    activeFeatureIndex = 0
 }) => {
  const [activeMap, setActiveMap] = useState<number>(activeFeatureIndex);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const previousMapRef = useRef<number>(activeFeatureIndex);
  
  // Update active map when activeFeatureIndex prop changes
  useEffect(() => {
    setActiveMap(activeFeatureIndex);
  }, [activeFeatureIndex]);

  // Handle visualization transitions
  const transitionToMap = (newMapIndex: number) => {
    if (isTransitioning || newMapIndex === activeMap) return;
    
    previousMapRef.current = activeMap;
    setActiveMap(newMapIndex);
    setIsTransitioning(true);
    
    // Transition will complete through the useEffect below
  };

  // Draw heatmap using the canvas with improved color mapping
  useEffect(() => {
    if (!canvasRef.current || featureMaps.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Function to draw a single frame of the visualization
    const drawVisualization = (mapIndex: number, opacity: number = 1) => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (showOriginal && originalImage) {
        // Draw original image
        const img = new Image();
        img.onload = () => {
          // Resize canvas to match image aspect ratio
          const aspectRatio = img.width / img.height;
          canvas.width = canvas.height * aspectRatio;
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = originalImage;
        return;
      }
      
      // Get current feature map data
      const currentMap = featureMaps[mapIndex];
      if (!currentMap || !currentMap.data) return;
      
      // The data is a flat array; we need to determine dimensions for the heatmap
      // Assuming it's a square for simplicity
      const size = Math.sqrt(currentMap.data.length);
      const cellSize = canvas.width / size;
      
      // Normalize data to [0, 1] range
      const maxVal = Math.max(...currentMap.data);
      const minVal = Math.min(...currentMap.data);
      const range = maxVal - minVal;
      
      // Create an improved color gradient for better visualization
      const createColor = (value: number) => {
        const normalized = range === 0 ? 0.5 : (value - minVal) / range;
        
        // Use a more perceptually uniform color scale (viridis-inspired)
        let r, g, b;
        
        if (normalized < 0.25) {
          // Purple to blue
          const t = normalized / 0.25;
          r = Math.round(73 * (1 - t) + 43 * t);
          g = Math.round(3 * (1 - t) + 119 * t);
          b = Math.round(119 * (1 - t) + 191 * t);
        } else if (normalized < 0.5) {
          // Blue to teal
          const t = (normalized - 0.25) / 0.25;
          r = Math.round(43 * (1 - t) + 33 * t);
          g = Math.round(119 * (1 - t) + 170 * t);
          b = Math.round(191 * (1 - t) + 155 * t);
        } else if (normalized < 0.75) {
          // Teal to green
          const t = (normalized - 0.5) / 0.25;
          r = Math.round(33 * (1 - t) + 130 * t);
          g = Math.round(170 * (1 - t) + 188 * t);
          b = Math.round(155 * (1 - t) + 97 * t);
        } else {
          // Green to yellow
          const t = (normalized - 0.75) / 0.25;
          r = Math.round(130 * (1 - t) + 253 * t);
          g = Math.round(188 * (1 - t) + 231 * t);
          b = Math.round(97 * (1 - t) + 37 * t);
        }
        
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      };
      
      // Draw each cell as a colored rectangle with anti-aliasing
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // For better performance, create an ImageData object
      const imgData = ctx.createImageData(canvas.width, canvas.height);
      const data = imgData.data;
      
      // Fill the image data with heatmap colors
      for (let i = 0; i < currentMap.data.length; i++) {
        const row = Math.floor(i / size);
        const col = i % size;
        
        const value = currentMap.data[i];
        const normalized = range === 0 ? 0.5 : (value - minVal) / range;
        
        // Calculate color for this pixel
        let r, g, b;
        
        if (normalized < 0.25) {
          // Purple to blue
          const t = normalized / 0.25;
          r = Math.round(73 * (1 - t) + 43 * t);
          g = Math.round(3 * (1 - t) + 119 * t);
          b = Math.round(119 * (1 - t) + 191 * t);
        } else if (normalized < 0.5) {
          // Blue to teal
          const t = (normalized - 0.25) / 0.25;
          r = Math.round(43 * (1 - t) + 33 * t);
          g = Math.round(119 * (1 - t) + 170 * t);
          b = Math.round(191 * (1 - t) + 155 * t);
        } else if (normalized < 0.75) {
          // Teal to green
          const t = (normalized - 0.5) / 0.25;
          r = Math.round(33 * (1 - t) + 130 * t);
          g = Math.round(170 * (1 - t) + 188 * t);
          b = Math.round(155 * (1 - t) + 97 * t);
        } else {
          // Green to yellow
          const t = (normalized - 0.75) / 0.25;
          r = Math.round(130 * (1 - t) + 253 * t);
          g = Math.round(188 * (1 - t) + 231 * t);
          b = Math.round(97 * (1 - t) + 37 * t);
        }
        
        // Scale to the canvas size and fill the corresponding rectangle of pixels
        const startX = Math.floor(col * cellSize);
        const startY = Math.floor(row * cellSize);
        const endX = Math.floor((col + 1) * cellSize);
        const endY = Math.floor((row + 1) * cellSize);
        
        for (let y = startY; y < endY; y++) {
          for (let x = startX; x < endX; x++) {
            if (x < canvas.width && y < canvas.height) {
              const pixelIndex = (y * canvas.width + x) * 4;
              data[pixelIndex] = r;
              data[pixelIndex + 1] = g;
              data[pixelIndex + 2] = b;
              data[pixelIndex + 3] = Math.round(255 * opacity);
            }
          }
        }
      }
      
      // Put the image data on the canvas
      ctx.putImageData(imgData, 0, 0);
      
      // Add overlay of the original image with transparency if we have it
      if (originalImage && !showOriginal) {
        const img = new Image();
        img.onload = () => {
          ctx.globalAlpha = 0.2; // Set transparency
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          ctx.globalAlpha = 1.0; // Reset transparency
        };
        img.src = originalImage;
      }
    };
    
    // Animate transition between maps
    if (isTransitioning) {
      let startTime: number | null = null;
      const duration = 600; // transition duration in ms
      
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Draw the new map with increasing opacity
        drawVisualization(activeMap, progress);
        
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          setIsTransitioning(false);
        }
      };
      
      // Start animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      // Just draw the current map
      drawVisualization(activeMap);
    }
    
    // Clean up animation on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [featureMaps, activeMap, showOriginal, originalImage, isTransitioning]);
  
  // If no feature maps, show a message
  if (featureMaps.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center animate-fade-in">
        <p className="text-gray-500">No feature maps available for visualization.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Feature Visualizations</h2>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left side - Feature map selector */}
        <div className="md:w-1/3">
          <p className="text-sm text-gray-600 mb-2">
            These visualizations show how the model "sees" the image at different layers
            during the classification process.
          </p>
          
          <div className="mt-4">
            <h3 className="font-medium text-gray-700 mb-2">Available Visualizations:</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto feature-map-list pr-2">
              {featureMaps.map((map, index) => (
                <button
                  key={index}
                  onClick={() => {
                    transitionToMap(index);
                    setShowOriginal(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                    ${activeMap === index && !showOriginal
                      ? 'bg-primary-100 text-primary-800 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {map.name}
                </button>
              ))}
              
              <button
                onClick={() => {
                  setShowOriginal(true);
                  setIsTransitioning(true);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                  ${showOriginal
                    ? 'bg-primary-100 text-primary-800 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                Original Image
              </button>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium text-gray-700 mb-2">What Am I Looking At?</h3>
            <p className="text-sm text-gray-600">
              {showOriginal 
                ? 'This is the original image that was submitted for analysis.'
                : `This visualization highlights areas of the image that were important for the model's classification decision. The color gradient represents the intensity of features detected by the model.`}
            </p>
          </div>
        </div>
        
        {/* Right side - Visualization canvas */}
        <div className="md:w-2/3 flex flex-col items-center justify-center">
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 w-full h-64 md:h-80 shadow-inner">
            <canvas 
              ref={canvasRef} 
              className={`w-full h-full ${isTransitioning ? 'transition-all duration-600' : ''}`}
              width={256}
              height={256}
            />
          </div>
          
          <div className="mt-3 text-sm text-gray-500 text-center">
            {showOriginal 
              ? 'Original uploaded image'
              : `${featureMaps[activeMap]?.name} visualization`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizationPanel;