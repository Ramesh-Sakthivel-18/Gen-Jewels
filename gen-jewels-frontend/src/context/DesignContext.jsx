import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from './AuthContext';
import api from '../services/api'; 
import axios from 'axios'; 
import toast from 'react-hot-toast';

export const DesignContext = createContext();

export const DesignProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  // --- STATE INITIALIZATION ---
  const [isGenerating, setIsGenerating] = useState(() => {
    return localStorage.getItem('is_generating') === 'true';
  });
  
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('generating_page');
  });

  const [latestDesign, setLatestDesign] = useState(null);
  const [history, setHistory] = useState([]);
  
  const pollingInterval = useRef(null);

  // --- 1. FETCH HISTORY ---
  const fetchHistory = async () => {
    if (!user) return;
    try {
      const response = await api.get('/generate/history', {
        headers: { 'ngrok-skip-browser-warning': 'true', 'bypass-tunnel-reminder': 'true' }
      });
      setHistory(response.data);
    } catch (error) {
      console.error("Could not fetch history", error);
    }
  };

  // --- 2. PAGE REGISTRATION (Crucial for ImageToImage) ---
  const registerPage = (pageName) => {
    // If generating on a DIFFERENT page, return false to indicate locked
    if (isGenerating && currentPage && currentPage !== pageName) {
      return false; 
    }
    return true; 
  };

  const unregisterPage = (pageName) => {
    // Optional cleanup logic
  };

  // --- 3. RESET DESIGN ---
  const resetDesign = (requestingPage) => {
    if (isGenerating) {
      console.log("🛡️ Session Protected: Generation in progress, reset blocked.");
      return; 
    }
    setLatestDesign(null);
    setIsGenerating(false);
    setCurrentPage(null);
    localStorage.removeItem('is_generating');
    localStorage.removeItem('generating_page');
  };

  // --- 4. GENERATE DESIGN ---
  const generateDesign = async (params, isImageToImage = false, pageName = 'dashboard') => {
    if (!user) {
      toast.error("Please login to generate.");
      return;
    }

    setIsGenerating(true);
    setLatestDesign(null);
    setCurrentPage(pageName);
    localStorage.setItem('is_generating', 'true');
    localStorage.setItem('generating_page', pageName);
    
    const toastId = toast.loading('AI is crafting your jewelry... (Safe to Refresh)', {
      duration: 5000, 
    });

    try {
      const endpoint = isImageToImage ? '/generate/image-to-image' : '/generate/';
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('token');
      
      const headers = {
        'ngrok-skip-browser-warning': 'true',
        'bypass-tunnel-reminder': 'true',
        'Authorization': token ? `Bearer ${token}` : ''
      };

      const response = await axios.post(`${API_BASE_URL}${endpoint}`, params, {
        headers: headers
      });

      completeGeneration(response.data, toastId);

    } catch (error) {
      console.error("Generation Error:", error);
      const status = error.response?.status;
      if (status === 404) {
        toast.error('Endpoint Not Found (404)');
      } else if (error.code !== "ERR_NETWORK" && error.code !== "ECONNABORTED") {
         toast.error('Generation Failed.');
      }
      
      setIsGenerating(false);
      setCurrentPage(null);
      localStorage.removeItem('is_generating');
      localStorage.removeItem('generating_page');
      toast.dismiss(toastId);
    }
  };

  // --- 5. RECOVERY LOGIC ---
  const checkForPendingGeneration = async () => {
    if (!user) return;
    
    const isPending = localStorage.getItem('is_generating') === 'true';
    
    if (isPending) {
      console.log(`🔄 Resuming session...`);
      setIsGenerating(true);
      
      const toastId = toast.loading('Resuming checks for your design...');
      
      if (pollingInterval.current) clearInterval(pollingInterval.current);

      pollingInterval.current = setInterval(async () => {
        try {
          if (!user) {
             clearInterval(pollingInterval.current);
             return;
          }
          const res = await api.get('/generate/history', {
            headers: { 'ngrok-skip-browser-warning': 'true', 'bypass-tunnel-reminder': 'true' }
          });
          const latest = res.data[0];
          
          if (latest) {
             const createdTime = new Date(latest.created_at).getTime();
             const now = Date.now();
             const diff = Math.abs(now - createdTime) / 1000;

             if (diff < 3600) { 
               clearInterval(pollingInterval.current);
               completeGeneration(latest, toastId);
             }
          }
        } catch (err) {
          if (err.response && err.response.status === 401) {
            clearInterval(pollingInterval.current);
            setIsGenerating(false);
            localStorage.removeItem('is_generating');
          }
        }
      }, 3000); 

      setTimeout(() => {
        if (pollingInterval.current) clearInterval(pollingInterval.current);
        if (localStorage.getItem('is_generating') === 'true') {
           setIsGenerating(false);
           localStorage.removeItem('is_generating');
           toast.dismiss(toastId);
        }
      }, 90000); 
    }
  };

  useEffect(() => {
    const hasToken = localStorage.getItem('token');
    if (user) {
      fetchHistory();
      checkForPendingGeneration();
    } else if (!hasToken) {
      setHistory([]);
      setLatestDesign(null);
      setIsGenerating(false);
      setCurrentPage(null);
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    }
  }, [user]);

  const completeGeneration = (design, toastId) => {
    setLatestDesign(design);
    setHistory((prev) => {
       const exists = prev.find(i => i.id === design.id);
       return exists ? prev : [design, ...prev];
    });
    setIsGenerating(false);
    localStorage.removeItem('is_generating');
    localStorage.removeItem('generating_page');
    if (toastId) toast.dismiss(toastId);
    toast.success('Design Ready!');
  };

  return (
    <DesignContext.Provider value={{ 
      isGenerating, 
      currentPage, 
      latestDesign, 
      generateDesign, 
      resetDesign, // EXPORTED NOW
      registerPage, // EXPORTED NOW
      unregisterPage, // EXPORTED NOW
      history, 
      fetchHistory 
    }}>
      {children}
    </DesignContext.Provider>
  );
};

export const useDesign = () => useContext(DesignContext);