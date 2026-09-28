import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { PublicPage, AUTH_CARD, AUTH_COLUMN, AUTH_TITLE, TEXT_LINK } from '@/components/public/PublicPage';

const SignIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log('🔐 [LOGIN] Attempting login with email:', email);
      setLoading(true);
      setError(null);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Handle specific error for email not confirmed
        if (signInError.message.includes('Email not confirmed')) {
             throw new Error('Please verify your email address before logging in.');
        }
        throw signInError;
      }

      console.log('✅ [LOGIN] Login successful', data);
      
      toast({
        title: "Welcome back",
        description: "Successfully signed in",
      });

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ [LOGIN] Error:', err.message);
      setError(err.message || 'Failed to sign in');
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: err.message || "Invalid credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={AUTH_COLUMN}>
      <div className="w-full max-w-md">
        <div className={AUTH_CARD}>
          <div className="text-center mb-8">
            <h1 className={AUTH_TITLE}>Welcome back</h1>
            <p className="text-pl-muted mt-2">Sign in to your unified Petrolord account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div role="alert" className="p-4 bg-pl-danger-bg border border-pl-danger/40 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-pl-danger-text flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-pl-danger-text text-sm">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pl-muted" aria-hidden="true" />
                <Input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="pl-10 h-11"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="signin-password">Password</Label>
                <Link to="/forgot-password" className={`text-sm ${TEXT_LINK}`}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pl-muted" aria-hidden="true" />
                <Input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-pl-muted hover:text-pl-text"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full font-semibold h-11"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center space-y-3 pt-6 border-t border-pl-border">
            <p className="text-pl-muted">
              Don't have an account?{' '}
              <Link to="/signup" className={TEXT_LINK}>
                Sign up for HSE
              </Link>
            </p>
            <p className="text-sm text-pl-muted">
              Looking for Petrolord Suite?{' '}
              <a href="https://petrolord.com" className={TEXT_LINK}>
                Go to Corporate Site
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-pl-muted">
          © 2025 Lordsway Energy. Secure Unified Login.
        </div>
      </div>
    </div>
  );
};

// Batch 3B: the page wraps itself in the public frame (always light, ink brand bar).
const SignInPage = () => (
  <PublicPage testId="signin-theme-scope">
    <SignIn />
  </PublicPage>
);

export default SignInPage;
