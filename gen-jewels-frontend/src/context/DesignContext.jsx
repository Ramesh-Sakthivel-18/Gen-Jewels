import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from './AuthContext';
import api from '../services/api'; // Keep for standard calls like history
import axios from 'axios'; // Import axios for the specific generation call
import toast from 'react-hot-toast';

export const DesignContext = createContext();

export const DesignProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [isGenerating, setIsGenerating] = useState(false);
  const [latestDesign, setLatestDesign] = useState(null);
  const [history, setHistory] = useState([]);

  // Use refs to track intervals so we can clear them easily
  const pollingInterval = useRef(null);

  // --- 1. FETCH HISTORY ---
  // Path: /generate/history
  const fetchHistory = async () => {
    if (!user) return;

    try {
      const response = await api.get('/generate/history', {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'bypass-tunnel-reminder': 'true'
        }
      });
      setHistory(response.data);
    } catch (error) {
      console.error("Could not fetch history", error);
    }
  };

  // --- 2. GENERATE DESIGN (The Final Solution) ---
  // Paths: /generate/ (Standard) OR /generate/image-to-image (Img2Img)
  const generateDesign = async (params, isImageToImage = false) => {
    if (!user) {
      toast.error("Please login to generate.");
      return;
    }

    setIsGenerating(true);
    setLatestDesign(null);
    localStorage.setItem('is_generating', 'true');
    
    const toastId = toast.loading('AI is crafting your jewelry... (Safe to Refresh)', {
      duration: 5000, 
    });

    try {
      // 1. Determine the verified endpoint path
      const endpoint = isImageToImage ? '/generate/image-to-image' : '/generate/';
      
      // 2. Get the dynamic tunnel URL
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      // 3. Prepare Headers (Auth + Tunnel Bypass)
      // Note: We do NOT set 'Content-Type' manually if it's FormData; axios handles it.
      const token = localStorage.getItem('token');
      const headers = {
        'ngrok-skip-browser-warning': 'true',
        'bypass-tunnel-reminder': 'true',
        'Authorization': token ? `Bearer ${token}` : ''
      };

      // 4. Make the Request
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, params, {
        headers: headers
      });

      // 5. Success! Update UI
      completeGeneration(response.data, toastId);

    } catch (error) {
      console.error("Generation Error:", error);
      
      const status = error.response?.status;
      if (status === 404) {
        toast.error('Endpoint not found (404). Checking paths...');
      } else if (error.code !== "ERR_NETWORK" && error.code !== "ECONNABORTED") {
         toast.error('Generation Failed.');
      }

      setIsGenerating(false);
      localStorage.removeItem('is_generating');
      toast.dismiss(toastId);
    }
  };

  // --- 3. RECOVERY LOGIC (Survives Refresh) ---
  const checkForPendingGeneration = async () => {
    if (!user) return;

    const isPending = localStorage.getItem('is_generating') === 'true';
    
    if (isPending) {
      console.log("🔄 Detected pending generation. Attempting recovery...");
      setIsGenerating(true);
      const toastId = toast.loading('Resuming checks for your design...');
      
      if (pollingInterval.current) clearInterval(pollingInterval.current);

      // Polling: Check History every 3 seconds
      pollingInterval.current = setInterval(async () => {
        try {
          if (!user) {
             clearInterval(pollingInterval.current);
             return;
          }

          // Use verified history path
          const res = await api.get('/generate/history', {
            headers: {
              'ngrok-skip-browser-warning': 'true',
              'bypass-tunnel-reminder': 'true'
            }
          });
          const latest = res.data[0];

          if (latest) {
             const createdTime = new Date(latest.created_at).getTime();
             const now = Date.now();
             const timeDiff = (now - createdTime) / 1000; 

             // If the newest design in history was created in the last 2 minutes, it's our result
             if (timeDiff < 120) { 
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
          console.error("Polling error", err);
        }
      }, 3000); 

      // Timeout Safety: Stop checking after 90 seconds
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

  // --- 4. WATCH FOR USER LOGIN/LOGOUT ---
  useEffect(() => {
    if (user) {
      fetchHistory();
      checkForPendingGeneration();
    } else {
      setHistory([]);
      setLatestDesign(null);
      setIsGenerating(false);
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    }
  }, [user]);

  // Helper to finalize state after success
  const completeGeneration = (design, toastId) => {
    setLatestDesign(design);
    setHistory((prev) => {
       const exists = prev.find(i => i.id === design.id);
       return exists ? prev : [design, ...prev];
    });
    setIsGenerating(false);
    localStorage.removeItem('is_generating');
    if (toastId) toast.dismiss(toastId);
    toast.success('Design Ready!');
  };

  return (
    <DesignContext.Provider value={{ 
      isGenerating, 
      latestDesign, 
      generateDesign, 
      history, 
      fetchHistory 
    }}>
      {children}
    </DesignContext.Provider>
  );
};

export const useDesign = () => useContext(DesignContext);