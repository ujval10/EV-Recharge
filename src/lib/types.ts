
import { type GeoPoint, type Timestamp } from "firebase/firestore";

export interface Station {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  coordinates: { // Used in the frontend
    lat: number;
    lng: number;
  } | GeoPoint; // Stored in Firestore
  mobileNumber: string;
  amenities: string[];
  slots: Slot[];
  rating: number;
  reviewCount: number;
  imageUrl: string;
  imageHint: string;
  bunks: Bunk[];
  createdAt?: Timestamp;
}

export interface Slot {
  time: string;
  available: boolean;
}

export interface Bunk {
  id: string;
  name: string;
  status: 'available' | 'occupied' | 'maintenance';
}

    