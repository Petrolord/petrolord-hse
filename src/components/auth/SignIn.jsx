import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

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
        className: "bg-green-600 text-white border-none"
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
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFC107]/10 border border-[#FFC107]/30 rounded-lg mb-4">
            <div className="w-8 h-8 bg-[#FFC107] rounded-full flex items-center justify-center">
              <span className="text-[#1a1a2e] font-bold text-lg">⚡</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-[#b0b0c0]">Sign in to your unified Petrolord account</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#252541]/90 border border-[#3a3a5a] rounded-lg p-8 shadow-xl">
            <form onSubmit={handleLogin} className="space-y-6">
            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm">{error}</p>
                </div>
            )}

            {/* Email Field */}
            <div>
                <label className="block text-sm font-medium text-[#e0e0e0] mb-2">Email Address</label>
                <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-[#7a7a9a]" />
                <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="pl-10 bg-white border-0 text-black focus:ring-2 focus:ring-[#FFC107]"
                    disabled={loading}
                    required
                />
                </div>
            </div>

            {/* Password Field */}
            <div>
                <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[#e0e0e0]">Password</label>
                <Link to="/forgot-password" className="text-sm text-[#FFC107] hover:text-[#ffb300]">
                    Forgot password?
                </Link>
                </div>
                <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-[#7a7a9a]" />
                <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-white border-0 text-black focus:ring-2 focus:ring-[#FFC107]"
                    disabled={loading}
                    required
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#7a7a9a] hover:text-[#505068]"
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
                className="w-full bg-[#FFC107] hover:bg-[#ffb300] text-[#1a1a2e] font-bold py-2 h-11"
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
            <div className="mt-6 text-center space-y-3 pt-6 border-t border-[#3a3a5a]">
            <p className="text-[#b0b0c0]">
                Don't have an account?{' '}
                <Link
                to="/signup"
                className="text-[#FFC107] hover:text-[#ffb300] font-semibold transition-colors"
                >
                Sign up for HSE
                </Link>
            </p>
            <p className="text-sm text-[#7a7a9a]">
                Looking for Petrolord Suite?{' '}
                <a href="https://petrolord.com" className="text-[#b0b0c0] hover:text-white transition-colors">
                Go to Corporate Site
                </a>
            </p>
            </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-[#7a7a9a]">
          © 2025 Lordsway Energy. Secure Unified Login.
        </div>
      </div>
    </div>
  );
};

export default SignIn;