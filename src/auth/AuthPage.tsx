import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label'; // Assuming Label is available from shadcn/ui

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
    }
    // Supabase's onAuthStateChange listener in App.tsx will handle setting the session
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-sw-background p-4">
      <Card className="w-full max-w-sm bg-sw-surface border border-sw-border text-sw-text rounded-lg shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-sw-primary">{isLogin ? 'Welcome Back' : 'Join StudyWell'}</CardTitle>
          <CardDescription className="text-sw-textSecondary">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-sw-background border-sw-border text-sw-text focus:border-sw-primary focus:ring-sw-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-sw-background border-sw-border text-sw-text focus:border-sw-primary focus:ring-sw-primary"
              />
            </div>
            {error && <p className="text-sw-error text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full bg-sw-primary text-sw-background hover:bg-sw-primary/90" disabled={loading}>
              {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="text-sw-secondary hover:text-sw-secondary/80">
            {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default AuthPage;
