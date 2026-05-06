import { supabase } from '@/lib/customSupabaseClient';

/**
 * Handles the complete logout process with timeout protection
 * 1. Calls Supabase signOut (with race condition to prevent hanging)
 * 2. Clears local and session storage
 * 3. Redirects to login
 */
export const logoutUser = async (navigate = null) => {
  console.log('🔒 Starting logout process...');
  
  try {
    // Attempt Supabase sign out, but don't wait forever
    // This fixes the issue where signOut hangs due to network or client state issues
    const signOutPromise = supabase.auth.signOut();
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Race: if signOut takes longer than 2s, proceed anyway
    await Promise.race([signOutPromise, timeoutPromise]);
    
    console.log('✅ Supabase signOut attempted/completed');
  } catch (error) {
    console.error('❌ Logout exception:', error);
  } finally {
    // Step 2: Clear all storage (Critical for security)
    try {
      localStorage.clear();
      sessionStorage.clear();
      console.log('🧹 Local storage cleared');
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
    
    // Step 3: Force redirect
    // Using window.location.href guarantees a full page refresh and state reset
    if (navigate) {
       // Optional: try smooth navigation first if preferred, but hard refresh is safer for logout
       // navigate('/login');
       window.location.href = '/login'; 
    } else {
        window.location.href = '/login';
    }
  }
  
  return true;
};