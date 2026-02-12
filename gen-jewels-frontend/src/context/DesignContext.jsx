import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from './AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export const DesignContext = createContext();

export const DesignProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [isGenerating, setIsGenerating] = useState(false);
  const [latestDesign, setLatestDesign] = useState(null);
  const [history, setHistory] = useState([]);

  // Use refs to track intervals so we can clear them easily
  const pollingInterval = useRef(null);

  // 1. FETCH HISTORY (Using verified path: /generate/history)
  const fetchHistory = async () => {
    if (!user) return;

    try {
      const response = await api.get('/generate/history', {
        headers: {
          'ngrok-skip-browser-warning': '69420',
          'bypass-tunnel-reminder': 'true'
        }
      });
      setHistory(response.data);
    } catch (error) {
      console.error("Could not fetch history", error);
    }
  };

  // 2. RECOVERY LOGIC (Survives Refresh)
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
              'ngrok-skip-browser-warning': '69420',
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

  // 3. WATCH FOR USER LOGIN/LOGOUT
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

  // 4. GENERATE DESIGN (Updated with verified endpoints)
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
      // Determine endpoint based on verified backend routes
      // Standard: /generate/ | Image-to-Image: /generate/image-to-image
      const endpoint = isImageToImage ? '/generate/image-to-image' : '/generate/';
      
      const response = await api.post(endpoint, params, {
        headers: {
          'ngrok-skip-browser-warning': '69420',
          'bypass-tunnel-reminder': 'true'
        }
      });
      
      completeGeneration(response.data, toastId);
    } catch (error) {
      console.error(error);
      const status = error.response?.status;
      
      if (status === 404) {
        toast.error('Endpoint not found (404). Please verify backend routes.');
      } else if (error.code !== "ERR_NETWORK" && error.code !== "ECONNABORTED") {
         toast.error('Generation Failed.');
      }

      setIsGenerating(false);
      localStorage.removeItem('is_generating');
      toast.dismiss(toastId);
    }
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