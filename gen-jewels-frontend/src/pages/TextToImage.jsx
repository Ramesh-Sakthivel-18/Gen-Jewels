import { useState, useEffect } from 'react';
import { useDesign } from '../context/DesignContext';
import { useServer } from '../context/ServerContext';
import toast from 'react-hot-toast';

export default function TextToImage() {
  const { generateDesign, isGenerating, latestDesign, setLatestDesign } = useDesign();
  const { isServerLive, isChecking } = useServer();
  
  const [showModal, setShowModal] = useState(false);
  const [prompt, setPrompt] = useState(() => localStorage.getItem('text2img_prompt') || '');
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const loadingMessages = [
    "We are understanding your design...",
    "We are crafting your vision...",
    "We are shaping pixels into art...",
    "We are bringing your idea to life...",
    "We are finalizing the masterpiece..."
  ];

  useEffect(() => {
    localStorage.setItem('text2img_prompt', prompt);
  }, [prompt]);

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    generateDesign({
      jewelry_type: 'Artistic Concept',
      style: 'Custom',
      material: 'Mixed',
      stone: 'None',
      theme: 'Creative',
      size: 'Medium',
      finish: 'Standard',
      extra_text: prompt
    });
  };

  const handleGenerateNew = () => {
    // Reset the image and prompt locally without backend call
    setLatestDesign(null);
    setPrompt('');
    localStorage.removeItem('text2img_prompt');
    toast.success("Ready for a new design!");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Prompt copied!");
  };

  return (
    <div className="relative max-w-7xl mx-auto min-h-[calc(100vh-100px)] p-6">
      
      <style>{`
        @keyframes rotate-outer {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes rotate-middle {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @keyframes rotate-inner {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes fade-in-out {
          0%, 100% { opacity: 0; transform: translateY(10px); }
          10%, 90% { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-up {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        .rotate-outer {
          animation: rotate-outer 3s linear infinite;
        }
        .rotate-middle {
          animation: rotate-middle 2s linear infinite;
        }
        .rotate-inner {
          animation: rotate-inner 1.5s linear infinite;
        }
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .fade-message {
          animation: fade-in-out 3s ease-in-out infinite;
        }
        .scale-up {
          animation: scale-up 0.3s ease-out;
        }
        .fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>

      {/* OFFLINE MODAL OVERLAY */}
      {!isServerLive && !isChecking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/50 p-10 md:p-14 max-w-lg text-center scale-up">
            <div className="w-24 h-24 bg-gradient-to-br from-red-50 to-rose-100 text-red-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-lg">
              🔌
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
              AI Engine Offline
            </h2>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              The backend AI engine is currently resting. We cannot process text prompts right now. Please check back later!
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
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-700 ${!isServerLive && !isChecking ? 'blur-lg pointer-events-none select-none grayscale' : ''}`}>
        
        {/* LEFT: IMAGE RESULT */}
        <div className="order-2 lg:order-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50 flex flex-col relative group">
          <div className={`flex-1 flex items-center justify-center relative min-h-[500px] ${latestDesign ? 'h-[calc(100vh-16rem)]' : 'h-[calc(100vh-12rem)]'}`}>
            {latestDesign ? (
              <div className="relative w-full h-full bg-black cursor-pointer" onClick={() => setShowModal(true)}>
                <img 
                  src={`http://localhost:8000/${latestDesign.image_url}`} 
                  className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" 
                  alt="AI Generated Design" 
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 text-white backdrop-blur-sm">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">
                    ✨ AI Interpretation
                  </p>
                  <p className="text-sm font-medium opacity-90 line-clamp-2 mb-3">
                    {latestDesign.final_prompt.substring(0, 120)}...
                  </p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
                    <span>🔍 Click to expand full details</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-10">
                {isGenerating ? (
                  <div className="flex flex-col items-center">
                    {/* 3-NESTED CIRCLE LOADING ANIMATION */}
                    <div className="relative w-32 h-32 mb-8">
                      {/* Outer Circle */}
                      <div className="absolute inset-0 border-4 border-transparent border-t-amber-500 border-r-amber-500 rounded-full rotate-outer"></div>
                      
                      {/* Middle Circle */}
                      <div className="absolute inset-3 border-4 border-transparent border-t-rose-500 border-l-rose-500 rounded-full rotate-middle"></div>
                      
                      {/* Inner Circle */}
                      <div className="absolute inset-6 border-4 border-transparent border-t-violet-500 border-b-violet-500 rounded-full rotate-inner"></div>
                      
                      {/* Pulsing Center Glow */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-amber-500 via-rose-500 to-violet-500 rounded-full pulse-glow blur-sm"></div>
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
                    <div className="text-8xl mb-6 drop-shadow-lg">💎</div>
                    <p className="text-slate-400 text-xl font-medium">
                      Your imagination appears here
                    </p>
                    <p className="text-slate-500 text-sm mt-2">
                      Describe your vision and watch it come to life
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* GENERATE NEW DESIGN BUTTON - Only shows after generation */}
          {latestDesign && !isGenerating && (
            <div className="p-6 bg-gradient-to-r from-slate-800 to-slate-900 border-t border-slate-700/50">
              <button
                onClick={handleGenerateNew}
                className="w-full py-4 text-white font-bold rounded-2xl text-lg shadow-lg transition-all duration-300 transform bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-2xl hover:scale-105 hover:from-amber-600 hover:to-orange-700"
              >
                ✨ Generate New Design
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: TEXT INPUT */}
        <div className="order-1 lg:order-2 flex flex-col justify-center lg:pl-6">
          <div className="mb-8">
            <h2 className="text-5xl font-bold text-slate-900 mb-4 tracking-tight leading-tight">
              Text to Image
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              Describe your jewelry idea in detail, and our AI will craft it pixel by pixel into reality.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200/50 space-y-6">
            {/* PROMPT TEXTAREA WITH LABEL */}
            <div>
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3 block">
                📝 Your Creative Prompt
              </label>
              <textarea
                className={`w-full p-5 text-base bg-slate-50 border-2 rounded-2xl outline-none transition-all resize-none h-52 font-medium ${
                  isGenerating
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200'
                    : 'focus:bg-white focus:border-amber-500 focus:shadow-lg border-slate-200 hover:border-slate-300'
                }`}
                placeholder="E.g., A futuristic neon-glowing ring made of obsidian with intricate laser-etched patterns..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
              />
              <p className="text-xs text-slate-500 mt-2">
                💡 Tip: Be specific about materials, colors, and style for best results
              </p>
            </div>

            {/* GENERATE BUTTON */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating || !isServerLive}
              className={`w-full mt-4 py-5 text-white font-bold rounded-2xl text-xl shadow-lg transition-all duration-300 transform ${
                (!prompt.trim() || isGenerating || !isServerLive)
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 via-rose-500 to-violet-600 hover:shadow-2xl hover:scale-105'
              }`}
            >
              {!isServerLive ? '🔴 Offline' : isGenerating ? '✨ Generating Magic...' : '🚀 Generate Design'}
            </button>
          </div>
        </div>
      </div>

      {/* POPUP MODAL (CINEMA MODE) */}
      {showModal && latestDesign && (
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
              <img
                src={`http://localhost:8000/${latestDesign.image_url}`}
                className="max-w-full max-h-full object-contain"
                alt="Full Size Design"
              />
            </div>

            {/* Right: Details Panel */}
            <div className="md:w-2/5 p-8 overflow-y-auto bg-gradient-to-br from-slate-50 to-white flex flex-col">
              <h3 className="text-3xl font-bold text-slate-900 mb-6 pb-4 border-b-2 border-slate-200">
                Design Details
              </h3>

              <div className="space-y-6 flex-1">
                {/* Original Input */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
                    📝 Your Original Input
                  </label>
                  <div className="text-slate-800 text-base font-medium bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    "{prompt}"
                  </div>
                </div>

                {/* AI Enhanced Prompt */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-2">
                      ✨ AI Enhanced Prompt
                    </label>
                    <button
                      onClick={() => copyToClipboard(latestDesign.final_prompt)}
                      className="text-xs font-bold text-slate-500 hover:text-amber-600 uppercase tracking-wider transition-colors px-3 py-1 rounded-lg hover:bg-amber-50"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl text-slate-700 text-sm border border-amber-200 max-h-72 overflow-y-auto leading-relaxed shadow-sm">
                    {latestDesign.final_prompt}
                  </div>
                </div>

                {/* Download Button */}
                <div className="mt-auto pt-6">
                  <a
                    href={`http://localhost:8000/${latestDesign.image_url}`}
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