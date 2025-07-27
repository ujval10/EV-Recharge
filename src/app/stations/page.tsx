
'use client';

import { useState, useEffect } from 'react';
import { StationCard } from '@/components/stations/StationCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import type { Station } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function StationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allStations, setAllStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStations = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'stations'));
        const stationsList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          // Convert Firestore GeoPoint to lat/lng object
          return {
            id: doc.id,
            ...data,
            coordinates: {
                lat: data.coordinates.latitude,
                lng: data.coordinates.longitude
            }
          } as Station;
        });
        setAllStations(stationsList);
        setFilteredStations(stationsList);
      } catch (error) {
        console.error("Error fetching stations: ", error);
        // Handle error, maybe show a toast
      } finally {
        setIsLoading(false);
      }
    };

    fetchStations();
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredStations(allStations);
      return;
    }

    const lowercasedQuery = searchQuery.toLowerCase();
    const results = allStations.filter(station =>
      station.name.toLowerCase().includes(lowercasedQuery) ||
      station.city.toLowerCase().includes(lowercasedQuery) ||
      station.country.toLowerCase().includes(lowercasedQuery) ||
      station.address.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredStations(results);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSearch();
  };
  
  const renderSkeletons = () => (
    Array.from({ length: 3 }).map((_, index) => (
       <Card className="overflow-hidden" key={index}>
          <div className="md:flex">
            <div className="md:flex-shrink-0">
               <Skeleton className="h-48 w-full md:h-full md:w-56" />
            </div>
            <div className="p-6 flex flex-col flex-grow w-full">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-1/2 mt-2" />
              <Skeleton className="h-4 w-3/4 mt-2" />
              <div className="mt-4 flex flex-wrap gap-2">
                 <Skeleton className="h-6 w-16" />
                 <Skeleton className="h-6 w-20" />
              </div>
              <div className="mt-auto pt-4 flex items-end justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        </Card>
    ))
  );

  return (
    <div className="container py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline mb-2">Find Your Next Charge</h1>
        <p className="text-xl text-muted-foreground">
          Discover and book EV charging stations near you.
        </p>
        <form onSubmit={handleFormSubmit} className="mt-6 flex flex-col sm:flex-row gap-4 max-w-2xl">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by country, city, address..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </form>
      </header>

      <div className="grid gap-6">
        {isLoading ? renderSkeletons() : filteredStations.length > 0 ? (
          filteredStations.map((station) => (
            <StationCard key={station.id} station={station} />
          ))
        ) : (
          <div className="text-center py-12 col-span-full">
            <h2 className="text-2xl font-semibold">No stations found</h2>
            <p className="text-muted-foreground mt-2">Try a different search term or check if data has been seeded in the admin panel.</p>
            <Button 
              onClick={() => { 
                setSearchQuery(''); 
                setFilteredStations(allStations); 
              }} 
              variant="outline"
              className="mt-4"
            >
                Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

    