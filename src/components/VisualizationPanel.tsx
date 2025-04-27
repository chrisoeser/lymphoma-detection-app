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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  

  // Update active map when activeFeatureIndex prop changes
  useEffect(() => {
    setActiveMap(activeFeatureIndex);
  }, [activeFeatureIndex]);

  
  // Draw heatmap using the canvas
  useEffect(() => {
    if (!canvasRef.current || featureMaps.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
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
    const currentMap = featureMaps[activeMap];
    if (!currentMap || !currentMap.data) return;
    
    // The data is a flat array; we need to determine dimensions for the heatmap
    // Assuming it's a square for simplicity
    const size = Math.sqrt(currentMap.data.length);
    const cellSize = canvas.width / size;
    
    // Normalize data to [0, 1] range
    const maxVal = Math.max(...currentMap.data);
    const minVal = Math.min(...currentMap.data);
    const range = maxVal - minVal;
    
    // Draw each cell as a colored rectangle
    currentMap.data.forEach((value, index) => {
      const row = Math.floor(index / size);
      const col = index % size;
      
      // Normalize value and convert to color
      const normalizedValue = range === 0 ? 0.5 : (value - minVal) / range;
      
      // Use a color scale from blue (cold) to red (hot)
      const r = Math.round(normalizedValue * 255);
      const g = Math.round((1 - Math.abs(normalizedValue - 0.5) * 2) * 255);
      const b = Math.round((1 - normalizedValue) * 255);
      
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
    });
    
    // Add overlay of the original image with transparency if we have it
    if (originalImage) {
      const img = new Image();
      img.onload = () => {
        ctx.globalAlpha = 0.3; // Set transparency
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0; // Reset transparency
      };
      img.src = originalImage;
    }
  }, [featureMaps, activeMap, showOriginal, originalImage]);
  
  // If no feature maps, show a message
  if (featureMaps.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">No feature maps available for visualization.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {featureMaps.map((map, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveMap(index);
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
                onClick={() => setShowOriginal(true)}
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
                : 'This visualization highlights areas of the image that were important for the model\'s classification decision. Brighter areas had more influence on the prediction.'}
            </p>
          </div>
        </div>
        
        {/* Right side - Visualization canvas */}
        <div className="md:w-2/3 flex flex-col items-center justify-center">
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 w-full h-64 md:h-80">
            <canvas 
              ref={canvasRef} 
              className="w-full h-full"
              width={256}
              height={256}
            />
          </div>
          
          <div className="mt-3 text-sm text-gray-500 text-center">
            {showOriginal 
              ? 'Original uploaded image'
              : `${featureMaps[activeMap]?.name} - ${featureMaps[activeMap]?.data.length} features`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizationPanel;