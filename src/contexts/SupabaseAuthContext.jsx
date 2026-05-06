import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Track if we've mounted to prevent double-initialization logic
  const isMounted = useRef(false);

  // FIXED: Removed 'user' dependency to prevent infinite loop
  const getSession = useCallback(async () => {
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      setSession(currentSession);
      
      if (currentSession) {
        // Fetch full user data including user_metadata
        const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        // Get organization_id from user metadata
        let organizationId = supabaseUser?.user_metadata?.organization_id;

        // Fallback: try public.users if metadata is missing
        if (!organizationId) {
          const { data: publicUserData } = await supabase
            .from('users')
            .select('organization_id')
            .eq('id', supabaseUser.id)
            .maybeSingle();

          if (publicUserData?.organization_id) {
            organizationId = publicUserData.organization_id;
            // Optimistically update the user object we use in app
            supabaseUser.user_metadata = { 
              ...supabaseUser.user_metadata, 
              organization_id: organizationId 
            };
          }
        }

        setUser(prevUser => {
            // Deep equality check to prevent unnecessary re-renders
            if (
                prevUser?.id === supabaseUser.id && 
                prevUser?.email === supabaseUser.email && 
                prevUser?.user_metadata?.organization_id === organizationId
            ) {
                return prevUser;
            }
            return supabaseUser;
        });

      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth context initialization error:', err);
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array ensures stability

  useEffect(() => {
    isMounted.current = true;
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession) {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
              // Re-fetch user details to ensure metadata is fresh
              const { data: { user: supabaseUser } } = await supabase.auth.getUser();
              
              if (supabaseUser) {
                  setUser(prev => {
                      if (prev?.id === supabaseUser.id && 
                          JSON.stringify(prev?.user_metadata) === JSON.stringify(supabaseUser.user_metadata)) {
                          return prev;
                      }
                      return supabaseUser;
                  });
              }

              if (event === 'SIGNED_IN' && location.pathname === '/login') {
                navigate('/dashboard');
              }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          if (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/suite')) {
              navigate('/login');
          }
        }
      }
    );

    return () => {
      isMounted.current = false;
      authListener.subscription.unsubscribe();
    };
  }, [getSession, navigate, location.pathname]);

  const signIn = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } else if (data.user) {
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.email}!`,
      });
      navigate('/dashboard');
    }
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      setUser(null);
      setSession(null);
      navigate('/login');
    }
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signIn,
    signOut,
    reloadUser: getSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};