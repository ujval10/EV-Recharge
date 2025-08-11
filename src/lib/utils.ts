import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Returns the image path for a given station name
export function getStationImageUrl(stationName: string): string {
  const mapping: Record<string, string> = {
    'athergridkoramangala': 'Ather Grid - Koramangala.webp',
    'chargegridmumbai': 'ChargeGrid Mumbai.jpg',
    'chargepointcanarywharf': 'ChargePoint - Canary Wharf.jpeg',
    'ecochargecentral': 'EcoCharge Central.jfif',
    'goacoastalcharge': 'Goa Coastal Charge.jpeg',
    'hitechpowergrid': 'Hitech Power Grid.jpg',
    'ionitycharginghubalexanderplatz': 'Ionity Charging Hub - Alexanderplatz.jpg',
    'marinapowerhub': 'Marina Power Hub.jpg',
    'nagpurev': 'NagpurEV.jpg',
    'okinawaev': 'Okinawa EV.jpg',
    'paradisechargekashmir': 'Paradise Charge Kashmir.jpg',
    'parisvolttoureiffel': 'Paris-Volt - Tour Eiffel.jpg',
    'powerupplaza': 'PowerUp Plaza.jpg',
    'patnaevcharger': 'Patna EV Charger.jpg',
    'punepowerpoint': 'Pune Power Point.jpg',
    'sydneyharbourefill': 'Sydney Harbour E-Fill.jpg',
    'tatapowerezchargeconnaughtplace': 'Tata Power EZ Charge - Connaught Place.jpg',
    'tokyoevfastcharge': 'Tokyo EV Fast Charge.jpg',
    'voltvalley': 'Volt Valley.jpg',
  };
  const normalized = normalizeName(stationName);
  const fileName = mapping[normalized];
  if (fileName) {
    return '/' + encodeURIComponent(fileName).replace(/%2F/g, '/');
  }
  return '/default-station.jpg';
}
