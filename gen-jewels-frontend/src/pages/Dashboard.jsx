import { useState, useEffect, useRef } from 'react';
import { useDesign } from '../context/DesignContext';
import { useServer } from '../context/ServerContext'; 
import toast from 'react-hot-toast';

const ASSETS_BASE = '/assets/wizard';

const ASSET_LOOKUP = {
  Bangle: { styles: { Antique: 'bangles/bangles_antique.jpeg', Modern: 'bangles/bangles_modern.jpg', Traditional: 'bangles/bangles_traditional.jpg' }, materials: { Gold: 'bangles/bangles_gold.jpg', Platinum: 'bangles/bangles_platinum.jpeg', Silver: 'bangles/bangles_silver.jpeg' }, theme: { Floral: 'bangles/bangles_floral.jpg', Leaf: 'bangles/bangles_leaf.jpg', Peacock: 'bangles/bangles_peocock.jpeg' } },
  Earring: { styles: { Antique: 'earings/earing_antiques.jpg', Modern: 'earings/earing_modern.jpg', Traditional: 'earings/earing_traditional.jpeg' }, materials: { Gold: 'earing/earing_gold.jpg', Platinum: 'earing/earing_platinum.jpg', Silver: 'earing/earing_silver.jpeg' }, theme: { Floral: 'earings/earing_floral.jpeg', Leaf: 'earings/earing_leaf.jpeg', Peacock: 'earings/earing_peacock.jpg' } },
  Necklace: { styles: { Antique: 'necklace/necklace_antique.jpeg', Modern: 'necklace/necklace_modern.jpeg', Traditional: 'necklace/necklace_traditional.jpg' }, materials: { Gold: 'necklace/necklace_gold.jpeg', Platinum: 'necklace/necklace_platinum.jpeg', Silver: 'necklace/necklace_silver.jpg' }, theme: { Floral: 'necklace/necklace_floral.jpeg', Leaf: 'necklace/necklace_leaf.jpg', Peacock: 'necklace/necklace_peacock.jpeg' } }
};

const SELECTION_CONFIG = {
  jewelry_type: { title: "Select Jewelry Type", options: [{ label: 'Necklace', value: 'Necklace', img: `${ASSETS_BASE}/types/necklace.jpg` }, { label: 'Bangle', value: 'Bangle', img: `${ASSETS_BASE}/types/bangles.jpg` }, { label: 'Earring', value: 'Earring', img: `${ASSETS_BASE}/types/earings.jpg` }] },
  style: { title: "Choose Aesthetic Style", dynamic: true, options: [{ label: 'Antique', value: 'Antique' }, { label: 'Modern', value: 'Modern' }, { label: 'Traditional', value: 'Traditional' }] },
  material: { title: "Select Material", dynamic: true, options: [{ label: 'Gold', value: 'Gold' }, { label: 'Silver', value: 'Silver' }, { label: 'Platinum', value: 'Platinum' }] },
  theme: { title: "Design Theme", dynamic: true, options: [{ label: 'Peacock', value: 'Peacock' }, { label: 'Floral', value: 'Floral' }, { label: 'Leaf', value: 'Leaf' }] },
  stone: { title: "Centerpiece Stone", dynamic: false, options: [{ label: 'Diamond', value: 'Diamond', img: `${ASSETS_BASE}/stones/daimond.jpg` }, { label: 'Ruby', value: 'Ruby', img: `${ASSETS_BASE}/stones/ruby.jpg` }, { label: 'Emerald', value: 'Emerald', img: `${ASSETS_BASE}/stones/emarld.jpg` }, { label: 'Sapphire', value: 'Sapphire', img: `${ASSETS_BASE}/stones/sapphire.jpg` }, { label: 'No Stone', value: 'No Stone', img: 'https://via.placeholder.com/150?text=No+Stone' }] }
};

const TEXT_OPTIONS = { 
  size: ["Medium", "Heavy", "Lightweight", "Bridal Heavy"], 
  finish: ["High Polish", "Matte", "Antique Finish", "Handcrafted Look"] 
};

const LOADING_MESSAGES = [
  "Understanding your design preferences...",
  "Crafting your vision with AI...",
  "Designing your jewelry piece...",
  "Adding the perfect details...",
  "Finalizing your masterpiece..."
];

const PLACEHOLDER_IMAGE = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22400%22%20viewBox%3D%220%200%20400%20400%22%3E%3Crect%20fill%3D%22%23f8f9fa%22%20width%3D%22400%22%20height%3D%22400%22%2F%3E%3Ctext%20fill%3D%22%23adb5bd%22%20font-family%3D%22sans-serif%22%20font-size%3D%2218%22%20dy%3D%2210.5%22%20font-weight%3D%22500%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EImage%20Not%20Found%3C%2Ftext%3E%3C%2Fsvg%3E";

