import { useState, useEffect, useRef } from 'react';
import { useDesign } from '../context/DesignContext';
import { useServer } from '../context/ServerContext'; 
import toast from 'react-hot-toast';

export default function ImageToImage() {
  const { generateDesign, isGenerating, latestDesign, resetDesign, registerPage, unregisterPage, currentPage } = useDesign();
  const { isServerLive, isChecking } = useServer(); 
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); 
  const [prompt, setPrompt] = useState(""); 
  const [jewelryType, setJewelryType] = useState("Ring");
  const [selectedImage, setSelectedImage] = useState(null);
  
  const fileInputRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const PAGE_NAME = 'image-to-image';

  // Register page on mount and unregister on unmount
  useEffect(() => {
    const canGenerate = registerPage(PAGE_NAME);
    
    // Clear design only if this page is not recovering a generation
    if (!isGenerating || currentPage !== PAGE_NAME) {
      resetDesign(PAGE_NAME);
    }

    return () => {
      unregisterPage(PAGE_NAME);
    };
  }, []);

  useEffect(() => {
    return () => { 
      if (previewUrl) URL.revokeObjectURL(previewUrl); 
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleGenerate = () => {
    if (!selectedFile) { 
      toast.error("Please upload an image first."); 
      return; 
    }
    if (!isServerLive) { 
      toast.error("AI Server is Offline"); 
      return; 
    }

    // Check if another page is generating
    if (isGenerating && currentPage && currentPage !== PAGE_NAME) {
      toast.error(`Generation already in progress on ${currentPage === 'dashboard' ? 'Wizard' : 'Text-to-Image'} page`);
      return;
    }

    const formData = new FormData();
    formData.append('init_image', selectedFile); 
    formData.append('jewelry_type', jewelryType); 
    formData.append('prompt', prompt); 

    generateDesign(formData, true, PAGE_NAME);
  };

  const getImageUrl = (path) => {
    if (!path) return "";
    const cleanPath = path.replace(/\\/g, '/');
    const baseUrl = API_BASE_URL.replace(/\/$/, '');
    return `${baseUrl}/${cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath}`;
  };

  const handleImageClick = (imageData) => {
    setSelectedImage(imageData);
  };

  const handleDownload = async (imageUrl, filename = 'jewelry-transformed.png') => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Download started!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed. Please try again.');
    }
  };

  const PLACEHOLDER_IMAGE = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22400%22%20viewBox%3D%220%200%20400%20400%22%3E%3Crect%20fill%3D%22%23f8f9fa%22%20width%3D%22400%22%20height%3D%22400%22%2F%3E%3Ctext%20fill%3D%22%23adb5bd%22%20font-family%3D%22sans-serif%22%20font-size%3D%2218%22%20dy%3D%2210.5%22%20font-weight%3D%22500%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EImage%20Not%20Found%3C%2Ftext%3E%3C%2Fsvg%3E";

  const jewelryTypes = [
    { value: "Ring", label: "Ring" },
    { value: "Necklace", label: "Necklace" },
    { value: "Earring", label: "Earring" },
    { value: "Bangle", label: "Bangle" },
    { value: "Pendant", label: "Pendant" },
    { value: "Bracelet", label: "Bracelet" }
  ];

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-tr from-indigo-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-100/10 to-blue-100/10 rounded-full blur-3xl"></div>
      </div>

      {/* Offline Overlay */}
      {!isServerLive && !isChecking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 max-w-md text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Server Offline</h2>
            <p className="text-gray-600 text-base mb-8 leading-relaxed">
              The AI service is currently unavailable. Please try again later.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-gray-900 text-white font-medium py-3 px-6 rounded-lg hover:bg-gray-800 transition-all duration-200"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`relative z-10 transition-all duration-500 ${!isServerLive && !isChecking ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Header Section */}
        <div className="text-center py-8 px-4">
          <h1 className="text-4xl lg:text-5xl font-semibold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3 tracking-tight animate-in fade-in duration-500">
            Image to Image Transformation
          </h1>
          <p className="text-gray-600 text-base leading-relaxed max-w-3xl mx-auto animate-in fade-in duration-700">
            Upload a jewelry photo, choose a type, and let AI refine it into a stunning design.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Side - Upload & Options */}
            <div className="space-y-4 animate-in slide-in-from-left duration-500">
              
              {/* File Upload Box */}
              <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-200/50 shadow-lg shadow-blue-100/50 overflow-hidden">
                <div 
                  onClick={() => fileInputRef.current.click()} 
                  className="cursor-pointer p-8 transition-all duration-200 hover:bg-gray-50/50"
                >
                  {previewUrl ? (
                    <div className="relative group">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-64 object-contain rounded-lg" 
                      />
                      <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/5 transition-colors duration-200 rounded-lg flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-sm font-medium text-gray-700 bg-white px-4 py-2 rounded-lg shadow-md transition-opacity duration-200">
                          Change Image
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center mb-6 border-2 border-blue-100">
                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Jewelry Image</h3>
                      <p className="text-gray-600 mb-2">Drag & drop or click to select</p>
                      <p className="text-xs text-gray-400">Max 10MB • JPG, PNG, WEBP</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
              </div>

              {/* Jewelry Type Selection */}
              <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-200/50 shadow-lg shadow-blue-100/50 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-xs font-semibold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent uppercase tracking-wider">
                    Select Jewelry Type
                  </h3>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {jewelryTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setJewelryType(type.value)}
                      className={`py-3 px-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                        jewelryType === type.value
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30'
                          : 'bg-gradient-to-br from-gray-50 to-blue-50/30 text-gray-700 hover:from-blue-100 hover:to-blue-50 border border-gray-200/70'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transformation Instructions */}
              <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-200/50 shadow-lg shadow-purple-100/50 p-5">
                <label className="text-xs font-semibold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent uppercase tracking-wider mb-3 block">
                  Transformation Instructions (Optional)
                </label>
                <textarea 
                  className={`w-full p-3 text-sm bg-gradient-to-br from-gray-50 to-indigo-50/30 border-2 rounded-lg outline-none transition-all duration-200 resize-none h-24 ${
                    isGenerating 
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' 
                      : 'focus:border-gray-400 border-gray-200/70 hover:border-gray-300'
                  }`}
                  placeholder="Example: Change the metal to rose gold, add diamond accents, make it more minimalist..."
                  value={prompt} 
                  onChange={(e) => setPrompt(e.target.value)} 
                  disabled={isGenerating}
                />
              </div>

              {/* Warning if another page is generating */}
              {isGenerating && currentPage && currentPage !== PAGE_NAME && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-900">Generation in Progress</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        A design is being generated on the {currentPage === 'dashboard' ? 'Wizard' : 'Text-to-Image'} page. Please wait for it to complete.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <button 
                onClick={handleGenerate} 
                disabled={!selectedFile || isGenerating || !isServerLive}
                className={`w-full py-4 text-white font-semibold rounded-xl text-base transition-all duration-200 transform shadow-lg ${
                  (!selectedFile || isGenerating || !isServerLive) 
                    ? 'bg-gray-300 cursor-not-allowed shadow-gray-200' 
                    : 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:shadow-xl hover:shadow-gray-900/20 active:scale-[0.98]'
                }`}
              >
                {!isServerLive ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                    </svg>
                    Server Offline
                  </span>
                ) : isGenerating && currentPage === PAGE_NAME ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Transforming Image...
                  </span>
                ) : isGenerating && currentPage !== PAGE_NAME ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Generation in Progress
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Transform Image
                  </span>
                )}
              </button>
            </div>

            {/* Right Side - Result Preview */}
            <div className="animate-in slide-in-from-right duration-500">
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-2xl shadow-blue-900/10 overflow-hidden" style={{ aspectRatio: '16/10' }}>
                <div className="w-full h-full flex items-center justify-center">
                  {isGenerating && currentPage === PAGE_NAME ? (
                    /* Skeleton Loading - Only for this page */
                    <SkeletonLoader />
                  ) : latestDesign && currentPage === PAGE_NAME ? (
                    /* Generated Result - Only for this page */
                    <div className="relative w-full h-full cursor-pointer p-6" onClick={() => handleImageClick(latestDesign)}>
                      <div className="relative w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border-2 border-gray-200/70 hover:border-blue-400/50 transition-all duration-300 group">
                        <img 
                          src={getImageUrl(latestDesign.image_url)} 
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" 
                          alt="Transformed Design" 
                          onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.src = PLACEHOLDER_IMAGE; 
                          }} 
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="text-center">
                            <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl">
                              <svg className="w-8 h-8 text-gray-900 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <p className="text-sm font-semibold text-gray-900">Click to view details</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Empty State */
                    <div className="flex items-center justify-center p-10">
                      <div className="text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-100/30 border-2 border-blue-100">
                          <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-3">Your transformation appears here</h3>
                        <p className="text-gray-600 text-base">
                          Upload an image and select jewelry type to begin
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Detail Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setSelectedImage(null)}></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-900">Transformation Details</h3>
              <button 
                onClick={() => setSelectedImage(null)} 
                className="text-gray-500 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Side - Image Preview */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="relative group">
                    <img 
                      src={getImageUrl(selectedImage.image_url)} 
                      className="w-full h-auto object-contain rounded-lg" 
                      alt="Transformation Detail" 
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = PLACEHOLDER_IMAGE; 
                      }} 
                    />
                  </div>
                </div>

                {/* Right Side - Details Panel */}
                <div className="space-y-4">
                  {/* Jewelry Type */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      Jewelry Type
                    </h4>
                    <div className="text-gray-900 text-base font-medium bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                      {jewelryType}
                    </div>
                  </div>

                  {/* Original Image Preview */}
                  {previewUrl && (
                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Original Image
                      </h4>
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
                        <img 
                          src={previewUrl} 
                          alt="Original" 
                          className="w-full h-32 object-contain rounded"
                        />
                      </div>
                    </div>
                  )}

                  {/* Transformation Instructions */}
                  {prompt && (
                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Your Instructions
                      </h4>
                      <div className="text-gray-800 text-sm bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 leading-relaxed">
                        {prompt}
                      </div>
                    </div>
                  )}

                  {/* AI Enhancement */}
                  {selectedImage.final_prompt && (
                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        AI Processing Details
                      </h4>
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg text-gray-700 text-sm border border-gray-200 max-h-40 overflow-y-auto leading-relaxed">
                        {selectedImage.final_prompt}
                      </div>
                    </div>
                  )}

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownload(getImageUrl(selectedImage.image_url), `jewelry-transformed-${Date.now()}.png`)}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download High Quality Image
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
          background: linear-gradient(to right, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%);
          background-size: 1000px 100%;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-from-left {
          from { 
            opacity: 0;
            transform: translateX(-20px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-in-from-right {
          from { 
            opacity: 0;
            transform: translateX(20px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes zoom-in {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fade-in;
        }
        .slide-in-from-left {
          animation-name: slide-in-from-left;
        }
        .slide-in-from-right {
          animation-name: slide-in-from-right;
        }
        .zoom-in {
          animation-name: zoom-in;
        }
      `}</style>
    </div>
  );
}

// Skeleton Loader Component
const SkeletonLoader = () => (
  <div className="w-full h-full p-6 space-y-4">
    {/* Main Skeleton Image */}
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-200 h-full">
      <div className="absolute inset-0 animate-shimmer"></div>
    </div>
  </div>
);