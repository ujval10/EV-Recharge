
'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, doc, getDoc, Timestamp, addDoc, writeBatch, deleteDoc, serverTimestamp, GeoPoint } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Shield, Trash2, PlusCircle, AlertTriangle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, SubmitHandler } from "react-hook-form";
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { stations as seedData } from '@/lib/data';
import type { Station } from '@/lib/types';
import Link from 'next/link';

interface User {
  uid: string;
  fullName: string;
  email: string;
  role?: string;
  createdAt: Timestamp;
}

type StationFormInputs = {
  name: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  mobileNumber: string;
};

export default function AdminDashboard() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<StationFormInputs>();

  const fetchStations = async () => {
    try {
      const stationsSnapshot = await getDocs(collection(db, 'stations'));
      const stationsList = stationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Station));
      // Firestore returns GeoPoint objects, so we need to convert them
      const formattedStations = stationsList.map(s => ({
        ...s,
        coordinates: {
            lat: (s.coordinates as any).latitude,
            lng: (s.coordinates as any).longitude,
        }
      }));
      setStations(formattedStations);
    } catch (error) {
        console.error("Error fetching stations:", error);
        toast({ title: "Error", description: "Could not fetch stations.", variant: 'destructive' });
    }
  };

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      if (loading) return;
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
          // Fetch users
          const usersSnapshot = await getDocs(collection(db, 'users'));
          const allUsers = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as User[];
          setUsers(allUsers);
          // Fetch stations
          await fetchStations();
        } else {
          router.push('/');
        }
      } catch (error) {
          console.error("Error checking admin status or fetching data: ", error);
          router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAndFetchData();
  }, [user, loading, router]);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
        const stationsCollection = collection(db, 'stations');
        const snapshot = await getDocs(stationsCollection);

        if (!snapshot.empty) {
            toast({
                title: "Data Already Exists",
                description: "The stations collection is not empty. Seeding has been cancelled to avoid duplicates.",
                variant: 'destructive'
            });
            setIsSeeding(false);
            return;
        }

        const batch = writeBatch(db);
        seedData.forEach(station => {
            const { id, coordinates, ...rest } = station;
            const docRef = doc(db, 'stations', id);
            const stationData = {
                ...rest,
                coordinates: new GeoPoint(coordinates.lat, coordinates.lng),
                createdAt: serverTimestamp()
            };
            batch.set(docRef, stationData);
        });
        await batch.commit();

        toast({
            title: "Success!",
            description: "Station data has been seeded to Firestore."
        });
        await fetchStations();
    } catch (error) {
        console.error("Error seeding data:", error);
        toast({ title: "Seeding Failed", description: "There was an error while seeding the data.", variant: 'destructive' });
    } finally {
        setIsSeeding(false);
    }
  };
  
  const onAddStationSubmit: SubmitHandler<StationFormInputs> = async (data) => {
    if (!isAdmin) return;
    setIsSubmitting(true);

    // Generate standard 9 AM to 4 PM time slots, but randomly block 2 slots
    let generatedSlots = Array.from({ length: 8 }, (_, i) => {
        const hour24 = 9 + i;
        const period = hour24 >= 12 ? 'PM' : 'AM';
        let hour12 = hour24 % 12;
        if (hour12 === 0) {
          hour12 = 12;
        }
        return {
            time: `${String(hour12).padStart(2, '0')}:00 ${period}`,
            available: true
        };
    });
    // Randomly pick 2 unique indices to block
    const blockedIndices = [];
    while (blockedIndices.length < 2) {
      const idx = Math.floor(Math.random() * generatedSlots.length);
      if (!blockedIndices.includes(idx)) blockedIndices.push(idx);
    }
    generatedSlots = generatedSlots.map((slot, i) => blockedIndices.includes(i) ? { ...slot, available: false } : slot);
    
    try {
        const newStationData = {
            name: data.name,
            address: data.address,
            city: data.city,
            country: data.country,
            mobileNumber: data.mobileNumber,
            coordinates: new GeoPoint(Number(data.latitude), Number(data.longitude)),
            rating: 5,
            reviewCount: 1,
            imageUrl: 'https://placehold.co/600x400.png',
            imageHint: 'electric car',
            amenities: ['Wi-Fi', 'Restroom'],
            bunks: [{ id: 'bunk-1', name: 'Bunk 1', status: 'available' }],
            slots: generatedSlots,
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, 'stations'), newStationData);
        toast({ title: "Station Added", description: `${data.name} has been added.` });
        reset();
        await fetchStations();
    } catch (error) {
        console.error("Error adding station:", error);
        toast({ title: "Error", description: "Could not add station.", variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteStation = async (stationId: string) => {
      if(!isAdmin) return;
      try {
          await deleteDoc(doc(db, 'stations', stationId));
          toast({ title: "Station Deleted", description: "The station has been successfully removed." });
          await fetchStations();
      } catch (error) {
          console.error("Error deleting station:", error);
          toast({ title: "Error", description: "Could not delete station.", variant: 'destructive' });
      }
  }


  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-4"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-6 w-1/2" /></div>
        <div className="mt-8 grid gap-4"><Skeleton className="h-48 w-full" /></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-2 text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Shield className="h-10 w-10 text-primary" />
            <div>
                <h1 className="text-4xl font-bold tracking-tight font-headline">Admin Dashboard</h1>
                <p className="text-xl text-muted-foreground">Welcome, Administrator.</p>
            </div>
        </div>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
           <Card>
                <CardHeader>
                  <CardTitle>Station Management</CardTitle>
                  <CardDescription>Manage all EV charging stations in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    {stations.length === 0 && (
                        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                            <AlertTriangle className="w-12 h-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No Stations Found in Firestore</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                It looks like your 'stations' collection is empty. You can populate it with initial data.
                            </p>
                             <Button onClick={handleSeedData} disabled={isSeeding} className="mt-4">
                                {isSeeding ? "Seeding..." : "Seed Initial Station Data"}
                             </Button>
                        </div>
                    )}
                    {stations.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>City</TableHead>
                                    <TableHead>Country</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stations.map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell className="font-medium">
                                       <Link href={`/admin/stations/${s.id}`} className="hover:underline text-primary">
                                            {s.name}
                                       </Link>
                                    </TableCell>
                                    <TableCell>{s.city}</TableCell>
                                    <TableCell>{s.country}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                         <AlertDialog>
                                             <AlertDialogTrigger asChild>
                                                 <Button variant="destructive" size="icon">
                                                     <Trash2 className="h-4 w-4" />
                                                 </Button>
                                             </AlertDialogTrigger>
                                             <AlertDialogContent>
                                                 <AlertDialogHeader>
                                                 <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                 <AlertDialogDescription>
                                                     This action cannot be undone. This will permanently delete the
                                                     <strong> {s.name}</strong> station.
                                                 </AlertDialogDescription>
                                                 </AlertDialogHeader>
                                                 <AlertDialogFooter>
                                                     <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                     <AlertDialogAction onClick={() => handleDeleteStation(s.id)}>Continue</AlertDialogAction>
                                                 </AlertDialogFooter>
                                             </AlertDialogContent>
                                         </AlertDialog>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>A list of all registered users in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Full Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Date Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.uid}>
                          <TableCell className="font-medium">{u.fullName}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            {u.role === 'admin' ? (<Badge>Admin</Badge>) : (<Badge variant="secondary">User</Badge>)}
                          </TableCell>
                          <TableCell>
                            {u.createdAt ? format(u.createdAt.toDate(), 'PPP') : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><PlusCircle /> Add New Station</CardTitle>
                    <CardDescription>Fill out the form to add a new EV bunk station.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onAddStationSubmit)} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Station Name</Label>
                            <Input id="name" {...register("name", { required: "Station name is required" })} />
                            {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
                        </div>
                         <div>
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" {...register("address", { required: "Address is required" })} />
                             {errors.address && <p className="text-destructive text-sm mt-1">{errors.address.message}</p>}
                        </div>
                         <div>
                            <Label htmlFor="city">City</Label>
                            <Input id="city" {...register("city", { required: "City is required" })} />
                             {errors.city && <p className="text-destructive text-sm mt-1">{errors.city.message}</p>}
                        </div>
                         <div>
                            <Label htmlFor="country">Country</Label>
                            <Input id="country" {...register("country", { required: "Country is required" })} />
                             {errors.country && <p className="text-destructive text-sm mt-1">{errors.country.message}</p>}
                        </div>
                         <div>
                            <Label htmlFor="mobileNumber">Contact Number</Label>
                            <Input id="mobileNumber" {...register("mobileNumber", { required: "Contact number is required" })} />
                             {errors.mobileNumber && <p className="text-destructive text-sm mt-1">{errors.mobileNumber.message}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="latitude">Latitude</Label>
                                <Input id="latitude" type="number" step="any" {...register("latitude", { required: "Latitude is required", valueAsNumber: true })} />
                                {errors.latitude && <p className="text-destructive text-sm mt-1">{errors.latitude.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="longitude">Longitude</Label>
                                <Input id="longitude" type="number" step="any" {...register("longitude", { required: "Longitude is required", valueAsNumber: true })} />
                                {errors.longitude && <p className="text-destructive text-sm mt-1">{errors.longitude.message}</p>}
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add Station"}
                        </Button>
                    </form>
                </CardContent>
             </Card>
        </div>
      </div>
    </div>
  );
}
