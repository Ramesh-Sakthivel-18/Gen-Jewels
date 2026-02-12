import { useState, useEffect, useRef } from 'react';
import { useDesign } from '../context/DesignContext';
import { useServer } from '../context/ServerContext'; // ADDED: Server Hook
import toast from 'react-hot-toast';

// --- CONFIGURATION: EXACT FILE MAPPING ---
const ASSETS_BASE = '/assets/wizard';

const ASSET_LOOKUP = {
  Bangle: {
    styles: {
      Antique: 'bangles/bangles_antique.jpeg',
      Modern: 'bangles/bangles_modern.jpg',
      Traditional: 'bangles/bangles_traditional.jpg'
    },
    materials: {
      Gold: 'bangles/bangles_gold.jpg',
      Platinum: 'bangles/bangles_platinum.jpeg',
      Silver: 'bangles/bangles_silver.jpeg'
    },
    theme: {
      Floral: 'bangles/bangles_floral.jpg',
      Leaf: 'bangles/bangles_leaf.jpg',
      Peacock: 'bangles/bangles_peocock.jpeg'
    }
  },
  Earring: {
    styles: {
      Antique: 'earings/earing_antiques.jpg',
      Modern: 'earings/earing_modern.jpg',
      Traditional: 'earings/earing_traditional.jpeg'
    },
    materials: {
      Gold: 'earing/earing_gold.jpg',
      Platinum: 'earing/earing_platinum.jpg',
      Silver: 'earing/earing_silver.jpeg'
    },
    theme: {
      Floral: 'earings/earing_floral.jpeg',
      Leaf: 'earings/earing_leaf.jpeg',
      Peacock: 'earings/earing_peacock.jpg'
    }
  },
  Necklace: {
    styles: {
      Antique: 'necklace/necklace_antique.jpeg',
      Modern: 'necklace/necklace_modern.jpeg',
      Traditional: 'necklace/necklace_traditional.jpg'
    },
    materials: {
      Gold: 'necklace/necklace_gold.jpeg',
      Platinum: 'necklace/necklace_platinum.jpeg',
      Silver: 'necklace/necklace_silver.jpg'
    },
    theme: {
      Floral: 'necklace/necklace_floral.jpeg',
      Leaf: 'necklace/necklace_leaf.jpg',
      Peacock: 'necklace/necklace_peacock.jpeg'
    }
  }
};

const SELECTION_CONFIG = {
  jewelry_type: {
    title: "Select Jewelry Type",
    options: [
      { label: 'Necklace', value: 'Necklace', img: `${ASSETS_BASE}/types/necklace.jpg` },
      { label: 'Bangle', value: 'Bangle', img: `${ASSETS_BASE}/types/bangles.jpg` },
      { label: 'Earring', value: 'Earring', img: `${ASSETS_BASE}/types/earings.jpg` },
    ]
  },
  style: {
    title: "Choose Aesthetic Style",
    dynamic: true,
    options: [
      { label: 'Antique', value: 'Antique' },
      { label: 'Modern', value: 'Modern' },
      { label: 'Traditional', value: 'Traditional' },
    ]
  },
  material: {
    title: "Select Material",
    dynamic: true,
    options: [
      { label: 'Gold', value: 'Gold' },
      { label: 'Silver', value: 'Silver' },
      { label: 'Platinum', value: 'Platinum' },
    ]
  },
  theme: {
    title: "Design Theme",
    dynamic: true,
    options: [
      { label: 'Peacock', value: 'Peacock' },
      { label: 'Floral', value: 'Floral' },
      { label: 'Leaf', value: 'Leaf' },
    ]
  },
  stone: {
    title: "Centerpiece Stone",
    dynamic: false,
    options: [
      { label: 'Diamond', value: 'Diamond', img: `${ASSETS_BASE}/stones/daimond.jpg` },
      { label: 'Ruby', value: 'Ruby', img: `${ASSETS_BASE}/stones/ruby.jpg` },
      { label: 'Emerald', value: 'Emerald', img: `${ASSETS_BASE}/stones/emarld.jpg` },
      { label: 'Sapphire', value: 'Sapphire', img: `${ASSETS_BASE}/stones/sapphire.jpg` },
      { label: 'No Stone', value: 'No Stone', img: 'https://via.placeholder.com/150?text=No+Stone' },
    ]
  }
};

