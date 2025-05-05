// src/components/Examples.tsx
import React, { useState } from 'react';

interface ExamplesProps {
  onSelectExample: (file: File) => void;
}

const SimpleExamples: React.FC<ExamplesProps> = ({ onSelectExample }) => {
  const [loading, setLoading] = useState<string | null>(null);

  // Sample examples - one for each lymphoma type
  const examples = [
    {
      id: 'cll',
      name: 'CLL Example',
      description: 'Chronic Lymphocytic Leukemia',
      imagePath: `${process.env.PUBLIC_URL}/examples/lymph_cll_0044.jpg`
    },
    {
      id: 'fl',
      name: 'FL Example',
      description: 'Follicular Lymphoma',
      imagePath: `${process.env.PUBLIC_URL}/examples/lymph_fl_0024.jpg`
    },
    {
      id: 'mcl',
      name: 'MCL Example',
      description: 'Mantle Cell Lymphoma',
      imagePath: `${process.env.PUBLIC_URL}/examples/lymph_mcl_0048.jpg`
    }
  ];

  const handleExampleClick = async (example: typeof examples[0]) => {
    try {
      setLoading(example.id);
      
      // Instead of fetching the file, load it as an image first to ensure it works
      const img = new Image();
      
      // Create a promise to handle image loading
      const imageLoaded = new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${example.imagePath}`));
        // Set crossOrigin to anonymous to avoid CORS issues
        img.crossOrigin = "anonymous";
        img.src = example.imagePath;
      });
      
      // Wait for the image to load
      await imageLoaded;
      
      // Create a canvas to convert the image to a blob
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Create a File object from the blob
            const file = new File([blob], `${example.id}_example.jpg`, { type: 'image/jpeg' });
            
            // Pass the file to the parent component
            onSelectExample(file);
          } else {
            throw new Error('Failed to convert image to blob');
          }
          setLoading(null);
        }, 'image/jpeg');
      }
    } catch (error) {
      console.error('Error loading example:', error);
      setLoading(null);
      alert(`Failed to load example image: ${example.name}. Please check that the file exists.`);
    }
  };

  return (
    <div className="mt-6">
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Or try one of these examples:</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {examples.map((example) => (
            <button
              key={example.id}
              className="bg-white border rounded-md overflow-hidden hover:shadow-md transition-shadow p-2 text-left"
              onClick={() => handleExampleClick(example)}
              disabled={loading !== null}
            >
              <div className="h-24 bg-gray-100 rounded flex items-center justify-center mb-2 relative">
                {/* Try to load the image, but have a fallback */}
                <img 
                  src={example.imagePath} 
                  alt={example.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // If image fails to load, show colored div instead
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.classList.add(
                      example.id === 'cll' ? 'bg-blue-100' : 
                      example.id === 'fl' ? 'bg-green-100' : 
                      'bg-purple-100'
                    );
                  }}
                />
                
                {loading === example.id && (
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{example.name}</p>
                <p className="text-xs text-gray-500">{example.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleExamples;