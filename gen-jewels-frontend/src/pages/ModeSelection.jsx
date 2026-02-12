import { Link } from 'react-router-dom';
import { useServer } from '../context/ServerContext';
import { useState, useEffect } from 'react';

export default function ModeSelection() {
  const { isServerLive, isChecking } = useServer();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const modes = [
    {
      id: 'wizard',
      title: 'Jewelry Wizard',
      desc: 'Step-by-step visual builder with precision controls for detailed jewelry design.',
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      path: '/dashboard',
      gradient: 'from-violet-600 to-indigo-600',
      active: true
    },
    {
      id: 'text',
      title: 'Text to Image',
      desc: 'Natural language processing transforms descriptions into photorealistic renders.',
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      path: '/text-to-image',
      gradient: 'from-rose-600 to-pink-600',
      active: true
    },
    {
      id: 'image',
      title: 'Image to Image',
      desc: 'Upload sketches or references for intelligent enhancement and refinement.',
      icon: (
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      path: '/image-to-image',
      gradient: 'from-emerald-600 to-teal-600',
      active: true
    }
  ];

  return (
    <div className="relative min-h-screen bg-white overflow-hidden flex items-center justify-center">
      
      {/* OFFLINE MODAL OVERLAY */}
      {!isServerLive && !isChecking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-white/80">
          <div 
            className="relative bg-white rounded-3xl border border-neutral-200 p-10 max-w-md transform transition-all duration-500 ease-out shadow-[0_20px_70px_-15px_rgba(0,0,0,0.2)]"
            style={{
              animation: 'slideUp 0.5s ease-out, fadeIn 0.5s ease-out'
            }}
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-50 to-orange-50 blur-2xl opacity-50 -z-10" />
            
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
                  Studio Offline
                </h2>
                <p className="text-sm text-neutral-600 leading-relaxed max-w-sm">
                  The AI generative engine is currently unavailable. Creation modes cannot be accessed until the connection is restored.
                </p>
              </div>

              <button 
                onClick={() => window.location.reload()} 
                className="group relative px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl transition-all duration-300 overflow-hidden font-medium text-sm"
              >
                <span className="relative z-10">Check Connection</span>
                <div className="absolute inset-0 bg-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DECORATIVE BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-amber-100/40 to-orange-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-violet-100/40 to-indigo-100/40 rounded-full blur-3xl" />
      </div>

      {/* MAIN CONTENT */}
      <div 
        className={`relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 transition-all duration-700 ${
          !isServerLive && !isChecking ? 'blur-sm opacity-50 pointer-events-none' : ''
        }`}
      >
        
        {/* HEADER */}
        <div 
          className={`text-center mb-12 sm:mb-16 lg:mb-20 transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          {/* Logo */}
          <div className="flex items-center justify-center space-x-2 mb-6 sm:mb-8">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-black">Gen Jewels</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold tracking-tight text-black mb-4">
            Choose Your Creation Mode
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 max-w-xl sm:max-w-2xl mx-auto font-light">
            Select the workflow that best suits your design process
          </p>
        </div>

        {/* MODES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {modes.map((mode, index) => (
            <Link 
              key={mode.id}
              to={mode.active ? mode.path : '#'}
              className={`group relative transform transition-all duration-500 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className={`relative h-full p-6 sm:p-8 lg:p-10 rounded-2xl border bg-white transition-all duration-500
                ${mode.active 
                  ? 'border-neutral-200 hover:border-neutral-300 hover:shadow-[0_20px_70px_-15px_rgba(0,0,0,0.15)] cursor-pointer' 
                  : 'border-neutral-200 opacity-60 cursor-not-allowed'}
              `}>
                
                {/* Gradient Background on Hover */}
                {mode.active && (
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${mode.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
                )}

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  
                  {/* Icon */}
                  <div className={`mb-6 sm:mb-8 text-neutral-700 transform transition-all duration-500 ${
                    mode.active ? 'group-hover:scale-110 group-hover:text-neutral-900' : ''
                  }`}>
                    {mode.icon}
                  </div>

                  {/* Title & Description */}
                  <div className="flex-grow mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl font-semibold text-black mb-3 tracking-tight">
                      {mode.title}
                    </h3>
                    <p className="text-neutral-600 leading-relaxed font-light text-sm sm:text-base">
                      {mode.desc}
                    </p>
                  </div>

                  {/* CTA Button */}
                  {mode.active ? (
                    <div className="flex items-center justify-between px-4 sm:px-5 py-2 sm:py-3 rounded-xl bg-neutral-100 group-hover:bg-neutral-900 transition-all duration-300">
                      <span className="text-xs sm:text-sm font-medium text-neutral-900 group-hover:text-white transition-colors">
                        Launch Studio
                      </span>
                      <svg 
                        className="w-4 h-4 text-neutral-500 group-hover:text-white transition-all duration-300 group-hover:translate-x-1" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  ) : (
                    <div className="px-4 sm:px-5 py-2 rounded-xl bg-neutral-100 text-center">
                      <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Under Development
                      </span>
                    </div>
                  )}
                </div>

                
              </div>
            </Link>
          ))}
        </div>

        {/* FOOTER NOTE */}
        <div 
          className={`text-center mt-12 sm:mt-16 transform transition-all duration-1000 delay-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <p className="text-sm text-neutral-500 font-light">
            Need assistance? Contact our support team for guidance on selecting the right mode.
          </p>
        </div>

      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}