import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, MapPin, Menu, X, RefreshCw, Layers } from 'lucide-react';
import MapView from '../components/MapView';
import LocationList from '../components/LocationList';
import api from '../api/axios';

const MapPage = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fetch locations from backend API
  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get('/locations');
      if (res.data && res.data.data) {
        setLocations(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching campus locations:', err);
      setError('Could not connect to the campus server. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    // On mobile, close sidebar automatically when a location is picked
    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100">
      {/* Top Navigation Bar */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-6 flex items-center justify-between z-20 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            title="Toggle directory"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base md:text-lg text-slate-900 tracking-tight leading-none">
                NITW Campus Navigator
              </h1>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                National Institute of Technology, Warangal
              </p>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-100/80 border border-slate-200/60 rounded-full text-xs font-semibold text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>{locations.length} Locations</span>
          </div>

          <button
            onClick={fetchLocations}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all"
            title="Refresh Locations"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/admin/dashboard"
            id="nav-admin-link"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </header>

      {/* Main Map + Directory View */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Directory Sidebar (Desktop & Mobile Drawer) */}
        <div
          className={`absolute md:static top-0 left-0 bottom-0 z-10 w-full sm:w-80 md:w-96 transition-transform duration-300 ease-in-out md:translate-x-0 ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <LocationList
            locations={locations}
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
            isLoading={isLoading}
          />
        </div>

        {/* Backdrop for mobile sidebar */}
        {isMobileSidebarOpen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-5"
          ></div>
        )}

        {/* Right Map Canvas */}
        <div className="flex-1 h-full relative">
          <MapView
            locations={locations}
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
          />

          {error && (
            <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 z-[1000] bg-red-600 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between gap-3">
              <span>{error}</span>
              <button
                onClick={fetchLocations}
                className="underline hover:text-red-100 font-bold"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPage;
