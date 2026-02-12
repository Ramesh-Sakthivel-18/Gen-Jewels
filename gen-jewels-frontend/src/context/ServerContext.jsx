import { createContext, useState, useEffect, useContext } from 'react';

export const ServerContext = createContext();

export const ServerProvider = ({ children }) => {
  const [isServerLive, setIsServerLive] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Use the Netlify environment variable
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          headers: {
            // THE NGROK FIX: This header bypasses the warning page for the whole session
            'ngrok-skip-browser-warning': 'true'
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          setIsServerLive(true);
        } else {
          setIsServerLive(false);
        }
      } catch (error) {
        setIsServerLive(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Initial check on load
    checkServerStatus();
    
    // Check again every 60 seconds
    const intervalId = setInterval(checkServerStatus, 60000);
    
    return () => clearInterval(intervalId);
  }, [API_BASE_URL]);

  return (
    <ServerContext.Provider value={{ isServerLive, isChecking }}>
      {children}
    </ServerContext.Provider>
  );
};

export const useServer = () => useContext(ServerContext);