import React, { useState, useEffect } from 'react';
import { MapPin, Building2, Home, Utensils, Sparkles, Check, X, AlertCircle } from 'lucide-react';
import { LocationItem, LocationCategory, LocationFormData } from '../types';

interface LocationFormProps {
  initialData?: LocationItem | null;
  onSubmit: (data: LocationFormData) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
  onEnablePickerMode?: () => void;
  isPickerMode?: boolean;
  pickerCoords?: { lat: number; lng: number } | null;
}

const CATEGORIES: { value: LocationCategory; label: string; icon: any }[] = [
  { value: 'Departments', label: 'Department / Academic', icon: Building2 },
  { value: 'Hostels', label: 'Hostel / Residence', icon: Home },
  { value: 'Mess', label: 'Dining / Food Court', icon: Utensils },
  { value: 'Others', label: 'Campus Services / Other', icon: Sparkles },
];

const LocationForm: React.FC<LocationFormProps> = ({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
  onEnablePickerMode,
  isPickerMode = false,
  pickerCoords = null,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<LocationCategory>('Departments');
  const [lat, setLat] = useState<string>('17.9806');
  const [lng, setLng] = useState<string>('79.5307');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Sync initialData or picked coordinates
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCategory(initialData.category || 'Departments');
      setLat(initialData.lat?.toString() || '17.9806');
      setLng(initialData.lng?.toString() || '79.5307');
      setDescription(initialData.description || '');
    }
  }, [initialData]);

  useEffect(() => {
    if (pickerCoords) {
      setLat(pickerCoords.lat.toFixed(6));
      setLng(pickerCoords.lng.toFixed(6));
    }
  }, [pickerCoords]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (!name.trim()) {
      setError('Location name is required');
      return;
    }
    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      setError('Please enter a valid Latitude between -90 and 90');
      return;
    }
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      setError('Please enter a valid Longitude between -180 and 180');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        category,
        lat: latNum,
        lng: lngNum,
        description: description.trim(),
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save location');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Location Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Dr. B.R. Ambedkar Learning Resource Centre"
          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Category <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}
                />
                <span className="truncate">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Coordinates */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Coordinates (NITW Campus) <span className="text-red-500">*</span>
          </label>
          {onEnablePickerMode && (
            <button
              type="button"
              onClick={onEnablePickerMode}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                isPickerMode
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{isPickerMode ? 'Picker Active (Click Map)' : 'Pick on Map'}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] text-slate-500 font-medium block mb-1">Latitude</span>
            <input
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="17.9806"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              required
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-medium block mb-1">Longitude</span>
            <input
              type="number"
              step="any"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="79.5307"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              required
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Description (Optional)
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter details like building wings, contact desk, landmark clues..."
          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none"
        ></textarea>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Saving...</span>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>{initialData ? 'Update Location' : 'Add Location'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default LocationForm;
