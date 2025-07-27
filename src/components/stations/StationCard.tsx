
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star } from 'lucide-react';
import type { Station } from '@/lib/types';

interface StationCardProps {
  station: Station;
}

export function StationCard({ station }: StationCardProps) {
  const availableBunks = station.bunks.filter(b => b.status === 'available').length;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="md:flex">
        <div className="md:flex-shrink-0 relative h-48 w-full md:h-full md:w-56">
          <Image
            className="object-cover"
            src={station.imageUrl}
            alt={`Charging station ${station.name}`}
            fill
            sizes="(max-width: 768px) 100vw, 224px"
            data-ai-hint={station.imageHint}
          />
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center justify-between">
             <div className="uppercase tracking-wide text-sm text-primary font-semibold font-headline">{station.city}</div>
             <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="ml-1 font-bold">{station.rating}</span>
                <span className="ml-2 text-sm text-muted-foreground">({station.reviewCount} reviews)</span>
             </div>
          </div>

          <Link href={`/stations/${station.id}`} className="block mt-1 text-xl leading-tight font-semibold font-headline hover:underline">
            {station.name}
          </Link>
          <p className="mt-2 text-muted-foreground flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            {station.address}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {station.amenities.map(amenity => (
              <Badge key={amenity} variant="secondary">{amenity}</Badge>
            ))}
          </div>
          <div className="mt-auto pt-4 flex items-end justify-between">
            <div>
              <p className="font-semibold text-accent">{availableBunks} bunks available now</p>
            </div>
            <Button asChild>
              <Link href={`/stations/${station.id}`}>View Details</Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
