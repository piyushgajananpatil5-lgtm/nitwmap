import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapPage from './pages/MapPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { LocationItem, LocationFormData } from './types';
import { INITIAL_NITW_LOCATIONS } from './seedData';
import {
  getStoredLocations,
  saveStoredLocations,
  addStoredLocation,
  updateStoredLocation,
  deleteStoredLocation,
} from './data/locationsStore';

type CurrentView = 'map' | 'admin-login' | 'admin-dashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<CurrentView>('map');
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<string>('admin');

  // Load auth state and locations on initial mount
  useEffect(() => {
    const savedToken = localStorage.getItem('nitw_admin_token');
    const savedUser = localStorage.getItem('nitw_admin_user') || 'admin';
    if (savedToken) {
      setAdminToken(savedToken);
      setAdminUser(savedUser);
    }

    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      // 1. Attempt to fetch from backend API
      const res = await axios.get('/api/locations', { timeout: 3000 }).catch(() => null);

      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setLocations(res.data);
        saveStoredLocations(res.data);
      } else {
        // Fallback to local store
        const stored = getStoredLocations();
        setLocations(stored);
      }
    } catch (err) {
      const stored = getStoredLocations();
      setLocations(stored);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLocation = async (formData: LocationFormData) => {
    try {
      // Try backend if token exists
      if (adminToken) {
        await axios
          .post('/api/locations', formData, {
            headers: { Authorization: `Bearer ${adminToken}` },
          })
          .catch(() => null);
      }
    } catch {
      // Ignore API errors and persist locally
    }

    // Persist locally for instant responsiveness
    const newLoc = addStoredLocation(formData);
    setLocations((prev) => [newLoc, ...prev]);
    setSelectedLocation(newLoc);
  };

  const handleUpdateLocation = async (id: string, formData: LocationFormData) => {
    try {
      if (adminToken) {
        await axios
          .put(`/api/locations/${id}`, formData, {
            headers: { Authorization: `Bearer ${adminToken}` },
          })
          .catch(() => null);
      }
    } catch {
      // Ignore API errors and persist locally
    }

    const updated = updateStoredLocation(id, formData);
    if (updated) {
      setLocations((prev) =>
        prev.map((loc) => ((loc._id === id || loc.id === id) ? updated : loc))
      );
      if (selectedLocation && (selectedLocation._id === id || selectedLocation.id === id)) {
        setSelectedLocation(updated);
      }
    }
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      if (adminToken) {
        await axios
          .delete(`/api/locations/${id}`, {
            headers: { Authorization: `Bearer ${adminToken}` },
          })
          .catch(() => null);
      }
    } catch {
      // Ignore API errors and persist locally
    }

    deleteStoredLocation(id);
    setLocations((prev) => prev.filter((loc) => loc._id !== id && loc.id !== id));
    if (selectedLocation && (selectedLocation._id === id || selectedLocation.id === id)) {
      setSelectedLocation(null);
    }
  };

  const handleResetSeedData = () => {
    saveStoredLocations(INITIAL_NITW_LOCATIONS);
    setLocations(INITIAL_NITW_LOCATIONS);
    setSelectedLocation(null);
  };

  const handleLoginSuccess = (token: string, username: string) => {
    setAdminToken(token);
    setAdminUser(username);
    setCurrentView('admin-dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('nitw_admin_token');
    localStorage.removeItem('nitw_admin_user');
    setAdminToken(null);
    setCurrentView('map');
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex flex-col">
      {currentView === 'map' && (
        <MapPage
          locations={locations}
          selectedLocation={selectedLocation}
          onSelectLocation={setSelectedLocation}
          onNavigateToAdmin={() => {
            if (adminToken) {
              setCurrentView('admin-dashboard');
            } else {
              setCurrentView('admin-login');
            }
          }}
          isLoading={isLoading}
        />
      )}

      {currentView === 'admin-login' && (
        <AdminLogin
          onLoginSuccess={handleLoginSuccess}
          onBackToMap={() => setCurrentView('map')}
        />
      )}

      {currentView === 'admin-dashboard' && (
        <ProtectedRoute
          isAuthenticated={Boolean(adminToken)}
          onRedirectToLogin={() => setCurrentView('admin-login')}
        >
          <AdminDashboard
            locations={locations}
            adminUser={adminUser}
            onAddLocation={handleAddLocation}
            onUpdateLocation={handleUpdateLocation}
            onDeleteLocation={handleDeleteLocation}
            onResetSeedData={handleResetSeedData}
            onLogout={handleLogout}
            onNavigateToMap={() => setCurrentView('map')}
          />
        </ProtectedRoute>
      )}
    </div>
  );
}
