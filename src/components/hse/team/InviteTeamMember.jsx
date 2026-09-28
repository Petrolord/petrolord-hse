import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

      const { data, error } = await supabase.functions.invoke('hse-invite-user', {
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
          });
          setEmail("");
          loadInvitations();
          return;
        }

        if (data.success) {
          if (data.emailSent === false && data.inviteLink) {
            await offerLinkFallback(email, data.inviteLink);
          } else {
            toast({
              title: "Invitation Sent",
              description: `Invite sent to ${email}`,
              variant: "success"
            });
          }
          setEmail("");
          loadInvitations();
          return;
        }
      }

      // Fallback success if no specific status fields but no error
      toast({
        title: "Invitation Sent",
        description: `Invite sent to ${email}`,
        variant: "success"
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

      const { data, error } = await supabase.functions.invoke('hse-invite-user', {
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
          });
        } else if (data.emailSent === false && data.inviteLink) {
          await offerLinkFallback(invite.email, data.inviteLink);
        } else {
          toast({
            title: "Invitation Resent",
            description: `Email sent to ${invite.email}`,
            variant: "success"
          });
        }
      } else {
        toast({ 
          title: "Invitation Resent", 
          description: `Email sent to ${invite.email}`,
          variant: "success"
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

  // Email delivery failed but the invitation exists: put the accept link on
  // the clipboard so the admin can share it directly (WhatsApp, chat, etc.).
  const offerLinkFallback = async (recipient, inviteLink) => {
    let copied = false;
    try {
      await navigator.clipboard.writeText(inviteLink);
      copied = true;
    } catch (e) { /* clipboard unavailable; show the link instead */ }
    toast({
      title: "Invite created. Email could not be sent.",
      description: copied
        ? `The invite link for ${recipient} was copied to your clipboard. Share it with them directly.`
        : `Share this link with ${recipient}: ${inviteLink}`,
      duration: 15000
    });
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
        variant: "warning"
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-pl-primary-text" aria-hidden="true" /> Invite New Member
          </CardTitle>
          <CardDescription>
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
                required
              />
            </div>
            <div className="w-full md:w-40">
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger aria-label="Role">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              type="submit" 
              disabled={loading || !currentOrganization?.id} 
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Send Invite
            </Button>
          </form>
        </CardContent>
      </Card>

      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitations.map((invite) => {
                const isResending = resendingIds[invite.id];
                const onCooldown = resendCooldowns[invite.id] > 0;
                
                return (
                  <div key={invite.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-md border border-pl-border bg-pl-sunken p-3 transition-colors hover:border-pl-primary/40">
                    <div className="min-w-0">
                      <p className="text-pl-text font-medium flex flex-wrap items-center gap-2 break-all">
                        {invite.email}
                        {onCooldown && (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Sent
                          </Badge>
                        )}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-pl-muted mt-1">
                        <Badge variant="neutral" className="capitalize">{invite.role}</Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden="true" /> 
                          Last sent: {new Date(invite.created_at).toLocaleDateString()} {new Date(invite.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleResend(invite)}
                      disabled={isResending || onCooldown}
                      className="self-start sm:self-auto min-w-[100px]"
                    >
                      {isResending ? (
                        <Loader2 className="h-4 w-4 animate-spin text-pl-primary-text" />
                      ) : onCooldown ? (
                        <span className="text-xs font-pl-mono tabular-nums text-pl-muted">Wait {resendCooldowns[invite.id]}s</span>
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

  const secret = (name, value) => (
    <div className="grid grid-cols-[64px_1fr] sm:grid-cols-[160px_1fr] gap-2 my-2 text-xs font-pl-mono">
      <span className="text-pl-muted">Name:</span>
      <span className="text-pl-text font-semibold break-all">{name}</span>
      <span className="text-pl-muted">Value:</span>
      <span className="text-pl-text break-all">{value}</span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-pl-warning-bg">
              <AlertTriangle className="h-6 w-6 text-pl-warning-text" aria-hidden="true" />
            </div>
            <DialogTitle className="text-xl">Brevo Configuration Required</DialogTitle>
          </div>
          <DialogDescription>
            We couldn't send the email because the Brevo email service is missing credentials. Follow these steps to fix it.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Error Context Display */}
          {errorContext && (
            <div className="rounded border border-pl-danger/40 bg-pl-danger-bg p-3 text-sm text-pl-danger-text font-pl-mono break-all">
              Error: {errorContext}
            </div>
          )}

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-pl-primary/10 text-pl-primary-text font-bold border border-pl-primary/30">1</div>
              <div className="space-y-2 flex-1 min-w-0">
                <h4 className="font-medium text-pl-text flex flex-wrap items-center gap-2">
                  Get your SMTP Credentials from Brevo
                  <a href="https://app.brevo.com/settings/keys/smtp" target="_blank" rel="noreferrer" className="text-pl-primary-text hover:text-pl-primary-text-hover inline-flex items-center text-xs">
                    Open SMTP Settings <ExternalLink className="h-3 w-3 ml-1" aria-hidden="true" />
                  </a>
                </h4>
                <p className="text-sm text-pl-muted">Log in to Brevo (Sendinblue) and generate a new SMTP key/password.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-pl-primary/10 text-pl-primary-text font-bold border border-pl-primary/30">2</div>
              <div className="space-y-2 flex-1 min-w-0">
                <h4 className="font-medium text-pl-text">Update Supabase Secrets</h4>
                <div className="text-sm text-pl-muted space-y-2 rounded border border-pl-border bg-pl-sunken p-3">
                  <p>1. Go to your Supabase Project Dashboard.</p>
                  <p>2. Navigate to <strong>Settings</strong> {'>'} <strong>Edge Functions</strong> (or Secrets).</p>
                  <p>3. Add these new secrets:</p>
                  {secret('BREVO_SMTP_HOST', 'smtp-relay.brevo.com')}
                  {secret('BREVO_SMTP_PORT', '587')}
                  {secret('BREVO_SMTP_USER', 'Your Login Email')}
                  {secret('BREVO_SMTP_PASSWORD', 'Your Master Password/SMTP Key')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between items-center gap-4">
          <p className="text-xs text-pl-muted hidden sm:block">
            <ShieldCheck className="h-3 w-3 inline mr-1" aria-hidden="true" /> 
            Secrets are encrypted and safe.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
            <Button onClick={onRetry}>
              <Check className="h-4 w-4 mr-2" /> I've Updated the Secret
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
