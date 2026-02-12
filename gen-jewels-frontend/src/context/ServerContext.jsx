import { createContext, useState, useEffect, useContext } from 'react';

export const ServerContext = createContext();

export const ServerProvider = ({ children }) => {
  const [isServerLive, setIsServerLive] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Use the same logic as api.js to find the URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        // 5-second timeout to prevent hanging if Ngrok is paused
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          setIsServerLive(true);
        } else {
          setIsServerLive(false);
        }
      } catch (error) {
        // Network error, Timeout, or 404 -> Server is Offline
        setIsServerLive(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Initial check
    checkServerStatus();

    // Poll every 30 seconds
    const intervalId = setInterval(checkServerStatus, 30000);

    return () => clearInterval(intervalId);
  }, [API_BASE_URL]);

  return (
    <ServerContext.Provider value={{ isServerLive, isChecking }}>
      {children}
    </ServerContext.Provider>
  );
};

export const useServer = () => useContext(ServerContext);