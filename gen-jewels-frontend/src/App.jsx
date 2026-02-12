import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts
import { ServerProvider } from './context/ServerContext'; // NEW IMPORT
import { AuthProvider } from './context/AuthContext';
import { DesignProvider } from './context/DesignContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage'; 
import Dashboard from './pages/Dashboard';
import Gallery from './pages/Gallery';
import ModeSelection from './pages/ModeSelection';
import TextToImage from './pages/TextToImage';
import ImageToImage from './pages/ImageToImage';

const AppLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <main className="container mx-auto p-4 md:p-6">{children}</main>
  </div>
);

function App() {
  return (
    <ServerProvider>  {/* WRAP APP IN SERVER PROVIDER */}
      <AuthProvider>
        <DesignProvider>
          <Toaster position="bottom-right" />
          
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage />} /> 

            <Route element={<ProtectedRoute />}>
              <Route path="/modes" element={<AppLayout><ModeSelection /></AppLayout>} />
              <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
              <Route path="/text-to-image" element={<AppLayout><TextToImage /></AppLayout>} />
              <Route path="/image-to-image" element={<AppLayout><ImageToImage /></AppLayout>} />
              <Route path="/gallery" element={<AppLayout><Gallery /></AppLayout>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
        </DesignProvider>
      </AuthProvider>
    </ServerProvider>
  );
}

export default App;