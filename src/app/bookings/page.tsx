
'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Booking {
  id: string;
  stationName: string;
  slot: string;
  bookingTime: Timestamp;
}

export default function BookingsPage() {
  const [user, loading] = useAuthState(auth);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (user) {
        try {
          const q = query(
            collection(db, 'bookings'),
            where('userId', '==', user.uid),
            orderBy('bookingTime', 'desc')
          );
          const querySnapshot = await getDocs(q);
          const userBookings = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Booking[];
          setBookings(userBookings);
        } catch (err: any) {
            console.error("Error fetching bookings:", err);
            if (err.code === 'failed-precondition') {
                 setError('This query requires an index. Please check your Firestore indexes.');
            } else if (err.code === 'permission-denied') {
                 setError('Failed to load bookings. Please check your Firestore security rules.');
            } else {
                setError('An unexpected error occurred while fetching your bookings.');
            }
        } finally {
            setIsLoadingBookings(false);
        }
      } else if (!loading) {
        setIsLoadingBookings(false);
      }
    };

    fetchBookings();
  }, [user, loading]);

  if (loading || isLoadingBookings) {
    return (
      <div className="container py-8">
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-6 w-1/2" />
        </div>
        <div className="mt-8 grid gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-2 text-muted-foreground">Please log in to view your bookings.</p>
      </div>
    );
  }
  
   if (error) {
    return (
        <div className="container py-8 text-center">
            <h1 className="text-2xl font-bold text-destructive">Error</h1>
            <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
        );
    }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">My Bookings</CardTitle>
          <CardDescription>Here are all the charging slots you've reserved.</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map(booking => (
                <div key={booking.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <h3 className="font-semibold">{booking.stationName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {booking.bookingTime ? `Booked on: ${format(booking.bookingTime.toDate(), 'PPP p')}` : 'Booking time not available'}
                    </p>
                  </div>
                  <Badge variant="outline">Slot: {booking.slot}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
                <h2 className="text-2xl font-semibold">No bookings yet</h2>
                <p className="text-muted-foreground mt-2">Find a station and book your first charge!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
