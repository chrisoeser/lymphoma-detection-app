import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  onPredict: () => void;
  onReset: () => void;
  imagePreview: string | null;
  isPredicting: boolean;
  hasResult: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUpload, 
  onPredict, 
  onReset,
  imagePreview, 
  isPredicting,
  hasResult
}) => {
  const [dragActive, setDragActive] = useState(false);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Check if it's an image file
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file (JPEG, PNG, etc.)');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Please upload an image smaller than 5MB');
        return;
      }
      
      onImageUpload(file);
    }
  }, [onImageUpload]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.tif', '.tiff']
    },
    maxFiles: 1,
    disabled: isPredicting || hasResult
  });
  
  React.useEffect(() => {
    setDragActive(isDragActive);
  }, [isDragActive]);
  
  return (
    <div className="w-full">
      {!imagePreview ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:bg-gray-50
            ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
        >
          <input {...getInputProps()} />
          
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            stroke="currentColor" 
            fill="none" 
            viewBox="0 0 48 48" 
            aria-hidden="true"
          >
            <path 
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
              strokeWidth={2} 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
          
          <div className="mt-4 flex text-sm text-gray-600 flex-col items-center">
            <p className="font-medium text-primary-600 hover:text-primary-500">
              Click to upload
            </p>
            <p className="pl-1">or drag and drop a lymphoma image</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            PNG, JPG, TIFF up to 5MB
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="flex justify-center mb-4">
            <div className="relative w-full max-w-md h-56 md:h-64 rounded-lg overflow-hidden">
              <img 
                src={imagePreview} 
                alt="Uploaded lymphoma sample" 
                className="w-full h-full object-contain" 
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-2 justify-center">
            {!hasResult && !isPredicting && (
              <button
                onClick={onPredict}
                className="px-4 py-2 rounded-md text-white font-medium
                  bg-primary-600 hover:bg-primary-700"
              >
                Analyze Image
              </button>
            )}
            
            <button
              onClick={onReset}
              disabled={isPredicting}
              className="px-4 py-2 rounded-md text-gray-500 font-medium border border-gray-300 
                hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {hasResult ? 'Upload New Image' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;