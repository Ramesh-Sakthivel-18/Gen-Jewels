import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useServer } from '../context/ServerContext'; // IMPORT SERVER HOOK

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { isServerLive, isChecking } = useServer(); // GET SERVER STATUS
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Ensure redirect happens after logout
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo & Server Status Wrapper */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-bold text-gray-900 tracking-tight">
            Gen Jewels
          </Link>

          {/* SERVER STATUS BADGE */}
          {/* This badge listens to the global ServerContext to show if backend is reachable */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600 shadow-sm transition-all duration-300 hover:shadow-md">
            {isChecking ? (
              <>
                <span className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></span>
                <span>Checking Engine...</span>
              </>
            ) : isServerLive ? (
              <>
                <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse"></span>
                <span className="text-green-700">AI Engine Online</span>
              </>
            ) : (
              <>
                <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></span>
                <span className="text-red-600">AI Engine Offline</span>
              </>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8">
          {user ? (
            <>
              <Link to="/modes" className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-300">Create</Link>
              <Link to="/gallery" className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-300">Gallery</Link>
              <button 
                onClick={handleLogout} 
                className="bg-red-50 text-red-600 px-5 py-2.5 rounded-lg font-medium hover:bg-red-100 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="text-gray-700 hover:text-amber-600 font-medium transition-colors duration-300">Login</Link>
              <Link 
                to="/auth" 
                className="bg-amber-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-amber-700 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}