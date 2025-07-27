
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Slot } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface TimeSlotPickerProps {
  slots: Slot[];
  stationId: string;
  stationName: string;
}

export default function TimeSlotPicker({ slots, stationId, stationName }: TimeSlotPickerProps) {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();

  const handleBookSlot = async () => {
    if (!user) {
        toast({
            title: 'Please Login',
            description: 'You must be logged in to book a slot.',
            variant: 'destructive',
        });
        router.push('/login');
        return;
    }

    if (!selectedSlot) {
      toast({
        title: 'Select a slot',
        description: 'Please select a time slot before booking.',
        variant: 'destructive',
      });
      return;
    }

    setIsBooking(true);

    try {
        await addDoc(collection(db, "bookings"), {
            userId: user.uid,
            stationId: stationId,
            stationName: stationName,
            slot: selectedSlot,
            bookingTime: serverTimestamp()
        });
        toast({
            title: 'Booking Successful!',
            description: `Your slot at ${stationName} for ${selectedSlot} is confirmed.`,
        });
        router.push('/bookings');
    } catch (error) {
        console.error("Booking failed:", error);
        toast({
            title: 'Booking Failed',
            description: 'Could not book the slot. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsBooking(false);
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Book a Slot</CardTitle>
        <CardDescription>Select an available time slot to book your charging session.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
          {slots.map(slot => (
            <Button
              key={slot.time}
              variant={selectedSlot === slot.time ? 'default' : 'outline'}
              disabled={!slot.available || isBooking}
              onClick={() => setSelectedSlot(slot.time)}
              className={cn(
                "w-full",
                slot.available && !selectedSlot && "hover:bg-accent/10 hover:border-accent text-accent",
                slot.available && selectedSlot !== slot.time && "border-slate-200",
                selectedSlot === slot.time && "bg-primary hover:bg-primary/90"
              )}
            >
              {slot.time}
            </Button>
          ))}
        </div>
        <Button disabled={!selectedSlot || isBooking} className="w-full" onClick={handleBookSlot}>
          {isBooking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Booking...
            </>
          ) : selectedSlot ? (
            `Book Now for ${selectedSlot}`
          ) : (
            'Select a time'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
