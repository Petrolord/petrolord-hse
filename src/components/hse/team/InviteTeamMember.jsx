import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Mail, Send, RefreshCw, Clock, CheckCircle2, AlertTriangle, ExternalLink, Key, ShieldCheck, Check } from "lucide-react";
import { supabase } from '@/lib/customSupabaseClient';
import { useHSE } from '@/context/HSEContext';

export default function InviteTeamMember() {
  const { currentOrganization } = useHSE();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [resendCooldowns, setResendCooldowns] = useState({});
  const [resendingIds, setResendingIds] = useState({}); 
  
  // Configuration Guidance State
  const [showConfigHelp, setShowConfigHelp] = useState(false);
  const [configErrorContext, setConfigErrorContext] = useState("");

  // Ensure we have an organization ID before loading data
  useEffect(() => {
    if (currentOrganization?.id) {
      loadInvitations();
    }
  }, [currentOrganization]);

  // Timer for cooldowns management
  useEffect(() => {
    const timer = setInterval(() => {
      setResendCooldowns(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(key => {
          if (next[key] > 0) {
            next[key] -= 1;
            changed = true;
          } else {
            delete next[key];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadInvitations = async () => {
    if (!currentOrganization?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('org_id', currentOrganization.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setInvitations(data || []);
    } catch (err) {
      console.error("Failed to load invites", err);
      toast({
        title: "Error Loading Invites",
        description: "Could not fetch pending invitations.",
        variant: "destructive"
      });
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast({ title: "Email Required", description: "Please enter an email address.", variant: "destructive" });
      return;
    }
    if (!currentOrganization?.id) {
      toast({ title: "Organization Error", description: "Organization context missing. Please refresh.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to send invites.");

      // Default access for new team members
      const defaultModules = ['HSE'];
      const defaultApps = ['hse'];

      // Get user profile name if available
      let inviterName = user.email;
      const { data: profile } = await supabase.from('user_profiles').select('full_name').eq('id', user.id).single();
      if (profile?.full_name) {
        inviterName = profile.full_name;
      }

      const payload = {
        email: email.trim(),
        organization_id: currentOrganization.id,
        role: role,
        modules: defaultModules,
        apps: defaultApps,
        orgName: currentOrganization.name,
        inviterName: inviterName,
        // Backward compatibility if function still expects old keys
        org_id: currentOrganization.id, 
        invited_by: user.id
      };

      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: payload
      });

      if (error) {
        handleInviteError(error);
        return; // Stop execution to prevent success toast
      }
      
      // Handle explicit error or warning in response data
      if (data) {
        if (data.error) {
          handleInviteError(new Error(data.error));
          return;
        }
        
        if (data.warning) {
          toast({
            title: "Invitation Warning",
            description: data.warning,
            className: "bg-yellow-600 text-white border-none"
          });
          setEmail("");
          loadInvitations();
          return;
        }

        if (data.success) {
          toast({
            title: "Invitation Sent",
            description: `Invite sent to ${email}`,
            className: "bg-green-600 text-white border-none"
          });
          setEmail("");
          loadInvitations();
          return;
        }
      }

      // Fallback success if no specific status fields but no error
      toast({
        title: "Invitation Sent",
        description: `Invite sent to ${email}`,
        className: "bg-green-600 text-white border-none"
      });
      
      setEmail("");
      loadInvitations(); 
    } catch (err) {
      handleInviteError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (invite) => {
    if (resendingIds[invite.id] || resendCooldowns[invite.id] > 0) return;
    if (!currentOrganization?.id) return;

    setResendingIds(prev => ({ ...prev, [invite.id]: true }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get user profile name if available
      let inviterName = user.email;
      const { data: profile } = await supabase.from('user_profiles').select('full_name').eq('id', user.id).single();
      if (profile?.full_name) {
        inviterName = profile.full_name;
      }

      const defaultModules = ['HSE'];
      const defaultApps = ['hse'];

      const payload = {
        email: invite.email,
        organization_id: currentOrganization.id,
        role: invite.role, 
        modules: defaultModules,
        apps: defaultApps,
        orgName: currentOrganization.name,
        inviterName: inviterName,
        is_resend: true,
        // Backward compatibility
        org_id: currentOrganization.id,
        invited_by: user.id
      };

      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: payload
      });

      if (error) {
        // We wrap this in a promise rejection to use the common error handler
        // but we need to await the error body parsing first usually. 
        // handleInviteError handles raw error objects or Error instances.
        await handleInviteError(error);
        return;
      }

      if (data) {
        if (data.error) {
          handleInviteError(new Error(data.error));
          return;
        }
        if (data.warning) {
           toast({
            title: "Resend Warning",
            description: data.warning,
            className: "bg-yellow-600 text-white border-none"
          });
        } else {
          toast({ 
            title: "Invitation Resent", 
            description: `Email sent to ${invite.email}`,
            className: "bg-blue-600 text-white border-none"
          });
        }
      } else {
        toast({ 
          title: "Invitation Resent", 
          description: `Email sent to ${invite.email}`,
          className: "bg-blue-600 text-white border-none"
        });
      }
      
      setResendCooldowns(prev => ({ ...prev, [invite.id]: 30 }));
      loadInvitations(); 
    } catch (err) {
      handleInviteError(err);
    } finally {
      setResendingIds(prev => {
        const next = { ...prev };
        delete next[invite.id];
        return next;
      });
    }
  };

  const handleInviteError = async (error) => {
    console.error("❌ [INVITE] Error caught:", error);
    
    let message = error.message || "An unexpected error occurred.";
    
    // Try to parse detailed error from response body if possible
    if (error instanceof Response || (error.context && error.context.json)) {
       try {
         const errBody = await (error.json ? error.json() : error.context.json());
         message = errBody.error || message;
       } catch (e) {}
    }

    // Detect Configuration Issues (Checking for Brevo/SMTP terms)
    const isConfigError = 
      message.includes("Brevo") || 
      message.includes("BREVO_API_KEY") ||
      message.includes("API Key not configured") ||
      message.includes("authentication failed") ||
      message.includes("SMTP Credentials");

    if (isConfigError) {
      setConfigErrorContext(message);
      setShowConfigHelp(true);
      toast({
        title: "Configuration Required",
        description: "The Email service needs to be configured.",
        variant: "warning", 
        className: "bg-yellow-600 text-white border-none"
      });
    } else {
      toast({
        title: "Invitation Failed",
        description: message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1f1f35] border-[#3a3a5a]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-400" /> Invite New Member
          </CardTitle>
          <CardDescription className="text-gray-400">
            Send an email invitation to join your organization via Brevo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input 
                placeholder="colleague@company.com" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#1a1a2e] border-[#3a3a5a] text-white focus:ring-blue-500"
                required
              />
            </div>
            <div className="w-full md:w-40">
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="bg-[#1a1a2e] border-[#3a3a5a] text-white">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-[#3a3a5a] text-white">
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              type="submit" 
              disabled={loading || !currentOrganization?.id} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Send Invite
            </Button>
          </form>
        </CardContent>
      </Card>

      {invitations.length > 0 && (
        <Card className="bg-[#1f1f35] border-[#3a3a5a]">
          <CardHeader>
            <CardTitle className="text-white text-lg">Pending Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitations.map((invite) => {
                const isResending = resendingIds[invite.id];
                const onCooldown = resendCooldowns[invite.id] > 0;
                
                return (
                  <div key={invite.id} className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded border border-[#3a3a5a] transition-all hover:border-blue-500/30">
                    <div>
                      <p className="text-white font-medium flex items-center gap-2">
                        {invite.email}
                        {onCooldown && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Sent
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span className="capitalize bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded border border-blue-900/50">{invite.role}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> 
                          Last sent: {new Date(invite.created_at).toLocaleDateString()} {new Date(invite.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleResend(invite)}
                      disabled={isResending || onCooldown}
                      className="text-gray-400 hover:text-white hover:bg-[#2d2d4a] transition-colors min-w-[100px]"
                    >
                      {isResending ? (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                      ) : onCooldown ? (
                        <span className="text-xs font-mono text-blue-400">Wait {resendCooldowns[invite.id]}s</span>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" /> Resend
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <BrevoConfigDialog 
        open={showConfigHelp} 
        onOpenChange={setShowConfigHelp} 
        errorContext={configErrorContext} 
        onRetry={() => {
          setShowConfigHelp(false);
          // Optional: automatically retry the last action or just let user click again
        }}
      />
    </div>
  );
}

function BrevoConfigDialog({ open, onOpenChange, errorContext, onRetry }) {
  const [apiKey, setApiKey] = useState("");
  const [isValid, setIsValid] = useState(null);

  const validateKey = () => {
    // Basic format check for Brevo V3 keys (usually start with xkeysib-)
    if (apiKey.trim().startsWith("xkeysib-")) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a2e] border-[#3a3a5a] text-white sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/20 rounded-full">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            </div>
            <DialogTitle className="text-xl">Brevo Configuration Required</DialogTitle>
          </div>
          <DialogDescription className="text-gray-400">
            We couldn't send the email because the Brevo email service is missing credentials. Follow these steps to fix it.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Error Context Display */}
          {errorContext && (
            <div className="bg-red-950/30 border border-red-900/50 p-3 rounded text-sm text-red-200 font-mono break-all">
              Error: {errorContext}
            </div>
          )}

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-blue-900/50 text-blue-400 font-bold border border-blue-800">1</div>
              <div className="space-y-2 flex-1">
                <h4 className="font-medium text-white flex items-center gap-2">
                  Get your SMTP Credentials from Brevo
                  <a href="https://app.brevo.com/settings/keys/smtp" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 inline-flex items-center text-xs">
                    Open SMTP Settings <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </h4>
                <p className="text-sm text-gray-400">Log in to Brevo (Sendinblue) and generate a new SMTP key/password.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-blue-900/50 text-blue-400 font-bold border border-blue-800">2</div>
              <div className="space-y-2 flex-1">
                <h4 className="font-medium text-white">Update Supabase Secrets</h4>
                <div className="text-sm text-gray-400 space-y-2 bg-[#0f172a] p-3 rounded border border-[#3a3a5a]">
                  <p>1. Go to your Supabase Project Dashboard.</p>
                  <p>2. Navigate to <strong>Settings</strong> {'>'} <strong>Edge Functions</strong> (or Secrets).</p>
                  <p>3. Add these new secrets:</p>
                  <div className="grid grid-cols-[160px_1fr] gap-2 my-2 text-xs font-mono">
                    <span className="text-gray-500">Name:</span>
                    <span className="text-yellow-400">BREVO_SMTP_HOST</span>
                    <span className="text-gray-500">Value:</span>
                    <span className="text-blue-300">smtp-relay.brevo.com</span>
                  </div>
                  <div className="grid grid-cols-[160px_1fr] gap-2 my-2 text-xs font-mono">
                    <span className="text-gray-500">Name:</span>
                    <span className="text-yellow-400">BREVO_SMTP_PORT</span>
                    <span className="text-gray-500">Value:</span>
                    <span className="text-blue-300">587</span>
                  </div>
                  <div className="grid grid-cols-[160px_1fr] gap-2 my-2 text-xs font-mono">
                    <span className="text-gray-500">Name:</span>
                    <span className="text-yellow-400">BREVO_SMTP_USER</span>
                    <span className="text-gray-500">Value:</span>
                    <span className="text-blue-300">Your Login Email</span>
                  </div>
                  <div className="grid grid-cols-[160px_1fr] gap-2 my-2 text-xs font-mono">
                    <span className="text-gray-500">Name:</span>
                    <span className="text-yellow-400">BREVO_SMTP_PASSWORD</span>
                    <span className="text-gray-500">Value:</span>
                    <span className="text-blue-300">Your Master Password/SMTP Key</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between items-center gap-4">
          <p className="text-xs text-gray-500 hidden sm:block">
            <ShieldCheck className="h-3 w-3 inline mr-1" /> 
            Secrets are encrypted and safe.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
            <Button onClick={onRetry} className="bg-green-600 hover:bg-green-700 text-white">
              <Check className="h-4 w-4 mr-2" /> I've Updated the Secret
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}