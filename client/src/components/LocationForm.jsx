import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Save, X, Crosshair, AlertCircle, Check } from 'lucide-react';

const CATEGORIES = ['Hostels', 'Mess', 'Departments', 'Others'];

const LocationForm = ({
  initialData = null,
  onSubmit = async () => {},
  onCancel = () => {},
  isSubmitting = false,
  pickerCoords = null,
  isPickerActive = false,
  onTogglePicker = () => {},
}) => {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Departments',
    lat: '',
    lng: '',
    description: '',
  });

  const [error, setError] = useState('');

  // Populate when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || 'Departments',
        lat: initialData.lat !== undefined ? initialData.lat : '',
        lng: initialData.lng !== undefined ? initialData.lng : '',
        description: initialData.description || '',
      });
    } else {
      setFormData({
        name: '',
        category: 'Departments',
        lat: '',
        lng: '',
        description: '',
      });
    }
  }, [initialData]);

  // Update when user clicks on map during picker mode
  useEffect(() => {
    if (pickerCoords && isPickerActive) {
      setFormData((prev) => ({
        ...prev,
        lat: Number(pickerCoords.lat.toFixed(6)),
        lng: Number(pickerCoords.lng.toFixed(6)),
      }));
    }
  }, [pickerCoords, isPickerActive]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter a location name.');
      return;
    }

    if (formData.lat === '' || isNaN(Number(formData.lat))) {
      setError('Please provide a valid latitude coordinate.');
      return;
    }

    if (formData.lng === '' || isNaN(Number(formData.lng))) {
      setError('Please provide a valid longitude coordinate.');
      return;
    }

    try {
      await onSubmit({
        name: formData.name.trim(),
        category: formData.category,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        description: formData.description.trim(),
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save location.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-5 md:p-6 transition-all">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            {isEditing ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {isEditing ? 'Edit Campus Location' : 'Add New Campus Location'}
            </h3>
            <p className="text-xs text-slate-400">
              {isEditing
                ? 'Update coordinates or details for this spot'
                : 'Register a hostel, mess, or department on the map'}
            </p>
          </div>
        </div>

        {isEditing && (
          <button
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Location Name <span className="text-red-500">*</span>
          </label>
          <input
            id="input-location-name"
            type="text"
            name="name"
            placeholder="e.g. 1.8K Mega Hostel, IFC B Mess, Dept of CSE"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="select-location-category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Coordinates with Map Picker toggle */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              GPS Coordinates <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              id="btn-toggle-map-picker"
              onClick={onTogglePicker}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                isPickerActive
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>{isPickerActive ? 'Picking on Map...' : 'Pick on Map'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                id="input-location-lat"
                type="number"
                step="any"
                name="lat"
                placeholder="Latitude (e.g. 17.9806)"
                value={formData.lat}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
              />
            </div>
            <div>
              <input
                id="input-location-lng"
                type="number"
                step="any"
                name="lng"
                placeholder="Longitude (e.g. 79.5307)"
                value={formData.lng}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
              />
            </div>
          </div>
          {isPickerActive && (
            <p className="text-[11px] text-blue-600 font-medium mt-1.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Click any spot on the map to automatically populate these coordinates.
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Description / Landmark Info <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            id="textarea-location-desc"
            name="description"
            rows="2"
            placeholder="e.g. Nearby landmarks, gate numbers, amenities or timings..."
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
          ></textarea>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            id="btn-submit-location-form"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Saving...</span>
            ) : isEditing ? (
              <>
                <Check className="w-4 h-4" />
                <span>Update Location</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add Location</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocationForm;
