import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ImageUploader from './components/ImageUploader';
import ResultsView from './components/ResultsView';
import VisualizationPanel from './components/VisualizationPanel';
import LoadingIndicator from './components/LoadingIndicator';
import ImageAnalyzer from './components/ImageAnalyzer';
import SimpleExamples from './components/Examples';
import QRCode from './components/QRcode';
import { useModel } from './hooks/useModel';
import './styles/tailwind.css';

type PredictionResult = {
  class: string;
  probability: number;
  featureMaps?: any[];
};

const App: React.FC = () => {
  // Use our custom hook to handle model operations
  const { 
    isModelLoading, 
    modelLoadingProgress, 
    isPredicting, 
    error, 
    predict, 
    resetError 
  } = useModel();
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    resetError();
    setPredictionResult(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setPredictionResult(null);
    resetError();
  };
  
  const handleAnalysisComplete = (result: any) => {
    setPredictionResult(result);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        {isModelLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <LoadingIndicator progress={modelLoadingProgress} />
            <p className="mt-4 text-gray-600">
              Loading lymphoma detection model... {modelLoadingProgress.toFixed(0)}%
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                Upload Lymphoma Image for Analysis
              </h2>
              {!imageFile || predictionResult ? (
                <>
                  <ImageUploader 
                    onImageUpload={handleImageUpload} 
                    onReset={handleReset}
                    imagePreview={imagePreview}
                    hasResult={!!predictionResult}
                    onPredict={() => {}}
                    isPredicting={false}
                  />
                  
                  {/* Simple examples gallery */}
                  {!imagePreview && (
                    <SimpleExamples onSelectExample={handleImageUpload} />
                  )}
                </>
              ) : (
                <div className="flex flex-col">
                  <div className="flex justify-center mb-4">
                    <div className="relative w-full max-w-md h-56 md:h-64 rounded-lg overflow-hidden">
                      <img 
                        src={imagePreview || ''} 
                        alt="Uploaded lymphoma sample" 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                  </div>
                  
                  <ImageAnalyzer
                    imageFile={imageFile}
                    imagePreview={imagePreview}
                    onAnalysisComplete={handleAnalysisComplete}
                  />
                  
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 rounded-md text-gray-700 font-medium border border-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {!imagePreview && <QRCode />}

            {predictionResult && (
              <>
                <ResultsView result={predictionResult} />
                <VisualizationPanel 
                  featureMaps={predictionResult.featureMaps || []} 
                  originalImage={imagePreview || ''}
                />
              </>
            )}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default App;