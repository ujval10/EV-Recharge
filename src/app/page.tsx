
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { MoveRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem
} from '@/components/ui/carousel';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="relative flex flex-1 w-full items-center justify-center">
        <div className="absolute inset-0 z-0">
          <video
            src="/car.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="object-cover w-full h-full"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl font-extrabold tracking-tight font-headline sm:text-5xl md:text-6xl lg:text-7xl">
            Seamless EV Charging,
            <br />
            <span className="text-primary">Perfectly Timed.</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-neutral-200">
            Find, book, and schedule your electric vehicle charging with our intelligent, AI-powered platform. Never wait for a charger again.
          </p>
          <div className="mt-10">
            <Button asChild size="lg">
              <Link href="/stations">
                Find a Station Now
                <MoveRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}