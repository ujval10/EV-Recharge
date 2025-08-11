
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import type { Station } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Star, Wifi, Coffee, Users, Wrench } from 'lucide-react';
import TimeSlotPicker from '@/components/stations/TimeSlotPicker';
import AiScheduler from '@/components/stations/AiScheduler';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getStationImageUrl } from '@/lib/utils';

export default function StationDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [station, setStation] = useState<Station | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStation = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      };
      
      try {
        const docRef = doc(db, 'stations', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const fetchedStation = {
            id: docSnap.id,
            ...data,
            coordinates: {
              lat: data.coordinates.latitude,
              lng: data.coordinates.longitude,
            }
          } as Station;
          // Sort slots chronologically
          fetchedStation.slots.sort((a, b) => a.time.localeCompare(b.time, undefined, { numeric: true }));
          setStation(fetchedStation);
        } else {
          notFound();
        }
      } catch (error) {
          console.error("Error fetching station details:", error);
          notFound();
      } finally {
        setIsLoading(false);
      }
    };

    fetchStation();
  }, [id]);

  if (isLoading) {
    return (
        <div className="container py-8">
            <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <div className="flex flex-wrap items-center gap-4">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-5 w-32" />
                </div>
                 <Skeleton className="h-96 w-full rounded-lg" />
            </div>
             <div className="mt-8 grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2 space-y-8">
                    <Skeleton className="h-72 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <div className="md:col-span-1">
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        </div>
    );
  }
  
  if (!station) {
    return notFound();
  }

  const amenityIcons: { [key: string]: React.ReactNode } = {
    'Wi-Fi': <Wifi className="w-4 h-4 mr-2" />,
    'Cafe': <Coffee className="w-4 h-4 mr-2" />,
    'Restroom': <Users className="w-4 h-4 mr-2" />,
    'Lounge': <Users className="w-4 h-4 mr-2" />,
    'Vending Machine': <Coffee className="w-4 h-4 mr-2" />,
  };
  
  const availableSlots = station.slots
    .filter(slot => slot.available)
    .map(slot => slot.time)
    .join(', ');

  return (
    <div className="container py-8">
      <div className="space-y-4">
        <div>
          <h1 className="text-4xl font-bold font-headline">{station.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mt-2">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
              <span>{station.rating} ({station.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{station.address}, {station.city}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              <span>{station.mobileNumber}</span>
            </div>
          </div>
        </div>

        <div className="h-96 w-full rounded-lg overflow-hidden relative">
          <Image
            src={getStationImageUrl(station.name)}
            alt={`Image of ${station.name}`}
            fill
            className="object-cover"
            data-ai-hint="charging station interior"
          />
        </div>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Station Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-4">
                  {station.amenities.map(amenity => (
                    <div key={amenity} className="flex items-center text-sm">
                      {amenityIcons[amenity] || <div className="w-4 h-4 mr-2" />}
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
               <div>
                <h3 className="font-semibold mb-2">Bunk Status</h3>
                 <div className="flex flex-wrap gap-2">
                  {station.bunks.map((bunk) => (
                    <Badge
                      key={bunk.id}
                      variant={
                        bunk.status === 'available'
                          ? 'default'
                          : bunk.status === 'occupied'
                          ? 'destructive'
                          : 'outline'
                      }
                      className={cn(
                        bunk.status === 'available' &&
                          'bg-accent text-accent-foreground hover:bg-accent/80',
                        bunk.status === 'maintenance' &&
                          'border-chart-4 text-chart-4'
                      )}
                    >
                      {bunk.status === 'maintenance' && (
                        <Wrench className="inline-block w-3 h-3 mr-1.5" />
                      )}
                      {bunk.name}: {bunk.status}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <TimeSlotPicker 
            slots={station.slots} 
            stationId={station.id}
            stationName={station.name}
          />
        </div>

        <div className="md:col-span-1">
          <AiScheduler availableSlots={availableSlots} />
        </div>
      </div>
    </div>
  );
}
