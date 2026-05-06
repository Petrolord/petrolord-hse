import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { inviteUserService } from '@/services/inviteUserService';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, CheckCircle, XCircle, ShieldCheck, Lock, Eye, EyeOff, LogOut, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function InvitationAcceptance() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Password Form State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    checkSessionAndInvite();
  }, [token]);

  const checkSessionAndInvite = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Invite
      const inviteData = await inviteUserService.validateToken(token);
      if (!inviteData) {
        throw new Error("This invitation is invalid or has expired.");
      }
      setInvite(inviteData);

      // 2. Check Session
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

    } catch (err) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = () => {
    if (password.length < 8) return "Password must be at least 8 characters long";
    if (password !== confirmPassword) return "Passwords do not match";
    if (!/\d/.test(password)) return "Password must contain at least one number";
    return null;
  };

  const handleCreateAccountAndAccept = async (e) => {
    e.preventDefault();
    const validationError = validatePassword();
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    try {
      // 1. Sign Up (Create Account)
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invite.email,
        password: password,
        options: {
          data: {
            full_name: invite.first_name ? `${invite.first_name} ${invite.last_name || ''}`.trim() : null,
            organization_id: invite.org_id
          }
        }
      });

      if (signUpError) throw signUpError;

      // 2. Accept Invitation
      // Note: We need the user ID. signUp returns it.
      if (authData.user) {
        await inviteUserService.acceptInvitation(token, authData.user.id);
        
        toast({
          title: "Account Setup Complete!",
          description: "Your account has been created. Please sign in to continue.",
          className: "bg-green-600 text-white border-none"
        });

        // 3. Explicitly Sign Out to enforce "Set Password -> Login" flow
        await supabase.auth.signOut();
        
        // 4. Redirect to Login
        navigate('/login', { 
          state: { 
            email: invite.email, 
            message: "Account setup complete! Please log in with your new password." 
          } 
        });
      } else {
        // Edge case: Email confirmation required before we get a user/session working fully?
        // Typically signUp returns user object even if unconfirmed.
        throw new Error("Account creation failed. Please try again.");
      }

    } catch (err) {
      if (err.message?.includes("already registered") || err.message?.includes("already exists")) {
        toast({
          title: "Account Already Exists",
          description: "It looks like you already have an account. Please log in to accept the invitation.",
          variant: "default"
        });
        navigate('/login', { state: { returnUrl: `/accept-invite/${token}`, email: invite.email } });
      } else {
        toast({
          title: "Setup Failed",
          description: err.message,
          variant: "destructive"
        });
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleExistingUserAccept = async () => {
    setProcessing(true);
    try {
      await inviteUserService.acceptInvitation(token, currentUser.id);
      toast({
        title: "Welcome aboard!",
        description: `You have successfully joined ${invite.organizations?.name}.`,
      });
      navigate('/dashboard');
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    try {
      await inviteUserService.declineInvitation(token);
      setError("You have declined the invitation.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    window.location.reload();
  };

  // --- Render Helpers ---

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#FFC107]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#1a1a2e] border-[#3a3a5a] text-white">
          <CardHeader className="text-center">
            <div className="mx-auto bg-red-500/10 p-3 rounded-full w-fit mb-4">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle>Invitation Error</CardTitle>
            <CardDescription className="text-[#b0b0c0] mt-2">{error}</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button variant="outline" onClick={() => navigate('/login')} className="border-[#3a3a5a] text-white hover:bg-[#3a3a5a]">
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Determine State:
  // 1. Logged in & Matches Invite -> Show Simple Accept
  // 2. Logged in & Mismatch -> Show Warning
  // 3. Not Logged in -> Show Password Setup

  const isEmailMatch = currentUser && currentUser.email?.toLowerCase() === invite.email?.toLowerCase();

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#FFC107]/5 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md bg-[#1a1a2e] border-[#3a3a5a] text-white z-10 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-[#FFC107]/10 p-3 rounded-full w-fit mb-4">
            <ShieldCheck className="h-8 w-8 text-[#FFC107]" />
          </div>
          <CardTitle className="text-2xl">Team Invitation</CardTitle>
          <CardDescription className="text-[#b0b0c0] mt-2">
            You've been invited to join <strong>{invite.organizations?.name}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Invite Details */}
          <div className="bg-[#252541] rounded-lg p-4 border border-[#3a3a5a]">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#7a7a9a]">Role</p>
                <p className="font-medium text-white capitalize">{invite.role.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-[#7a7a9a]">Invited As</p>
                <p className="font-medium text-white">{invite.email}</p>
              </div>
            </div>
          </div>

          {/* === SCENARIO 1: Logged In User (Mismatch) === */}
          {currentUser && !isEmailMatch && (
            <div className="space-y-4">
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm text-yellow-200">
                You are currently logged in as <strong>{currentUser.email}</strong>, but this invite is for <strong>{invite.email}</strong>.
              </div>
              <Button onClick={handleLogout} variant="outline" className="w-full border-[#3a3a5a] hover:bg-[#252541] text-white">
                <LogOut className="mr-2 h-4 w-4" /> Log out to accept
              </Button>
            </div>
          )}

          {/* === SCENARIO 2: Logged In User (Match) === */}
          {currentUser && isEmailMatch && (
            <div className="space-y-4">
              <p className="text-center text-sm text-[#b0b0c0]">
                You are logged in with the correct account. Click below to join.
              </p>
              <Button 
                className="w-full petrolord-button h-11 text-base font-semibold" 
                onClick={handleExistingUserAccept}
                disabled={processing}
              >
                {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                Join Team Now
              </Button>
            </div>
          )}

          {/* === SCENARIO 3: New User (Setup Password) === */}
          {!currentUser && (
            <form onSubmit={handleCreateAccountAndAccept} className="space-y-4">
              <div className="space-y-3">
                <div className="text-center mb-2">
                  <h3 className="text-lg font-semibold text-white">Set up your account</h3>
                  <p className="text-xs text-[#b0b0c0]">Create a password to access your workspace</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#b0b0c0]">Email</Label>
                  <Input 
                    id="email" 
                    value={invite.email} 
                    disabled 
                    className="bg-[#151525] border-[#3a3a5a] text-[#7a7a9a] cursor-not-allowed" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-[#151525] border-[#3a3a5a] text-white pr-10 focus:ring-[#FFC107]"
                      placeholder="Min. 8 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-[#7a7a9a] hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-[#151525] border-[#3a3a5a] text-white focus:ring-[#FFC107]"
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit"
                  className="w-full petrolord-button h-11 text-base font-semibold" 
                  disabled={processing}
                >
                  {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                  Create Account & Join
                </Button>
                <p className="text-center text-xs text-[#7a7a9a] mt-3">
                  Already have an account? <span onClick={() => navigate('/login')} className="text-[#FFC107] hover:underline cursor-pointer">Log in</span>
                </p>
              </div>
            </form>
          )}
        </CardContent>

        {/* Footer for non-form states or generic actions */}
        {(currentUser || !currentUser) && (
          <CardFooter className="flex justify-center pt-0 pb-6">
             <Button 
              variant="ghost" 
              size="sm"
              className="text-[#7a7a9a] hover:text-red-400 hover:bg-red-900/10 h-8 text-xs"
              onClick={() => setShowDeclineDialog(true)}
              disabled={processing}
            >
              Decline Invitation
            </Button>
          </CardFooter>
        )}
      </Card>

      <AlertDialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <AlertDialogContent className="bg-[#1a1a2e] border-[#3a3a5a] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Decline Invitation?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#b0b0c0]">
              Are you sure you want to decline this invitation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#3a3a5a] text-[#b0b0c0] hover:text-white hover:bg-[#3a3a5a]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDecline}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Decline
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}