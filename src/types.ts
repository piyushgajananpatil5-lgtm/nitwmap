export type LocationCategory = 'Hostels' | 'Mess' | 'Departments' | 'Others';

export interface LocationFormData {
  name: string;
  category: LocationCategory;
  lat: number;
  lng: number;
  description?: string;
}

export interface LocationItem {
  _id?: string;
  id?: string;
  name: string;
  category: LocationCategory;
  lat: number;
  lng: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUser {
  id?: string;
  username: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  admin?: AdminUser;
}

export interface LocationsResponse {
  success: boolean;
  count?: number;
  data: LocationItem[];
  message?: string;
}

export interface RoutePoint {
  lat: number;
  lng: number;
  name: string;
  category?: LocationCategory;
}

export interface RouteInstruction {
  text: string;
  distance: number;
  time: number;
  type?: string;
}

export interface RouteSummary {
  totalDistance: number; // in meters
  totalTime: number; // in seconds
  instructions?: RouteInstruction[];
}

