import React, { useState, useMemo } from 'react';
import { Search, MapPin, Building2, Utensils, Home, Sparkles, Navigation, X, ChevronRight, RotateCcw } from 'lucide-react';
import { LocationItem, LocationCategory } from '../types';

interface LocationListProps {
  locations?: LocationItem[];
  selectedLocation?: LocationItem | null;
  onSelectLocation?: (location: LocationItem | null) => void;
  isLoading?: boolean;
  onResetView?: () => void;
}

const CATEGORIES: (LocationCategory | 'All')[] = ['All', 'Hostels', 'Mess', 'Departments', 'Others'];

const getCategoryDot = (category: LocationCategory, isSelected: boolean) => {
  if (isSelected) return 'bg-indigo-600 ring-2 ring-indigo-300';
  switch (category) {
    case 'Departments':
      return 'bg-indigo-600';
    case 'Hostels':
      return 'bg-purple-600';
    case 'Mess':
      return 'bg-emerald-600';
    default:
      return 'bg-amber-500';
  }
};

const getCategoryBadgeClass = (category: LocationCategory) => {
  switch (category) {
    case 'Departments':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Hostels':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Mess':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-amber-50 text-amber-700 border-amber-200';
  }
};

const LocationList: React.FC<LocationListProps> = ({
  locations = [],
  selectedLocation = null,
  onSelectLocation = (_loc?: LocationItem | null) => {},
  isLoading = false,
  onResetView = () => {},
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LocationCategory | 'All'>('All');

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: locations.length,
      Hostels: 0,
      Mess: 0,
      Departments: 0,
      Others: 0,
    };
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

  // Group locations for clear directory scanning
  const groupedLocations = useMemo(() => {
    const groups: { title: string; category: LocationCategory; items: LocationItem[] }[] = [
      {
        title: 'Academic & Common Facilities',
        category: 'Departments',
        items: filteredLocations.filter((l) => l.category === 'Departments'),
      },
      {
        title: 'Hostels & Residences',
        category: 'Hostels',
        items: filteredLocations.filter((l) => l.category === 'Hostels'),
      },
      {
        title: 'Dining Halls & Mess',
        category: 'Mess',
        items: filteredLocations.filter((l) => l.category === 'Mess'),
      },
      {
        title: 'Key Campus Landmarks & Services',
        category: 'Others',
        items: filteredLocations.filter((l) => l.category === 'Others'),
      },
    ];

    return groups.filter((g) => g.items.length > 0);
  }, [filteredLocations]);

  return (
    <aside className="w-full h-full bg-white border-r border-slate-200 flex flex-col shadow-inner">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="location-search-input"
            type="text"
            placeholder="Search departments, hostels, or mess..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-white hover:bg-slate-50 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
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

        {/* Filter Pills */}
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => {
            const isCatActive = selectedCategory === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                id={`filter-tab-${cat.toLowerCase()}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  isCatActive
                    ? 'font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-xs'
                    : 'font-medium bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-900'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isCatActive ? 'bg-indigo-200/80 text-indigo-800' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory List with Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {isLoading ? (
          <div className="space-y-3 p-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl animate-pulse space-y-2 border border-slate-100">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-4 bg-slate-200 rounded w-12"></div>
                </div>
                <div className="h-3 bg-slate-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-3 border border-indigo-100">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No locations found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-[220px] mx-auto leading-relaxed">
              Try adjusting your search keywords or category filters.
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-xs text-indigo-600 font-bold hover:underline"
              >
                Clear search query
              </button>
            )}
          </div>
        ) : (
          groupedLocations.map((group) => (
            <div key={group.title} className="mb-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 px-2 flex items-center justify-between">
                <span>{group.title}</span>
                <span className="text-[10px] text-slate-400 font-medium">({group.items.length})</span>
              </h3>

              <div className="space-y-1.5">
                {group.items.map((loc) => {
                  const isSelected =
                    selectedLocation &&
                    ((selectedLocation._id && loc._id && selectedLocation._id === loc._id) ||
                      (selectedLocation.id && loc.id && selectedLocation.id === loc.id));

                  return (
                    <div
                      key={loc._id || loc.id}
                      id={`loc-card-${loc._id || loc.id}`}
                      onClick={() => onSelectLocation(loc)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-50 border border-indigo-200 shadow-xs'
                          : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div
                          className={`w-2 h-2 rounded-full shrink-0 ${getCategoryDot(
                            loc.category,
                            Boolean(isSelected)
                          )}`}
                        ></div>
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-bold leading-snug truncate ${
                              isSelected ? 'text-indigo-900' : 'text-slate-800'
                            }`}
                          >
                            {loc.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {loc.description || `${loc.lat.toFixed(4)}° N, ${loc.lng.toFixed(4)}° E`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${getCategoryBadgeClass(
                            loc.category
                          )}`}
                        >
                          {loc.category}
                        </span>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            isSelected ? 'text-indigo-600 translate-x-0.5' : 'text-slate-300'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer with Reset View Button */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={onResetView}
          className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Campus View</span>
        </button>
      </div>
    </aside>
  );
};

export default LocationList;
