import { useEffect, useState } from 'react';
import { useDesign } from '../context/DesignContext';
import { useServer } from '../context/ServerContext'; 

export default function Gallery() {
  const { history, fetchHistory } = useDesign();
  const { isServerLive, isChecking } = useServer(); 
  const [selectedDesign, setSelectedDesign] = useState(null);

  // Dynamic Base URL from environment variables
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (isServerLive) {
      fetchHistory();
    }
  }, [isServerLive, fetchHistory]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // --- FIX: WINDOWS PATH & URL HANDLING ---
  const getImageUrl = (path) => {
    if (!path) return "";
    
    // 1. Replace Windows backslashes (\) with forward slashes (/)
    const cleanPath = path.replace(/\\/g, '/');

    // 2. Safely construct URL
    const baseUrl = API_BASE_URL.replace(/\/$/, ''); 
    const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

    return `${baseUrl}${finalPath}`;
  };

  // --- LOCAL PLACEHOLDER (To avoid network blocking) ---
  const PLACEHOLDER_IMAGE = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22400%22%20viewBox%3D%220%200%20400%20400%22%3E%3Crect%20fill%3D%22%23f3f4f6%22%20width%3D%22400%22%20height%3D%22400%22%2F%3E%3Ctext%20fill%3D%22%239ca3af%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20dy%3D%2210.5%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%3EImage%20Not%20Found%3C%2Ftext%3E%3C%2Fsvg%3E";

  return (
    <div className="max-w-7xl mx-auto min-h-screen relative p-4">
      
      {/* OFFLINE MODAL OVERLAY */}
      {!isServerLive && !isChecking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/30 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12 max-w-lg text-center transform scale-100 animate-scale-up">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">🔌</div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Database Offline</h2>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">The backend server is offline. Please check back later!</p>
            <button onClick={() => window.location.reload()} className="bg-gray-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-gray-800 transition-colors shadow-lg">Retry Connection</button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT (Blurs if offline) */}
      <div className={`transition-all duration-700 ${!isServerLive && !isChecking ? 'blur-lg pointer-events-none select-none grayscale-[0.3]' : ''}`}>
        
        <div className="flex justify-between items-end mb-8 border-b pb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">My Design Collection</h2>
            <p className="text-gray-500 mt-1">Your personal catalog of AI-generated jewelry.</p>
          </div>
          <span className="bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded-full text-sm">{history.length} Items</span>
        </div>
        
        {history.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-6xl mb-4">💎</p><p className="text-xl text-gray-500 font-medium">No designs found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {history.map((design, index) => (
              <div key={index} onClick={() => setSelectedDesign(design)} className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer transform hover:-translate-y-1">
                <div className="relative h-64 bg-gray-50 overflow-hidden">
                  <img 
                    src={getImageUrl(design.image_path) || PLACEHOLDER_IMAGE}
                    alt={design.jewelry_type} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                     <span className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur text-gray-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg transition">View Details</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-gray-800">{design.jewelry_type}</h3>
                    <span className="text-xs text-gray-400">{formatDate(design.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{design.final_prompt}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DETAILS MODAL */}
        {selectedDesign && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setSelectedDesign(null)}>
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <div className="md:w-1/2 bg-gray-900 flex items-center justify-center p-6 relative">
                 <img 
                   src={getImageUrl(selectedDesign.image_path) || PLACEHOLDER_IMAGE}
                   alt="Full Design" 
                   className="max-h-full max-w-full object-contain shadow-2xl rounded-lg"
                   onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; }}
                 />
                 <a href={getImageUrl(selectedDesign.image_path)} download target="_blank" rel="noreferrer" className="absolute bottom-6 right-6 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md transition">⬇️</a>
              </div>
              <div className="md:w-1/2 p-8 overflow-y-auto bg-white relative">
                <button onClick={() => setSelectedDesign(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-800 transition bg-gray-100 rounded-full">✕</button>
                <div className="mb-6">
                  <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{selectedDesign.jewelry_type}</span>
                  <h2 className="text-3xl font-bold text-gray-900 mt-3 mb-1">{selectedDesign.style} {selectedDesign.jewelry_type}</h2>
                  <p className="text-gray-400 text-sm">Created on {formatDate(selectedDesign.created_at)}</p>
                </div>
                <div className="mb-8">
                  <h4 className="text-xs font-bold text-pink-500 uppercase mb-2">✨ AI Interpretation</h4>
                  <div className="bg-pink-50 p-4 rounded-lg border border-pink-100 text-gray-700 text-sm leading-relaxed max-h-48 overflow-y-auto">"{selectedDesign.final_prompt}"</div>
                </div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 border-b pb-2">Specifications</h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                  <div><p className="text-gray-400 text-xs mb-1">Material</p><p className="font-semibold text-gray-800">{selectedDesign.material || 'N/A'}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">Gemstone</p><p className="font-semibold text-gray-800">{selectedDesign.stone || 'None'}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">Theme</p><p className="font-semibold text-gray-800">{selectedDesign.theme || 'Standard'}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">Size</p><p className="font-semibold text-gray-800">{selectedDesign.size || 'Standard'}</p></div>
                  <div><p className="text-gray-400 text-xs mb-1">Finish</p><p className="font-semibold text-gray-800">{selectedDesign.finish || 'Polished'}</p></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}