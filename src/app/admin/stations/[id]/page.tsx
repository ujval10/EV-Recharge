// src/app/admin/stations/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Station } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Power, PowerOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { toggleSlotAvailability } from '@/app/actions';

export default function ManageStationPage() {
  const [user, loadingAuth] = useAuthState(auth);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();

  const [station, setStation] = useState<Station | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingSlot, setIsUpdatingSlot] = useState<string | null>(null);

  useEffect(() => {
    if (loadingAuth) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const checkAdminAndFetchData = async () => {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().role === 'admin') {
        setIsAdmin(true);
      } else {
        router.push('/');
        return;
      }
    };
    checkAdminAndFetchData();
  }, [user, loadingAuth, router]);

  useEffect(() => {
    if (!isAdmin || !id) return;

    // Use onSnapshot for real-time updates
    const stationDocRef = doc(db, 'stations', id);
    const unsubscribe = onSnapshot(stationDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const fetchedStation = {
          id: docSnap.id,
          ...data,
          coordinates: {
            lat: data.coordinates.latitude,
            lng: data.coordinates.longitude,
          },
        } as Station;
        fetchedStation.slots.sort((a, b) => a.time.localeCompare(b.time));
        setStation(fetchedStation);
      } else {
        setStation(null);
        toast({ title: 'Station not found', description: 'This station may have been deleted.', variant: 'destructive' });
        router.push('/admin');
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching station in real-time:", error);
      toast({ title: 'Error', description: 'Could not fetch station data.', variant: 'destructive' });
      setIsLoading(false);
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [isAdmin, id, router, toast]);
  
  const handleToggleSlot = async (slotTime: string) => {
      if (!station) return;
      setIsUpdatingSlot(slotTime);
      const result = await toggleSlotAvailability(station.id, slotTime);
      if(!result.success) {
          toast({ title: 'Error', description: result.message, variant: 'destructive'});
      }
      // We don't need to show a success toast, the UI will update in real-time
      setIsUpdatingSlot(null);
  }

  if (isLoading || loadingAuth) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Card>
          <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold">Station Not Found</h1>
        <p className="mt-2 text-muted-foreground">The station you are looking for does not exist.</p>
        <Button onClick={() => router.push('/admin')} variant="outline" className="mt-4">Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
       <Button variant="outline" onClick={() => router.push('/admin')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">{station.name}</CardTitle>
          <CardDescription>
            Station management features have been disabled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            <p><strong>Address:</strong> {station.address}</p>
            <p><strong>City:</strong> {station.city}</p>
            <p><strong>Country:</strong> {station.country}</p>
            <p><strong>Mobile Number:</strong> {station.mobileNumber}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
