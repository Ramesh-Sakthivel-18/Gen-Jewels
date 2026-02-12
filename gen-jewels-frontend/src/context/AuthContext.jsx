import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token }); 
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    setUser({ token });
    navigate('/modes'); 
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('dashboard_params');
    localStorage.removeItem('text2img_params');
    localStorage.removeItem('is_generating');
    
    setUser(null);
    // NEW: Redirect to the unified Auth page
    navigate('/auth'); 
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};