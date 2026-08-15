import { LocationItem } from '../types';
import { INITIAL_NITW_LOCATIONS } from '../seedData';

const STORAGE_KEY = 'nitw_campus_locations_db';

/**
 * Helper to manage locations with LocalStorage persistence fallback
 * when MongoDB Atlas is offline or in client preview mode.
 */
export const getStoredLocations = (): LocationItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NITW_LOCATIONS));
      return INITIAL_NITW_LOCATIONS;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_NITW_LOCATIONS;
  } catch {
    return INITIAL_NITW_LOCATIONS;
  }
};

export const saveStoredLocations = (locations: LocationItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
  } catch (err) {
    console.error('Failed to save locations to localStorage:', err);
  }
};

export const addStoredLocation = (item: Omit<LocationItem, 'id' | '_id'>): LocationItem => {
  const current = getStoredLocations();
  const newLocation: LocationItem = {
    ...item,
    id: 'loc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
    createdAt: new Date().toISOString(),
  };
  const updated = [newLocation, ...current];
  saveStoredLocations(updated);
  return newLocation;
};

export const updateStoredLocation = (
  id: string,
  updates: Partial<LocationItem>
): LocationItem | null => {
  const current = getStoredLocations();
  const index = current.findIndex((loc) => loc.id === id || loc._id === id);
  if (index === -1) return null;

  const updatedItem = {
    ...current[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  current[index] = updatedItem;
  saveStoredLocations(current);
  return updatedItem;
};

export const deleteStoredLocation = (id: string): boolean => {
  const current = getStoredLocations();
  const filtered = current.filter((loc) => loc.id !== id && loc._id !== id);
  saveStoredLocations(filtered);
  return true;
};
