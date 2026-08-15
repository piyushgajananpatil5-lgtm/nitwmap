import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  LogOut,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Compass,
  Building2,
  Utensils,
  Home,
  Sparkles,
  Layers,
} from 'lucide-react';
import MapView from '../components/MapView';
import LocationForm from '../components/LocationForm';
import api from '../api/axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Form State
  const [editingLocation, setEditingLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Map Picker State
  const [isPickerActive, setIsPickerActive] = useState(false);
  const [pickerCoords, setPickerCoords] = useState(null);
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);

  // Stored admin username
  const adminUser = useMemo(() => {
    try {
      const stored = localStorage.getItem('nitw_admin_user');
      return stored ? JSON.parse(stored) : { username: 'admin' };
    } catch {
      return { username: 'admin' };
    }
  }, []);

  // Fetch all locations
  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/locations');
      if (res.data && res.data.data) {
        setLocations(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching locations in dashboard:', err);
      showNotification('error', 'Failed to retrieve locations from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('nitw_admin_token');
    localStorage.removeItem('nitw_admin_user');
    navigate('/admin/login');
  };

  // Handle Map Click in Picker Mode
  const handleMapClick = (lat, lng) => {
    setPickerCoords({ lat, lng });
    showNotification('success', `Coordinates captured: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
  };

  // Handle Submit (Create or Update)
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingLocation) {
        // PUT /api/locations/:id
        const id = editingLocation._id || editingLocation.id;
        await api.put(`/locations/${id}`, formData);
        showNotification('success', `"${formData.name}" was updated successfully.`);
        setEditingLocation(null);
      } else {
        // POST /api/locations
        await api.post('/locations', formData);
        showNotification('success', `"${formData.name}" was added to the campus map.`);
      }

      // Turn off picker mode & reset coords
      setIsPickerActive(false);
      setPickerCoords(null);

      // Refetch to reflect updates across the app
      await fetchLocations();
    } catch (err) {
      console.error('Save error:', err);
      showNotification('error', err.response?.data?.message || 'Failed to save location.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (loc) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${loc.name}"?`);
    if (!confirmDelete) return;

    try {
      const id = loc._id || loc.id;
      await api.delete(`/locations/${id}`);
      showNotification('success', `"${loc.name}" removed from database.`);
      if (editingLocation && (editingLocation._id === id || editingLocation.id === id)) {
        setEditingLocation(null);
      }
      await fetchLocations();
    } catch (err) {
      console.error('Delete error:', err);
      showNotification('error', err.response?.data?.message || 'Failed to delete location.');
    }
  };

  // Filtering for table
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesCat = filterCategory === 'All' || loc.category === filterCategory;
      const matchesSearch =
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (loc.description && loc.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [locations, filterCategory, searchQuery]);

  // Quick stats
  const stats = useMemo(() => {
    return {
      total: locations.length,
      hostels: locations.filter((l) => l.category === 'Hostels').length,
      mess: locations.filter((l) => l.category === 'Mess').length,
      departments: locations.filter((l) => l.category === 'Departments').length,
      others: locations.filter((l) => l.category === 'Others').length,
    };
  }, [locations]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-4 md:px-8 py-3.5 sticky top-0 z-30 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base md:text-lg tracking-tight">
                NITW Campus Admin
              </h1>
              <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-400/30">
                Dashboard
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Logged in as <span className="text-slate-200 font-semibold">{adminUser.username}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all"
          >
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">View Public Map</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </Link>

          <button
            onClick={handleLogout}
            id="admin-logout-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-semibold rounded-xl border border-red-800/50 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Floating Notifications */}
      {notification && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 border text-xs font-medium max-w-sm animate-in fade-in slide-in-from-top-4 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">Total Spots</span>
              <MapPin className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-purple-600 mb-1">
              <span className="text-xs font-semibold">Hostels</span>
              <Home className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.hostels}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-emerald-600 mb-1">
              <span className="text-xs font-semibold">Mess / Food</span>
              <Utensils className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.mess}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-blue-600 mb-1">
              <span className="text-xs font-semibold">Departments</span>
              <Building2 className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.departments}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-amber-600 mb-1">
              <span className="text-xs font-semibold">Others</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.others}</p>
          </div>
        </div>

        {/* Dashboard 2-Column Split: Form + Map on Left, Data Table on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form & Interactive Map Picker (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <LocationForm
              initialData={editingLocation}
              onSubmit={handleFormSubmit}
              onCancel={() => setEditingLocation(null)}
              isSubmitting={isSubmitting}
              pickerCoords={pickerCoords}
              isPickerActive={isPickerActive}
              onTogglePicker={() => setIsPickerActive(!isPickerActive)}
            />

            {/* Live Visual Map for Picker */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-4 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Interactive Campus Map
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">
                  {isPickerActive ? '🎯 Click map to capture lat/lng' : 'Preview mode'}
                </span>
              </div>
              <div className="h-64 rounded-xl overflow-hidden border border-slate-200">
                <MapView
                  locations={locations}
                  selectedLocation={selectedMapLocation || editingLocation}
                  onSelectLocation={(loc) => {
                    setSelectedMapLocation(loc);
                  }}
                  isPickerMode={isPickerActive}
                  pickerCoords={pickerCoords}
                  onMapClick={handleMapClick}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Manage Locations Table (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden flex flex-col">
            {/* Table Controls */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter locations by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                {['All', 'Hostels', 'Mess', 'Departments', 'Others'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      filterCategory === cat
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Location Name</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Coordinates</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-400">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                        <p className="mt-2 text-xs">Loading database records...</p>
                      </td>
                    </tr>
                  ) : filteredLocations.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-400">
                        <p className="font-semibold text-slate-600">No matching locations found</p>
                        <p className="text-[11px] mt-0.5">Try searching with a different keyword.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLocations.map((loc) => {
                      const isBeingEdited =
                        editingLocation && (editingLocation._id === loc._id || editingLocation.id === loc.id);

                      return (
                        <tr
                          key={loc._id || loc.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isBeingEdited ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            <div>{loc.name}</div>
                            {loc.description && (
                              <div className="text-[11px] font-normal text-slate-400 truncate max-w-xs">
                                {loc.description}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                loc.category === 'Hostels'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : loc.category === 'Mess'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : loc.category === 'Departments'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {loc.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            {loc.lat.toFixed(4)}°, {loc.lng.toFixed(4)}°
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingLocation(loc);
                                  setSelectedMapLocation(loc);
                                }}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Location"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(loc)}
                                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Location"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {filteredLocations.length} locations</span>
              <button
                onClick={() => {
                  setEditingLocation(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add new location</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
