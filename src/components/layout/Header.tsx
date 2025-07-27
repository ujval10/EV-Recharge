
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, User as UserIcon, LogOut, Menu, Shield, Map } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';

export function Header() {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, [user]);


  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">EV Recharge Rendezvous</span>
          </Link>
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
             <Link
                href="/stations"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Stations
              </Link>
              <Link
                href="/map"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Map
              </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            {loading ? (
              <div className="h-10 w-24 animate-pulse rounded-md bg-muted" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                      <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                   {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/bookings">
                        <Menu className="mr-2 h-4 w-4" />
                        My Bookings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
