import { Link } from 'react-router-dom';
import { useServer } from '../context/ServerContext';
import { useState, useEffect } from 'react';

export default function Landing() {
  const { isServerLive, isChecking } = useServer();
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* OFFLINE MODAL OVERLAY */}
      {!isServerLive && !isChecking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/40">
          <div 
            className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl p-10 max-w-md w-full transform transition-all duration-500"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-gray-900">Service Offline</h2>
                <p className="text-gray-600 leading-relaxed max-w-sm">
                  Our AI rendering engine is temporarily unavailable. Please try again shortly.
                </p>
              </div>

              <button 
                onClick={() => window.location.reload()} 
                className="px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-300"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div 
        className={`transition-all duration-700 ${
          !isServerLive && !isChecking ? 'blur-sm opacity-60 pointer-events-none' : ''
        }`}
      >
        {/* NAVIGATION */}
        <nav className="fixed top-0 left-0 right-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold tracking-tight text-gray-900">Gen Jewels</span>
              </div>

              <div className="flex items-center space-x-6">
                <Link 
                  to="/auth" 
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth"
                  className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* HERO SECTION */}
        <section className="relative pt-32 pb-32 px-6 lg:px-8">
          {/* Subtle animated background shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div 
              className="absolute top-20 left-10 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl"
              style={{ transform: `translateY(${scrollY * 0.15}px)` }}
            />
            <div 
              className="absolute bottom-20 right-10 w-96 h-96 bg-amber-50/40 rounded-full blur-3xl"
              style={{ transform: `translateY(${scrollY * -0.1}px)` }}
            />
          </div>

          <div className="relative max-w-6xl mx-auto text-center">
            {/* Badge */}
            <div 
              className={`inline-flex items-center px-5 py-2 rounded-full border border-amber-200 bg-amber-50/60 mb-10 transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            >
              <span className="relative flex h-2.5 w-2.5 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span className="text-sm font-medium text-amber-800">
                Image-to-Image AI Transformation • Live
              </span>
            </div>

            {/* Headline */}
            <div 
              className={`space-y-5 mb-12 transition-all duration-1000 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight">
                <span className="block text-gray-900">Design</span>
                <span className="block text-amber-700">with Precision</span>
                <span className="block text-gray-900">AI Jewelry Studio</span>
              </h1>

              <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-600 font-light leading-relaxed">
                Transform ideas into photorealistic jewelry renders — fast, accurate, professional.
              </p>
            </div>

            {/* CTA */}
            <div 
              className={`flex flex-col sm:flex-row items-center justify-center gap-5 transition-all duration-1000 delay-400 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <Link
                to="/auth"
                className="group relative px-10 py-5 bg-amber-600 text-white font-semibold rounded-xl text-lg shadow-md hover:shadow-xl hover:bg-amber-700 transition-all duration-300 transform hover:-translate-y-1"
              >
                Launch Studio
              </Link>

              <Link
                to="/auth"
                className="px-10 py-5 border-2 border-gray-300 hover:border-gray-400 rounded-xl text-gray-700 font-medium text-lg hover:bg-gray-50 transition-all duration-300"
              >
                Explore Gallery
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="relative py-32 px-6 lg:px-8 bg-gray-50/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <p className="text-amber-600 font-semibold tracking-wider uppercase text-sm mb-4">
                Professional Tools
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Built for Jewelry Designers & Brands
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
                Advanced AI rendering with intuitive creative control — no CAD experience required.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                  title: "Zero Learning Curve",
                  desc: "Choose style, metal, gemstones — AI generates studio-quality renders instantly."
                },
                {
                  icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
                  title: "Visual Style Selector",
                  desc: "Browse rings, necklaces, earrings, bangles — mix Antique, Modern, Minimal, Royal aesthetics."
                },
                {
                  icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
                  title: "Text to Jewelry",
                  desc: "Describe in natural language: “18K rose gold vintage locket with sapphire and diamond halo”"
                },
                {
                  icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
                  title: "Image-to-Image Refinement",
                  desc: "Upload sketch, photo, or reference → AI delivers polished, market-ready jewelry design."
                },
                {
                  icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
                  title: "Private Design Vault",
                  desc: "Save, organize, compare, export high-resolution renders — all in your secure gallery."
                },
              ].map((feature, i) => (
                <div 
                  key={i}
                  className="group relative p-8 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center mb-6 group-hover:bg-amber-100 transition-colors">
                    <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={feature.icon} />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="relative border-t border-gray-100 py-12 px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
              <div className="flex items-center space-x-3">
                <span className="text-xl font-bold tracking-tight text-gray-900">Gen Jewels</span>
              </div>

              <div className="text-sm text-gray-500">
                © {new Date().getFullYear()} Gen Jewels. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}