const TEXT_OPTIONS = {
  size: ["Medium", "Heavy", "Lightweight", "Bridal Heavy"],
  finish: ["High Polish", "Matte", "Antique Finish", "Handcrafted Look"]
};

const LOADING_MESSAGES = [
  "We are understanding your design...",
  "We are crafting your vision...",
  "We are designing your jewelry...",
  "We are adding the perfect details...",
  "We are finalizing your masterpiece..."
];

export default function Dashboard() {
  const { generateDesign, isGenerating, latestDesign } = useDesign();
  const { isServerLive, isChecking } = useServer(); // SERVER HOOK
  
  const [activeModal, setActiveModal] = useState(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const prevGenerating = useRef(false);

  // --- 1. GET DYNAMIC BASE URL ---
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // --- STATE ---
  const [params, setParams] = useState(() => {
    const savedParams = localStorage.getItem('dashboard_params');
    return savedParams ? JSON.parse(savedParams) : {
      jewelry_type: '', style: '', material: '', stone: '',
      theme: '', size: 'Medium', finish: 'High Polish', extra_text: ''
    };
  });

  useEffect(() => {
    localStorage.setItem('dashboard_params', JSON.stringify(params));
  }, [params]);

  useEffect(() => {
    if (isGenerating) {
      setCurrentMessageIndex(0);
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  useEffect(() => {
    if (prevGenerating.current === true && isGenerating === false && latestDesign) {
      handleReset();
    }
    prevGenerating.current = isGenerating;
  }, [isGenerating, latestDesign]);

  const getImageSrc = (field, option) => {
    if (option.img) return option.img;
    if (SELECTION_CONFIG[field].dynamic) {
      const type = params.jewelry_type;
      const val = option.value;
      if (!type) return 'https://via.placeholder.com/150?text=Select+Type';

      const pathSuffix = ASSET_LOOKUP[type]?.[field === 'style' ? 'styles' : field === 'material' ? 'materials' : 'theme']?.[val];
      if (pathSuffix) {
        return `${ASSETS_BASE}/${field === 'style' ? 'styles' : field === 'material' ? 'materials' : 'theme'}/${pathSuffix}`;
      }
    }
    return 'https://via.placeholder.com/150?text=Image+Missing';
  };

  const handleSelect = (field, value) => {
    setParams(prev => ({ ...prev, [field]: value }));
    setActiveModal(null);
  };

  const handleGenerate = () => {
    if (!isServerLive) {
      toast.error("AI Server is Offline");
      return;
    }
    generateDesign(params);
  };

  const handleReset = () => {
    const defaults = {
      jewelry_type: '', style: '', material: '', stone: '',
      theme: '', size: 'Medium', finish: 'High Polish', extra_text: ''
    };
    setParams(defaults);
    localStorage.removeItem('dashboard_params');
  };

  const canGenerate = params.jewelry_type && params.style && params.material && params.theme && params.stone;
  const typeSelected = !!params.jewelry_type;
  const showResultMode = isGenerating || latestDesign;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4 lg:p-6 overflow-hidden">
      
      {/* --- OFFLINE MODAL --- */}
      {!isServerLive && !isChecking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/30 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12 max-w-lg text-center transform scale-100 animate-scale-up">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
              🔌
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">AI Engine Offline</h2>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
              The backend AI engine is currently resting. We cannot process requests or generate designs right now. Please check back in a little while!
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-gray-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      <div className={`
        max-w-7xl mx-auto grid gap-6 transition-all duration-700
        ${showResultMode ? 'lg:grid-cols-12' : 'lg:grid-cols-12'}
        ${activeModal || (!isServerLive && !isChecking) ? 'blur-md pointer-events-none select-none grayscale-[0.3]' : ''}
      `}>
        
        {/* --- LEFT COLUMN: CONTROLS --- */}
        <div className={`
          transition-all duration-700 ease-in-out
          ${showResultMode ? 'lg:col-span-4 order-2 lg:order-1' : 'lg:col-span-8 order-1'}
        `}>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8 h-full flex flex-col">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Jewelry Design Studio</h1>
              <p className="text-gray-600">Craft your perfect piece with AI precision</p>
            </div>

            {/* SELECTORS */}
            <div className={`grid gap-4 mb-6 ${showResultMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
              <SelectorCard title="Type" value={params.jewelry_type} onClick={() => setActiveModal('jewelry_type')} disabled={isGenerating} img={params.jewelry_type ? SELECTION_CONFIG.jewelry_type.options.find(o => o.value === params.jewelry_type)?.img : null} compact={showResultMode} />
              <SelectorCard title="Style" value={params.style} onClick={() => setActiveModal('style')} disabled={!typeSelected || isGenerating} img={params.style && params.jewelry_type ? getImageSrc('style', {value: params.style}) : null} compact={showResultMode} />
              <SelectorCard title="Material" value={params.material} onClick={() => setActiveModal('material')} disabled={!typeSelected || isGenerating} img={params.material && params.jewelry_type ? getImageSrc('material', {value: params.material}) : null} compact={showResultMode} />
              <SelectorCard title="Theme" value={params.theme} onClick={() => setActiveModal('theme')} disabled={!typeSelected || isGenerating} img={params.theme && params.jewelry_type ? getImageSrc('theme', {value: params.theme}) : null} compact={showResultMode} />
              <SelectorCard title="Stone" value={params.stone} onClick={() => setActiveModal('stone')} disabled={isGenerating} img={params.stone ? SELECTION_CONFIG.stone.options.find(o => o.value === params.stone)?.img : null} compact={showResultMode} />
            </div>

            {/* TEXT OPTIONS */}
            <div className={`space-y-4 ${showResultMode ? 'hidden md:block' : ''}`}>
              <div className={`grid gap-4 ${showResultMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size Preference</label>
                  <select disabled={isGenerating} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-base text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all" value={params.size} onChange={e => setParams({...params, size: e.target.value})}>
                    {TEXT_OPTIONS.size.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Finish Type</label>
                  <select disabled={isGenerating} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-base text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all" value={params.finish} onChange={e => setParams({...params, finish: e.target.value})}>
                    {TEXT_OPTIONS.finish.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              {!showResultMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Instructions</label>
                  <textarea disabled={isGenerating} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-base text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all resize-none" rows="3" placeholder="Add any specific details or preferences..." value={params.extra_text} onChange={e => setParams({...params, extra_text: e.target.value})} />
                </div>
              )}
            </div>

            {/* GENERATE BUTTON */}
            {!latestDesign && (
              <button 
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating || !isServerLive}
                title={!isServerLive ? "The AI server is currently resting. Please check back later." : ""}
                className={`w-full mt-6 py-4 text-white font-semibold rounded-xl transition-all duration-300 shadow-md
                  ${(!canGenerate || isGenerating || !isServerLive) 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-amber-600 hover:bg-amber-700 hover:shadow-lg hover:-translate-y-0.5'}
                `}
              >
                {!isServerLive 
                  ? '🔴 Server Offline' 
                  : isGenerating 
                    ? 'Generating...' 
                    : 'Generate Design'}
              </button>
            )}
          </div>
        </div>

        {/* --- RIGHT COLUMN: PREVIEW --- */}
        <div className={`
          transition-all duration-700 ease-in-out
          ${showResultMode ? 'lg:col-span-8 order-1 lg:order-2' : 'lg:col-span-4 order-2'}
        `}>
          <div className={`
            bg-white rounded-2xl overflow-hidden shadow-md border border-gray-200 
            flex items-center justify-center transition-all duration-700
            ${showResultMode ? 'h-[calc(100vh-3rem)]' : 'h-[400px] lg:h-[600px]'}
          `}>
            {latestDesign && !isGenerating ? (
              <div className="relative w-full h-full animate-fade-in flex flex-col">
                <div className="flex-grow overflow-auto">
                  {/* UPDATE: Use Dynamic Base URL */}
                  <img 
                    src={`${API_BASE_URL}/${latestDesign.image_url}`} 
                    className="w-full h-full object-contain p-4" 
                    alt="Generated Design" 
                  />
                </div>
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <p className="font-semibold text-gray-900 mb-2">AI Prompt Used:</p>
                  <p className="text-gray-600 text-sm">{latestDesign.final_prompt}</p>
                </div>
                <button 
                  onClick={handleReset}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Generate Another Design
                </button>
              </div>
            ) : (
              <div className="text-center p-6 lg:p-8 w-full h-full flex flex-col items-center justify-center">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center animate-fade-in">
                    <div className="relative w-32 h-32 mb-8">
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-600 animate-spin-slow"></div>
                      <div className="absolute inset-3 rounded-full border-4 border-transparent border-r-orange-500 animate-spin-medium"></div>
                      <div className="absolute inset-6 rounded-full border-4 border-transparent border-b-yellow-500 animate-spin-fast"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-20 flex items-center justify-center overflow-hidden">
                      <p className="text-lg font-medium text-gray-700 animate-fade-in-out px-4 text-center">
                        {LOADING_MESSAGES[currentMessageIndex]}
                      </p>
                    </div>
                    <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
                  </div>
                ) : (
                  <div className="opacity-70 transition-opacity duration-500">
                    <div className="text-7xl mb-4 text-gray-300">💎</div>
                    <p className="text-gray-500 text-lg font-medium">Your design preview will appear here</p>
                    <p className="text-gray-400 text-sm mt-2">Select options and click generate to begin</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- POPUP MODAL --- */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
          <div className="absolute inset-0" onClick={() => setActiveModal(null)}></div>
          
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">
            <div className="flex justify-between items-center p-6 lg:p-8 border-b border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-900">{SELECTION_CONFIG[activeModal].title}</h3>
              <button 
                onClick={() => setActiveModal(null)} 
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full transition-colors hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 lg:p-8 overflow-y-auto bg-gray-50 flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {SELECTION_CONFIG[activeModal].options.map((option) => {
                  const isSelected = params[activeModal] === option.value;
                  const imgSrc = getImageSrc(activeModal, option);

                  return (
                    <div 
                      key={option.value} 
                      onClick={() => handleSelect(activeModal, option.value)}
                      className={`group cursor-pointer relative rounded-xl overflow-hidden border transition-all duration-300 bg-white shadow-sm
                        ${isSelected ? 'border-amber-500 shadow-md scale-105 ring-2 ring-amber-200' : 'border-gray-200 hover:border-amber-300 hover:shadow-md hover:scale-105'}
                      `}
                    >
                      <div className="aspect-square bg-gray-100 relative overflow-hidden">
                        <img 
                          src={imgSrc} 
                          alt={option.label} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=Image+Not+Found'; }}
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                            <span className="bg-white text-amber-600 p-3 rounded-full shadow-lg">
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          </div>
                        )}
                      </div>
                      <div className={`p-3 text-center font-semibold transition-colors ${isSelected ? 'text-amber-700 bg-amber-50' : 'text-gray-800 group-hover:text-amber-600'}`}>
                        {option.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in-out { 0%, 100% { opacity: 0; transform: translateY(10px); } 10%, 90% { opacity: 1; transform: translateY(0); } }
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        @keyframes spin-medium { to { transform: rotate(-360deg); } }
        @keyframes spin-fast { to { transform: rotate(360deg); } }
        
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out; }
        .animate-fade-in-out { animation: fade-in-out 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        .animate-spin-medium { animation: spin-medium 2s linear infinite; }
        .animate-spin-fast { animation: spin-fast 1.5s linear infinite; }
      `}</style>
    </div>
  );
}

// --- SUB-COMPONENT ---
const SelectorCard = ({ title, value, onClick, disabled, img, compact }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-300 w-full shadow-sm
      ${disabled ? 'bg-gray-50 opacity-70 cursor-not-allowed' : 'bg-white hover:border-amber-300 hover:shadow-md cursor-pointer hover:-translate-y-0.5'}
      ${value ? 'border-amber-200 bg-amber-50/50' : 'border-gray-200'}
      ${compact ? 'h-16' : 'h-20'}
    `}
  >
    <div className={`rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200 transition-all
      ${compact ? 'w-12 h-12' : 'w-16 h-16'}
    `}>
      {img ? (
        <img src={img} alt={value} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">+</div>
      )}
    </div>
    <div className="overflow-hidden flex-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{title}</p>
      <p className={`font-semibold truncate ${compact ? 'text-base' : 'text-lg'} ${value ? 'text-amber-700' : 'text-gray-600'}`}>
        {value || 'Select...'}
      </p>
    </div>
  </button>
);