import React, { useState } from 'react';
import {
  ShieldCheck,
  LogOut,
  MapPin,
  Building2,
  Home,
  Utensils,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Search,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import LocationForm from '../components/LocationForm';
import MapView from '../components/MapView';
import { LocationItem, LocationCategory, LocationFormData } from '../types';
import { INITIAL_NITW_LOCATIONS } from '../seedData';

interface AdminDashboardProps {
  locations: LocationItem[];
  adminUser: string;
  onAddLocation: (data: LocationFormData) => Promise<void> | void;
  onUpdateLocation: (id: string, data: LocationFormData) => Promise<void> | void;
  onDeleteLocation: (id: string) => Promise<void> | void;
  onResetSeedData: () => void;
  onLogout: () => void;
  onNavigateToMap: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  locations,
  adminUser,
  onAddLocation,
  onUpdateLocation,
  onDeleteLocation,
  onResetSeedData,
  onLogout,
  onNavigateToMap,
}) => {
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<LocationCategory | 'All'>('All');
  const [isPickerMode, setIsPickerMode] = useState(false);
  const [pickerCoords, setPickerCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedMapLocation, setSelectedMapLocation] = useState<LocationItem | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleFormSubmit = async (data: LocationFormData) => {
    setIsSubmitting(true);
    try {
      if (editingLocation) {
        const id = editingLocation._id || editingLocation.id;
        if (id) {
          await onUpdateLocation(id, data);
          showToast(`Updated "${data.name}" successfully.`);
        }
      } else {
        await onAddLocation(data);
        showToast(`Added "${data.name}" to campus map.`);
      }
      setEditingLocation(null);
      setIsPickerMode(false);
      setPickerCoords(null);
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (loc: LocationItem) => {
    const id = loc._id || loc.id;
    if (!id) return;
    if (window.confirm(`Are you sure you want to delete "${loc.name}" from the campus directory?`)) {
      await onDeleteLocation(id);
      showToast(`Deleted "${loc.name}".`);
      if (editingLocation && (editingLocation._id === id || editingLocation.id === id)) {
        setEditingLocation(null);
      }
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (isPickerMode) {
      setPickerCoords({ lat, lng });
    }
  };

  // Stats calculation
  const stats = {
    total: locations.length,
    departments: locations.filter((l) => l.category === 'Departments').length,
    hostels: locations.filter((l) => l.category === 'Hostels').length,
    mess: locations.filter((l) => l.category === 'Mess').length,
    others: locations.filter((l) => l.category === 'Others').length,
  };

  const filteredLocations = locations.filter((loc) => {
    const matchesCategory = categoryFilter === 'All' || loc.category === categoryFilter;
    const matchesSearch =
      loc.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (loc.description && loc.description.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      {/* Top Header */}
      <header className="h-16 flex-none bg-indigo-900 text-white flex items-center justify-between px-6 border-b border-indigo-800 shadow-sm z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-indigo-900 font-black text-xl shadow-sm">
            W
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg text-white">NITW Campus Navigator</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-800 text-indigo-200 rounded border border-indigo-700">
                ADMIN CONSOLE
              </span>
            </div>
            <p className="text-[11px] text-indigo-200">
              Logged in as <span className="font-bold text-white">{adminUser || 'Admin'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToMap}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-800 hover:bg-indigo-700 text-indigo-100 rounded-lg text-xs font-bold border border-indigo-700 transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Map View</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-200 rounded-lg text-xs font-bold border border-red-500/30 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </header>

      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-950 text-white px-4 py-3 rounded-xl shadow-2xl border border-indigo-700 flex items-center gap-2.5 text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Points
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
              Departments
            </span>
            <div className="text-2xl font-black text-indigo-900 mt-1">{stats.departments}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
              Hostels
            </span>
            <div className="text-2xl font-black text-purple-900 mt-1">{stats.hostels}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Dining / Mess
            </span>
            <div className="text-2xl font-black text-emerald-900 mt-1">{stats.mess}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
              Other Amenities
            </span>
            <div className="text-2xl font-black text-amber-900 mt-1">{stats.others}</div>
          </div>
        </div>

        {/* Main Work Area: Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Form & Interactive Map Picker (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center font-bold text-xs">
                    {editingLocation ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-4 h-4" />}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingLocation ? `Edit: ${editingLocation.name}` : 'Add Campus Location'}
                  </h3>
                </div>
                {editingLocation && (
                  <button
                    onClick={() => {
                      setEditingLocation(null);
                      setIsPickerMode(false);
                      setPickerCoords(null);
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <LocationForm
                initialData={editingLocation}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setEditingLocation(null);
                  setIsPickerMode(false);
                  setPickerCoords(null);
                }}
                isSubmitting={isSubmitting}
                onEnablePickerMode={() => setIsPickerMode(!isPickerMode)}
                isPickerMode={isPickerMode}
                pickerCoords={pickerCoords}
              />
            </div>

            {/* Embedded Live Mini Map for Coordinate Calibration */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Campus Coordinate Calibration Map</span>
                </span>
                {isPickerMode && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 animate-pulse">
                    Click map to pick
                  </span>
                )}
              </div>
              <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-200 relative">
                <MapView
                  locations={locations}
                  selectedLocation={selectedMapLocation || editingLocation}
                  onSelectLocation={(loc) => {
                    setSelectedMapLocation(loc);
                    if (loc) {
                      setEditingLocation(loc);
                    }
                  }}
                  isPickerMode={isPickerMode}
                  pickerCoords={pickerCoords}
                  onMapClick={handleMapClick}
                />
              </div>
            </div>
          </div>

          {/* Right: Locations Management Table (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
              {/* Header & Filter Controls */}
              <div className="p-4 border-b border-slate-100 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-black text-slate-900">
                    Campus Directory ({filteredLocations.length})
                  </h3>

                  <button
                    onClick={() => {
                      if (window.confirm('Reset all campus locations to official NITW seed markers?')) {
                        onResetSeedData();
                        showToast('Reset locations to default NITW seed data.');
                      }
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restore Defaults</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Filter directory..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as any)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700 focus:bg-white focus:outline-none"
                  >
                    <option value="All">All Categories</option>
                    <option value="Departments">Departments</option>
                    <option value="Hostels">Hostels</option>
                    <option value="Mess">Mess</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              {/* Table List */}
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 border-collapse">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-4">Name &amp; Description</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Coordinates</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLocations.map((loc) => {
                      const id = loc._id || loc.id;
                      const isBeingEdited = editingLocation && (editingLocation._id === id || editingLocation.id === id);

                      return (
                        <tr
                          key={id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isBeingEdited ? 'bg-indigo-50/50' : ''
                          }`}
                        >
                          <td className="py-3 px-4 max-w-[220px]">
                            <div className="font-bold text-slate-900 leading-snug truncate">
                              {loc.name}
                            </div>
                            {loc.description && (
                              <div className="text-[11px] text-slate-400 truncate mt-0.5">
                                {loc.description}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                                loc.category === 'Departments'
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : loc.category === 'Hostels'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : loc.category === 'Mess'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {loc.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                            {loc.lat.toFixed(4)}°, {loc.lng.toFixed(4)}°
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingLocation(loc);
                                  setSelectedMapLocation(loc);
                                }}
                                className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Edit Location"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(loc)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Location"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
