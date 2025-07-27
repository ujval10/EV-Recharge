
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setIsLoading(true);
    setError(null);
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, {
            displayName: fullName
        });

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            fullName: fullName,
            email: email,
            role: 'user', // Assign default user role
            createdAt: serverTimestamp()
        });
        
        toast({
            title: "Account Created!",
            description: "Your account is ready. Please login to continue.",
        });
        router.push('/login');
    } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
            setError('This email address is already in use.');
        } else {
            setError('An unexpected error occurred. Please try again.');
            console.error(err);
        }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-14rem)] py-12">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-center text-sm text-destructive">{error}</p>}
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full name</Label>
              <Input id="full-name" placeholder="Max Robinson" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create an account
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
