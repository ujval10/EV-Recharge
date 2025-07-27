
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import type { Station } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function MapPage() {
  const router = useRouter();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const position = { lat: 20.5937, lng: 78.9629 }; // Centered on India
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'stations'));
        const stationsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                coordinates: {
                    lat: data.coordinates.latitude,
                    lng: data.coordinates.longitude
                }
            } as Station;
        });
        setStations(stationsData);
      } catch (error) {
        console.error("Error fetching stations for map:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStations();
  }, []);

  if (!apiKey) {
    return (
      <div className="container py-8 text-center">
        <Card className="max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                    Configuration Error
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    The Google Maps API key is missing. Please add it to your environment variables to display the map.
                </p>
                 <p className="text-sm mt-4 text-muted-foreground">
                    Also, ensure that you have enabled billing for the Google Cloud project associated with the API key.
                </p>
            </CardContent>
        </Card>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="w-full h-[calc(100vh-4rem)]">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-4rem)]">
        <APIProvider apiKey={apiKey}>
            <Map 
                defaultCenter={position} 
                defaultZoom={5} 
                mapId="ev-recharge-map"
                gestureHandling={'greedy'}
            >
            {stations.map((station) => (
                <AdvancedMarker
                    key={station.id}
                    position={station.coordinates}
                    onClick={() => setSelectedStation(station)}
                />
            ))}

            {selectedStation && (
                <InfoWindow 
                    position={selectedStation.coordinates}
                    onCloseClick={() => setSelectedStation(null)}
                >
                    <div className="p-2">
                        <h3 className="font-bold">{selectedStation.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedStation.address}</p>
                        <Button 
                            variant="link" 
                            className="p-0 h-auto mt-2 text-sm"
                            onClick={() => router.push(`/stations/${selectedStation.id}`)}
                        >
                            View Details
                        </Button>
                    </div>
                </InfoWindow>
            )}
            </Map>
        </APIProvider>
    </div>
  );
}

    