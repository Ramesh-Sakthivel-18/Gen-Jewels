import { useState, useRef, useEffect } from 'react';
import api from '../services/api'; 
import { useServer } from '../context/ServerContext';
import toast from 'react-hot-toast';

export default function ImageToImage() {
  const { isServerLive, isChecking } = useServer();
  
  // --- 1. GET DYNAMIC TUNNEL URL ---
  // If on Vercel, this uses the Tunnel. If on Localhost, it uses localhost.
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // --- Helper: Construct Image URL ---
  // This handles the path safely for both Windows and Web
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    // If the backend sends a full URL, use it. Otherwise, attach our Base URL.
    if (imagePath.startsWith('http')) return imagePath;
    
    // Ensure we don't have double slashes
    const cleanBase = API_BASE_URL.replace(/\/$/, '');
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    
    return `${cleanBase}${cleanPath}`;
  };

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [jewelryType, setJewelryType] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [imageAspectRatio, setImageAspectRatio] = useState(16/9);

  const fileInputRef = useRef(null);

  const loadingMessages = [
    "Analyzing your image structure...",
    "Understanding the design elements...",
    "Applying AI transformations...",
    "Refining details and textures...",
    "Finalizing your masterpiece..."
  ];

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  useEffect(() => {
    if (resultImage) {
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        setImageAspectRatio(ratio);
      };
      // FIX: Use dynamic URL instead of localhost
      img.src = getImageUrl(resultImage);
    } else {
      setImageAspectRatio(16/9);
    }
  }, [resultImage]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size should be less than 10MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultImage(null);
      setImageAspectRatio(16/9);
      toast.success("Image uploaded successfully!");
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile || !jewelryType) {
      return toast.error("Please upload an image and select a jewelry type.");
    }
    
    setIsGenerating(true);
    
    const formData = new FormData();
    formData.append('init_image', selectedFile); 
    formData.append('jewelry_type', jewelryType); 
    formData.append('prompt', prompt); 
    formData.append('strength', '0.75'); 

    try {
      // FIX: Added headers to bypass Tunnel warning pages
      const response = await api.post('/generate/image-to-image', formData, { 
        headers: { 
          'Content-Type': 'multipart/form-data',
          'bypass-tunnel-reminder': 'true',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      // Backend returns relative path, e.g., "storage/generated/..."
      setResultImage(response.data.image_url);
      toast.success("✨ Transformation Complete!");
    } catch (error) {
      console.error(error);
      toast.error("⚠️ Generation Failed. Check backend connection.");
    } finally {
      setIsGenerating(false);
      setLoadingMessageIndex(0);
    }
  };

  const handleGenerateNew = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setJewelryType('');
    setPrompt('');
    setResultImage(null);
    setImageAspectRatio(16/9);
    toast.success("Ready for a new transformation!");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size should be less than 10MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultImage(null);
      setImageAspectRatio(16/9);
      toast.success("Image uploaded successfully!");
    } else {
      toast.error("Please upload a valid image file");
    }
  };

  const jewelryTypes = [
    { name: 'Necklace' },
    { name: 'Earring' },
    { name: 'Bangle' }
  ];

  return (
    <div className="relative max-w-7xl mx-auto min-h-[calc(100vh-100px)] p-6">
       {/* (Keeping your original CSS styles) */}
      <style>{`
        @keyframes rotate-outer { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes rotate-middle { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
        @keyframes rotate-inner { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes pulse-glow { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
        @keyframes fade-in-out { 0%, 100% { opacity: 0; transform: translateY(10px); } 10%, 90% { opacity: 1; transform: translateY(0); } }
        @keyframes scale-up { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes slide-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
        
        .rotate-outer { animation: rotate-outer 3s linear infinite; }
        .rotate-middle { animation: rotate-middle 2s linear infinite; }
        .rotate-inner { animation: rotate-inner 1.5s linear infinite; }
        .pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .fade-message { animation: fade-in-out 3s ease-in-out infinite; }
        .scale-up { animation: scale-up 0.3s ease-out; }
        .fade-in { animation: fade-in 0.5s ease-out; }
        .slide-up { animation: slide-up 0.4s ease-out; }
        .shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); background-size: 1000px 100%; animation: shimmer 2s infinite; }
      `}</style>

      {/* OFFLINE MODAL OVERLAY */}
      {!isServerLive && !isChecking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/50 p-10 md:p-14 max-w-lg text-center scale-up">
            <div className="w-24 h-24 bg-gradient-to-br from-red-50 to-rose-100 text-red-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-lg">
              🔌
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">AI Engine Offline</h2>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              The backend AI engine is currently resting. We cannot process image transformations right now. Please check back later!
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-gradient-to-r from-slate-900 to-slate-700 text-white font-semibold py-4 px-10 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className={`transition-all duration-700 ${!isServerLive && !isChecking ? 'blur-lg pointer-events-none select-none grayscale' : ''}`}>
        
        {/* HEADER */}
        <div className="text-center mb-10 fade-in">
          <h1 className="text-5xl font-bold text-slate-900 mb-4 tracking-tight leading-tight">Image to Image Transformation</h1>
          <p className="text-slate-600 text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Upload a jewelry photo, choose a type, and let AI refine it into a stunning design.
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN: INPUTS */}
          <div className="space-y-6 slide-up" style={{ animationDelay: '0.1s' }}>
            {/* UPLOAD AREA */}
            <div 
              className="group relative p-6 bg-white rounded-3xl shadow-lg border border-slate-200/50 transition-all duration-300 hover:shadow-xl hover:border-indigo-200/50 cursor-pointer"
              onClick={() => !previewUrl && fileInputRef.current.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-purple-50/0 group-hover:from-indigo-50/10 group-hover:to-purple-50/10 rounded-3xl transition-all duration-500" />
              
              <div className="relative">
                {previewUrl ? (
                  <div className="relative rounded-2xl overflow-hidden shadow-md">
                    <img 
                      src={previewUrl} 
                      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105" 
                      alt="Uploaded Jewelry"
                    />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current.click();
                      }}
                      className="absolute bottom-4 right-4 bg-white/90 text-slate-900 px-4 py-2 rounded-full font-medium text-sm shadow-md hover:bg-white transition-all duration-300 flex items-center gap-2 backdrop-blur-sm"
                    >
                      <span className="text-blue-500">🔄</span> Change Image
                    </button>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-300 rounded-2xl transition-colors duration-300 group-hover:border-indigo-400">
                    <div className="text-5xl mb-4 text-indigo-400">📸</div>
                    <p className="text-slate-700 font-medium mb-2">Upload Jewelry Image</p>
                    <p className="text-slate-500 text-sm">Drag & drop or click to select</p>
                    <p className="text-slate-400 text-xs mt-2">Max 10MB • JPG, PNG, WEBP</p>
                  </div>
                )}
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            {/* JEWELRY TYPE SELECTION */}
            <div className="p-6 bg-white rounded-3xl shadow-lg border border-slate-200/50">
              <label className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4 block flex items-center gap-2">
                <span className="text-blue-500">💎</span> Select Jewelry Type
              </label>
              <div className="grid grid-cols-3 gap-4">
                {jewelryTypes.map((type) => (
                  <button
                    key={type.name}
                    onClick={() => setJewelryType(type.name)}
                    className={`p-4 rounded-2xl text-center transition-all duration-300 shadow-md
                      ${jewelryType === type.name 
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white scale-105' 
                        : 'bg-slate-50 hover:bg-slate-100 hover:shadow-lg hover:scale-105'}
                    `}
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <span className="text-sm font-medium">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* GENERATE BUTTON */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedFile || !jewelryType}
              className={`w-full py-6 text-white font-bold rounded-3xl text-xl shadow-2xl transition-all duration-300 transform
                ${isGenerating || !selectedFile || !jewelryType 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:shadow-3xl hover:scale-105 hover:brightness-105'}
              `}
            >
              {isGenerating ? 'Transforming...' : '✨ Transform Image'}
            </button>
          </div>

          {/* RIGHT COLUMN: PREVIEW WITH DYNAMIC ASPECT RATIO */}
          <div className="flex flex-col gap-4">
            <div 
              className="relative bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800/50 flex flex-col"
              style={{ 
                aspectRatio: resultImage ? imageAspectRatio : '16/9',
                transition: 'aspect-ratio 0.3s ease-in-out'
              }}
            >
              {/* CONTAINER WITH DYNAMIC ASPECT RATIO */}
              <div 
                className="relative w-full h-full flex items-center justify-center cursor-zoom-in group transition-all duration-300 hover:shadow-inner" 
                onDragOver={handleDragOver} 
                onDrop={handleDrop} 
                onClick={() => resultImage && setShowModal(true)}
              >
                {resultImage && !isGenerating ? (
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-2xl shimmer group-hover:shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                ) : null}

                {resultImage && !isGenerating ? (
                  // FIX: Display result using Helper Function
                  <img 
                    src={getImageUrl(resultImage)} 
                    className="max-w-full max-h-full object-contain rounded-2xl transition-all duration-300" 
                    alt="AI Transformed Design"
                  />
                ) : (
                  <div className="text-center p-10">
                    {isGenerating ? (
                      <div className="flex flex-col items-center">
                        {/* 3-NESTED CIRCLE LOADING ANIMATION */}
                        <div className="relative w-32 h-32 mb-8">
                          <div className="absolute inset-0 border-4 border-transparent border-t-indigo-500 border-r-indigo-500 rounded-full rotate-outer"></div>
                          <div className="absolute inset-3 border-4 border-transparent border-t-purple-500 border-l-purple-500 rounded-full rotate-middle"></div>
                          <div className="absolute inset-6 border-4 border-transparent border-t-pink-500 border-b-pink-500 rounded-full rotate-inner"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full pulse-glow blur-sm"></div>
                          </div>
                        </div>

                        {/* ANIMATED LOADING MESSAGE */}
                        <div className="h-8 mb-4">
                          <h3 
                            key={loadingMessageIndex}
                            className="text-xl font-semibold text-white fade-message"
                          >
                            {loadingMessages[loadingMessageIndex]}
                          </h3>
                        </div>
                        
                        <p className="text-slate-400 text-sm">This may take a few moments</p>
                      </div>
                    ) : (
                      <div className="fade-in">
                        <div className="text-8xl mb-6 drop-shadow-lg">🎨</div>
                        <p className="text-slate-400 text-xl font-medium">
                          Your transformation appears here
                        </p>
                        <p className="text-slate-500 text-sm mt-2">
                          Upload an image and select jewelry type to begin
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* GENERATE NEW DESIGN BUTTON */}
            {resultImage && !isGenerating && (
              <div className="p-6 bg-white rounded-3xl shadow-lg border border-slate-200/50">
                <button
                  onClick={handleGenerateNew}
                  className="w-full py-4 text-white font-bold rounded-2xl text-lg shadow-lg transition-all duration-300 transform bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-2xl hover:scale-105 hover:from-indigo-600 hover:to-purple-700"
                >
                  ✨ Generate New Design
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* POPUP MODAL (CINEMA MODE) */}
      {showModal && resultImage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" 
            onClick={() => setShowModal(false)}
          ></div>
          
          <div className="relative bg-white w-full max-w-7xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row scale-up">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 z-20 bg-slate-900/80 hover:bg-slate-900 text-white w-12 h-12 rounded-full backdrop-blur-sm transition-all duration-300 flex items-center justify-center font-bold text-xl hover:scale-110 shadow-lg"
            >
              ✕
            </button>

            {/* Left: Full Image */}
            <div className="md:w-3/5 bg-black flex items-center justify-center p-8">
              {/* FIX: Use Dynamic URL here too */}
              <img
                src={getImageUrl(resultImage)}
                className="max-w-full max-h-full object-contain"
                alt="Full Size Transformation"
              />
            </div>

            {/* Right: Details Panel */}
            <div className="md:w-2/5 p-8 overflow-y-auto bg-gradient-to-br from-slate-50 to-white flex flex-col">
              <h3 className="text-3xl font-bold text-slate-900 mb-6 pb-4 border-b-2 border-slate-200">
                Transformation Details
              </h3>

              <div className="space-y-6 flex-1">
                {/* Jewelry Type */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
                    💎 Jewelry Type
                  </label>
                  <div className="text-slate-800 text-lg font-bold bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    {jewelryType}
                  </div>
                </div>

                {/* Original Image */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
                    📷 Original Image
                  </label>
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                    <img 
                      src={previewUrl} 
                      className="w-full h-48 object-contain rounded-xl" 
                      alt="Original"
                    />
                  </div>
                </div>

                {/* Transformation Instructions */}
                {prompt && (
                  <div>
                    <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 block">
                      ✨ Transformation Instructions
                    </label>
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl text-slate-700 text-sm border border-indigo-200 shadow-sm">
                      {prompt}
                    </div>
                  </div>
                )}

                {/* Download Button */}
                <div className="mt-auto pt-6">
                  {/* FIX: Use Dynamic URL for download */}
                  <a
                    href={getImageUrl(resultImage)}
                    download
                    className="flex items-center justify-center w-full py-5 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-bold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 gap-2"
                  >
                    <span className="text-xl">⬇️</span>
                    Download High-Res Image
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}