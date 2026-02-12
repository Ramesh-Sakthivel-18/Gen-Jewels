import { createContext, useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from './AuthContext'; // Import AuthContext
import api from '../services/api';
import toast from 'react-hot-toast';

export const DesignContext = createContext();

export const DesignProvider = ({ children }) => {
  const { user } = useContext(AuthContext); // Access User status
  const [isGenerating, setIsGenerating] = useState(false);
  const [latestDesign, setLatestDesign] = useState(null);
  const [history, setHistory] = useState([]);

  // Use refs to track intervals so we can clear them easily
  const pollingInterval = useRef(null);

  // 1. FETCH HISTORY (Only if User is Logged In)
  const fetchHistory = async () => {
    if (!user) return; // STOP: Don't fetch if logged out

    try {
      const response = await api.get('/generate/history');
      setHistory(response.data);
    } catch (error) {
      console.error("Could not fetch history", error);
    }
  };

  // 2. RECOVERY LOGIC (Survives Refresh)
  const checkForPendingGeneration = async () => {
    if (!user) return; // STOP: Don't recover if logged out

    const isPending = localStorage.getItem('is_generating') === 'true';
    
    if (isPending) {
      console.log("🔄 Detected pending generation. Attempting recovery...");
      setIsGenerating(true);
      const toastId = toast.loading('Resuming checks for your design...');
      
      // Clear any existing interval first
      if (pollingInterval.current) clearInterval(pollingInterval.current);

      // Start Polling: Check History every 3 seconds
      pollingInterval.current = setInterval(async () => {
        try {
          if (!user) { // Safety check inside interval
             clearInterval(pollingInterval.current);
             return;
          }

          const res = await api.get('/generate/history');
          const latest = res.data[0];

          if (latest) {
             const createdTime = new Date(latest.created_at).getTime();
             const now = Date.now();
             const timeDiff = (now - createdTime) / 1000; 

             if (timeDiff < 120) { 
               clearInterval(pollingInterval.current);
               completeGeneration(latest, toastId);
             }
          }
        } catch (err) {
          // If we get a 401 inside the interval, stop immediately
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
      // User just logged in (or app loaded with token) -> Fetch Data
      fetchHistory();
      checkForPendingGeneration();
    } else {
      // User logged out -> Clear Data & Stop Polling
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

  const generateDesign = async (params) => {
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
      const response = await api.post('/generate/', params);
      completeGeneration(response.data, toastId);
    } catch (error) {
      console.error(error);
      if (error.code !== "ERR_NETWORK" && error.code !== "ECONNABORTED") {
         setIsGenerating(false);
         localStorage.removeItem('is_generating');
         toast.dismiss(toastId);
         toast.error('Generation Failed.');
      }
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