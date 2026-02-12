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
          headers: {
             // ADDED: Critical header for Ngrok free tier
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
        // Network error, Timeout, or 404 -> Server is Offline
        setIsServerLive(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Initial check immediately when the website loads
    checkServerStatus();

    // RAPID 1-MINUTE POLLING
    // 60000 milliseconds = Exactly 1 Minute
    const intervalId = setInterval(checkServerStatus, 60000);

    // Cleanup interval if the user closes the app
    return () => clearInterval(intervalId);
  }, [API_BASE_URL]);

  return (
    <ServerContext.Provider value={{ isServerLive, isChecking }}>
      {children}
    </ServerContext.Provider>
  );
};

export const useServer = () => useContext(ServerContext);