const DEFAULT_PARAMS = {
  jewelry_type: '',
  style: '',
  material: '',
  stone: '',
  theme: '',
  size: 'Medium',
  finish: 'High Polish',
  extra_text: ''
};

export default function Dashboard() {
  const { generateDesign, isGenerating, latestDesign, resetDesign, registerPage, unregisterPage, currentPage } = useDesign();
  const { isServerLive, isChecking } = useServer(); 
  
  const [activeModal, setActiveModal] = useState(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const prevGenerating = useRef(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const PAGE_NAME = 'dashboard';

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

  // Initialize params - DO NOT persist to localStorage, reset on refresh
  const [params, setParams] = useState(DEFAULT_PARAMS);

  // Loading message rotation
  useEffect(() => {
    if (isGenerating) {
      setCurrentMessageIndex(0);
      const interval = setInterval(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const getImageSrc = (field, option) => {
    if (option.img) return option.img;
    if (SELECTION_CONFIG[field].dynamic) {
      const type = params.jewelry_type;
      const val = option.value;
      if (!type) return 'https://via.placeholder.com/150?text=Select+Type';
      const pathSuffix = ASSET_LOOKUP[type]?.[field === 'style' ? 'styles' : field === 'material' ? 'materials' : 'theme']?.[val];
      if (pathSuffix) return `${ASSETS_BASE}/${field === 'style' ? 'styles' : field === 'material' ? 'materials' : 'theme'}/${pathSuffix}`;
    }
    return 'https://via.placeholder.com/150?text=Image+Missing';
  };

  const handleSelect = (field, value) => {
    setParams(prev => ({ ...prev, [field]: value }));
    setActiveModal(null);
  };

  const handleReset = () => {
    setParams(DEFAULT_PARAMS);
    resetDesign();
    toast.success('Reset successfully');
  };

  const handleGenerate = () => {
    if (!isServerLive) {
      toast.error("AI Server is Offline");
      return;
    }
    
    // Check if another page is generating
    if (isGenerating && currentPage && currentPage !== PAGE_NAME) {
      toast.error(`Generation already in progress on ${currentPage === 'image-to-image' ? 'Image-to-Image' : 'Wizard'} page`);
      return;
    }
    
    generateDesign(params, false, PAGE_NAME);
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

  const handleDownload = async (imageUrl, filename = 'jewelry-design.png') => {
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

  const typeSelected = !!params.jewelry_type;
  const canGenerate = params.jewelry_type && params.style && params.material && params.stone && params.theme && (!isGenerating || currentPage === PAGE_NAME);

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
            Jewelry Design Wizard
          </h1>
          <p className="text-gray-600 text-base leading-relaxed max-w-3xl mx-auto animate-in fade-in duration-700">
            Create your perfect piece by selecting styles, materials, and details.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Side - Configuration */}
            <div className="space-y-4 animate-in slide-in-from-left duration-500">
              
              {/* Selection Cards - More Compact */}
              <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-200/50 shadow-lg shadow-blue-100/50 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent uppercase tracking-wider">
                    Design Configuration
                  </h3>
                  <button
                    onClick={handleReset}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200 px-2.5 py-1 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset
                  </button>
                </div>
                
                {/* Grid Layout - 2 columns with smaller cards */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <SelectorCard 
                    title="Type" 
                    value={params.jewelry_type} 
                    onClick={() => setActiveModal('jewelry_type')} 
                    disabled={isGenerating}
                    img={params.jewelry_type ? SELECTION_CONFIG.jewelry_type.options.find(o => o.value === params.jewelry_type)?.img : null}
                    compact={true}
                  />
                  
                  <SelectorCard 
                    title="Style" 
                    value={params.style} 
                    onClick={() => setActiveModal('style')} 
                    disabled={!typeSelected || isGenerating}
                    img={params.style && params.jewelry_type ? getImageSrc('style', {value: params.style}) : null}
                    compact={true}
                  />
                  
                  <SelectorCard 
                    title="Material" 
                    value={params.material} 
                    onClick={() => setActiveModal('material')} 
                    disabled={!typeSelected || isGenerating}
                    img={params.material && params.jewelry_type ? getImageSrc('material', {value: params.material}) : null}
                    compact={true}
                  />
                  
                  <SelectorCard 
                    title="Theme" 
                    value={params.theme} 
                    onClick={() => setActiveModal('theme')} 
                    disabled={!typeSelected || isGenerating}
                    img={params.theme && params.jewelry_type ? getImageSrc('theme', {value: params.theme}) : null}
                    compact={true}
                  />
                </div>

                {/* Stone - Full Width but compact */}
                <SelectorCard 
                  title="Stone" 
                  value={params.stone} 
                  onClick={() => setActiveModal('stone')} 
                  disabled={isGenerating}
                  img={params.stone ? SELECTION_CONFIG.stone.options.find(o => o.value === params.stone)?.img : null}
                  compact={true}
                />
              </div>

              {/* Combined: Size, Finish, and Additional Instructions in one compact box */}
              <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-200/50 shadow-lg shadow-purple-100/50 p-5">
                <h3 className="text-xs font-semibold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent uppercase tracking-wider mb-3">
                  Additional Details
                </h3>
                
                {/* Size and Finish - Side by Side */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Size</label>
                    <select 
                      disabled={isGenerating}
                      className="w-full px-3 py-2 bg-gradient-to-br from-gray-50 to-blue-50/50 border-2 border-gray-200/70 rounded-lg text-sm text-gray-900 focus:border-gray-400 focus:bg-white outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      value={params.size}
                      onChange={e => setParams({...params, size: e.target.value})}
                    >
                      {TEXT_OPTIONS.size.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Finish</label>
                    <select 
                      disabled={isGenerating}
                      className="w-full px-3 py-2 bg-gradient-to-br from-gray-50 to-purple-50/50 border-2 border-gray-200/70 rounded-lg text-sm text-gray-900 focus:border-gray-400 focus:bg-white outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      value={params.finish}
                      onChange={e => setParams({...params, finish: e.target.value})}
                    >
                      {TEXT_OPTIONS.finish.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                
                {/* Additional Instructions - Smaller textarea */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Instructions (Optional)</label>
                  <textarea 
                    disabled={isGenerating}
                    className="w-full px-3 py-2 bg-gradient-to-br from-gray-50 to-indigo-50/30 border-2 border-gray-200/70 rounded-lg text-sm text-gray-900 focus:border-gray-400 focus:bg-white outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    rows="2"
                    placeholder="Add specific details..."
                    value={params.extra_text}
                    onChange={e => setParams({...params, extra_text: e.target.value})}
                  />
                </div>
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
                        A design is being generated on the {currentPage === 'image-to-image' ? 'Image-to-Image' : 'Wizard'} page. Please wait for it to complete.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <button 
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating || !isServerLive}
                className={`w-full py-4 text-white font-semibold rounded-xl text-base transition-all duration-200 transform shadow-lg ${
                  (!canGenerate || isGenerating || !isServerLive) 
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
                    Generating Design...
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Design
                  </span>
                )}
              </button>
            </div>

            {/* Right Side - Result Preview */}
            <div className="animate-in slide-in-from-right duration-500">
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-2xl shadow-blue-900/10 overflow-hidden">
                {isGenerating && currentPage === PAGE_NAME ? (
                  /* Skeleton Loading - Only for this page */
                  <SkeletonLoader message={LOADING_MESSAGES[currentMessageIndex]} />
                ) : latestDesign && currentPage === PAGE_NAME ? (
                  /* Generated Images Grid - Only for this page */
                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Main Generated Image */}
                      <div 
                        onClick={() => handleImageClick(latestDesign)}
                        className="relative group cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200/70 hover:border-blue-400/50 transition-all duration-300"
                      >
                        <div className="relative" style={{ aspectRatio: '1/1' }}>
                          <img 
                            src={getImageUrl(latestDesign.image_url)} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            alt="Generated Design" 
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

                      {/* Quick Action Info */}
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 backdrop-blur-sm rounded-xl border border-blue-100/50 p-4 text-center">
                        <p className="text-sm text-gray-700 font-medium">
                          Click the image above to view full details and download
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Empty State */
                  <div className="flex items-center justify-center p-20" style={{ minHeight: '500px' }}>
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-100/30 border-2 border-blue-100">
                        <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 mb-3">Your design preview appears here</h3>
                      <p className="text-gray-600 text-base">
                        Configure your jewelry options and generate to begin
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selection Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setActiveModal(null)}></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-900">
                {SELECTION_CONFIG[activeModal].title}
              </h3>
              <button 
                onClick={() => setActiveModal(null)} 
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {SELECTION_CONFIG[activeModal].options.map((option) => {
                  const isSelected = params[activeModal] === option.value;
                  const imgSrc = getImageSrc(activeModal, option);
                  
                  return (
                    <div
                      key={option.value}
                      onClick={() => handleSelect(activeModal, option.value)}
                      className={`group cursor-pointer relative rounded-xl overflow-hidden border-2 transition-all duration-200 bg-white shadow-sm ${
                        isSelected 
                          ? 'border-gray-900 shadow-md scale-105' 
                          : 'border-gray-200 hover:border-gray-400 hover:shadow-md hover:scale-105'
                      }`}
                    >
                      {/* Image */}
                      <div className="aspect-square bg-gray-100 relative overflow-hidden">
                        <img 
                          src={imgSrc} 
                          alt={option.label} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/200?text=Image+Not+Found';
                          }}
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-gray-900/20 flex items-center justify-center">
                            <div className="bg-white text-gray-900 p-3 rounded-full shadow-lg">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Label */}
                      <div className={`p-3 text-center font-semibold text-sm transition-colors ${
                        isSelected 
                          ? 'text-gray-900 bg-gray-100' 
                          : 'text-gray-700 group-hover:text-gray-900'
                      }`}>
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

      {/* Image Detail Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setSelectedImage(null)}></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-900">Design Details</h3>
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
                      alt="Design Detail" 
                      onError={(e) => { 
                        e.target.onerror = null; 
                        e.target.src = PLACEHOLDER_IMAGE; 
                      }} 
                    />
                  </div>
                </div>

                {/* Right Side - Details Panel */}
                <div className="space-y-4">
                  {/* AI Prompt Section */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      AI Generated Prompt
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedImage.final_prompt}</p>
                  </div>

                  {/* Design Specifications */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      Design Specifications
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <SpecItem label="Type" value={params.jewelry_type} />
                      <SpecItem label="Style" value={params.style} />
                      <SpecItem label="Material" value={params.material} />
                      <SpecItem label="Theme" value={params.theme} />
                      <SpecItem label="Stone" value={params.stone} />
                      <SpecItem label="Size" value={params.size} />
                      <SpecItem label="Finish" value={params.finish} />
                    </div>
                    {params.extra_text && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Additional Instructions:</p>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-100">{params.extra_text}</p>
                      </div>
                    )}
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownload(getImageUrl(selectedImage.image_url), `jewelry-design-${Date.now()}.png`)}
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
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
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
const SkeletonLoader = ({ message }) => (
  <div className="p-6 space-y-4" style={{ minHeight: '500px' }}>
    {/* Main Skeleton Image */}
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-200" style={{ aspectRatio: '1/1' }}>
      <div className="absolute inset-0 animate-shimmer"></div>
    </div>

    {/* Skeleton Info Card */}
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="h-3 bg-gray-300 rounded animate-shimmer w-1/3"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-300 rounded animate-shimmer"></div>
        <div className="h-3 bg-gray-300 rounded animate-shimmer w-4/5"></div>
      </div>
    </div>
  </div>
);

// Specification Item Component
const SpecItem = ({ label, value }) => (
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{label}</p>
    <p className="text-sm font-semibold text-gray-900">{value || 'N/A'}</p>
  </div>
);

const SelectorCard = ({ title, value, onClick, disabled, img, compact }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-3 rounded-xl text-left transition-all duration-200 w-full ${
      compact ? 'p-3' : 'p-4'
    } ${
      disabled 
        ? 'bg-gray-50/80 opacity-50 cursor-not-allowed border-2 border-gray-200' 
        : value
        ? 'bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-sm border-2 border-blue-200/50 hover:border-blue-300/50 hover:shadow-md shadow-blue-100/30 cursor-pointer'
        : 'bg-white/60 backdrop-blur-sm border-2 border-gray-200/70 hover:border-gray-300 hover:shadow-sm cursor-pointer'
    }`}
  >
    {/* Image Thumbnail */}
    <div className={`rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden flex-shrink-0 border-2 ${
      value ? 'border-blue-200/70' : 'border-gray-200'
    } ${
      compact ? 'w-11 h-11' : 'w-14 h-14'
    }`}>
      {img ? (
        <img src={img} alt={value} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <svg className={compact ? 'w-5 h-5' : 'w-6 h-6'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      )}
    </div>
    
    {/* Text */}
    <div className="flex-1 overflow-hidden">
      <p className={`font-medium uppercase tracking-wide mb-0.5 ${
        value ? 'text-blue-600/70' : 'text-gray-500'
      } ${
        compact ? 'text-[10px]' : 'text-xs'
      }`}>
        {title}
      </p>
      <p className={`font-semibold truncate ${
        compact ? 'text-sm' : 'text-base'
      } ${
        value ? 'text-gray-900' : 'text-gray-400'
      }`}>
        {value || 'Select...'}
      </p>
    </div>
  </button>
);