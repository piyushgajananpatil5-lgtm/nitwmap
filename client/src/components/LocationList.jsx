import React, { useState, useMemo } from 'react';
import { Search, MapPin, Building2, Utensils, Home, Sparkles, Navigation, X } from 'lucide-react';

const CATEGORIES = ['All', 'Hostels', 'Mess', 'Departments', 'Others'];

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Hostels':
      return <Home className="w-4 h-4 text-purple-600" />;
    case 'Mess':
      return <Utensils className="w-4 h-4 text-emerald-600" />;
    case 'Departments':
      return <Building2 className="w-4 h-4 text-blue-600" />;
    default:
      return <Sparkles className="w-4 h-4 text-amber-600" />;
  }
};

const getCategoryBadgeClass = (category) => {
  switch (category) {
    case 'Hostels':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Mess':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Departments':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-amber-50 text-amber-700 border-amber-200';
  }
};

const LocationList = ({
  locations = [],
  selectedLocation = null,
  onSelectLocation = () => {},
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: locations.length, Hostels: 0, Mess: 0, Departments: 0, Others: 0 };
    locations.forEach((loc) => {
      if (counts[loc.category] !== undefined) {
        counts[loc.category]++;
      } else {
        counts['Others']++;
      }
    });
    return counts;
  }, [locations]);

  // Filter locations
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesCategory =
        selectedCategory === 'All' || loc.category === selectedCategory;
      const matchesSearch =
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (loc.description && loc.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [locations, selectedCategory, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 shadow-sm overflow-hidden">
      {/* Header with Search */}
      <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="location-search-input"
            type="text"
            placeholder="Search hostels, mess, depts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isCatActive = selectedCategory === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                id={`filter-tab-${cat.toLowerCase()}`}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isCatActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 font-semibold'
                    : 'bg-slate-100/80 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isCatActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-200/80 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Location Cards Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y-0">
        {isLoading ? (
          // Skeleton loading
          <div className="space-y-3 p-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-3.5 bg-slate-50 rounded-xl animate-pulse space-y-2 border border-slate-100">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-4 bg-slate-200 rounded w-16"></div>
                </div>
                <div className="h-3 bg-slate-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-700">No locations found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-[220px] mx-auto">
              Try adjusting your search terms or category filter to discover places.
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-xs text-blue-600 font-medium hover:underline"
              >
                Clear search query
              </button>
            )}
          </div>
        ) : (
          filteredLocations.map((loc) => {
            const isSelected =
              selectedLocation && (selectedLocation._id === loc._id || selectedLocation.id === loc.id);

            return (
              <div
                key={loc._id || loc.id}
                id={`loc-card-${loc._id || loc.id}`}
                onClick={() => onSelectLocation(loc)}
                className={`group p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-500/20 shadow-sm'
                    : 'bg-white hover:bg-slate-50/90 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-50 border border-slate-200/60 shrink-0">
                      {getCategoryIcon(loc.category)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors leading-snug">
                        {loc.name}
                      </h4>
                      {loc.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {loc.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${getCategoryBadgeClass(
                      loc.category
                    )}`}
                  >
                    {loc.category}
                  </span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono">
                    {loc.lat.toFixed(4)}°, {loc.lng.toFixed(4)}°
                  </span>
                  <span className="flex items-center gap-1 text-blue-600 font-medium group-hover:translate-x-0.5 transition-transform">
                    <Navigation className="w-3 h-3" />
                    <span>Fly to</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500 flex items-center justify-between">
        <span>NIT Warangal Campus</span>
        <span className="font-medium text-slate-700">{filteredLocations.length} locations</span>
      </div>
    </div>
  );
};

export default LocationList;
