import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useHSE } from '@/context/HSEContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, Users, FileText, Activity, 
  Search, UserPlus, Mail, Clock, CheckCircle, Trash2, RefreshCcw, Loader2
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
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
import OrgAdminSettings from '@/components/admin/OrgAdminSettings';
import InviteUserModal from '@/components/admin/InviteUserModal';
import { inviteUserService } from '@/services/inviteUserService';

export default function OrgAdminDashboard() {
  const { currentOrganization, isLoading: contextLoading } = useHSE();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedInviteId, setSelectedInviteId] = useState(null);

  // LOGGING FOR DEBUGGING
  useEffect(() => {
    console.log("📊 [OrgAdminDashboard] Mount", { 
        currentOrganization, 
        contextLoading 
    });
  }, [currentOrganization, contextLoading]);

  useEffect(() => {
    if (currentOrganization?.id) {
      loadInvitations();
    }
  }, [currentOrganization]);

  const loadInvitations = async () => {
    if (!currentOrganization) return;
    setLoadingInvites(true);
    try {
      console.log("🔍 [OrgAdminDashboard] Loading invitations for:", currentOrganization.id);
      const data = await inviteUserService.getInvitations(currentOrganization.id);
      setInvitations(data || []);
    } catch (error) {
      console.error("❌ [OrgAdminDashboard] Failed to load invitations", error);
      toast({ 
          title: "Error loading invitations", 
          description: "Could not fetch invitation list.", 
          variant: "destructive" 
      });
    } finally {
      setLoadingInvites(false);
    }
  };

  const handleResend = async (invite) => {
    const link = `${window.location.origin}/accept-invite/${invite.token}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link Copied", description: "Invitation link copied to clipboard." });
  };

  const handleCancelClick = (id) => {
    setSelectedInviteId(id);
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedInviteId) return;
    try {
      await inviteUserService.cancelInvitation(selectedInviteId);
      toast({ title: "Invitation Canceled" });
      loadInvitations();
    } catch (error) {
      toast({ title: "Error", description: "Failed to cancel.", variant: "destructive" });
    } finally {
      setShowCancelDialog(false);
      setSelectedInviteId(null);
    }
  };

  const filteredInvites = invitations.filter(inv => 
    (inv.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (inv.status?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  // HANDLING LOADING STATE
  if (contextLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#b0b0c0]">
            <Loader2 className="h-10 w-10 animate-spin text-[#FFC107] mb-4" />
            <p>Loading Organization Data...</p>
        </div>
      );
  }

  // HANDLING MISSING ORGANIZATION
  if (!currentOrganization) {
      console.warn("⚠️ [OrgAdminDashboard] No organization found in context.");
      return (
        <DashboardLayout 
            title="Organization Administration" 
            description="Manage your organization settings."
        >
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#b0b0c0] bg-[#252541] rounded-lg border border-[#3a3a5a] p-8">
                <Building2 className="h-16 w-16 text-[#FFC107] mb-4 opacity-50" />
                <h2 className="text-xl font-bold text-white mb-2">No Organization Found</h2>
                <p className="max-w-md text-center mb-6">
                    You don't seem to be linked to an active organization. Please contact support or create a new organization.
                </p>
                <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                    className="border-[#3a3a5a] text-white hover:bg-[#3a3a5a]"
                >
                    Retry Loading
                </Button>
            </div>
        </DashboardLayout>
      );
  }

  return (
    <DashboardLayout 
      title="Organization Administration" 
      description={`Manage settings for ${currentOrganization.name}`}
      actions={
        <Button 
          className="petrolord-button" 
          onClick={() => setIsInviteModalOpen(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" /> Invite User
        </Button>
      }
    >
      <Tabs defaultValue="overview" className="w-full space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-[#252541] border border-[#3a3a5a] text-[#b0b0c0] w-full md:w-auto grid grid-cols-2 md:inline-flex h-auto">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black py-2.5">Overview</TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black py-2.5">Team & Invites</TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black py-2.5">Settings & Branding</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#252541] border-[#3a3a5a]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#b0b0c0]">Total Members</CardTitle>
                <Users className="h-4 w-4 text-[#FFC107]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{currentOrganization.member_count || '0'}</div>
                <p className="text-xs text-[#7a7a9a] mt-1">Active users in organization</p>
              </CardContent>
            </Card>
            <Card className="bg-[#252541] border-[#3a3a5a]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#b0b0c0]">Subscription</CardTitle>
                <FileText className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white capitalize">{currentOrganization.subscription_tier || 'Free'}</div>
                <p className="text-xs text-[#7a7a9a] mt-1">Current plan status</p>
              </CardContent>
            </Card>
            <Card className="bg-[#252541] border-[#3a3a5a]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#b0b0c0]">Assets Managed</CardTitle>
                <Activity className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{currentOrganization.asset_count || '0'}</div>
                <p className="text-xs text-[#7a7a9a] mt-1">Total tracked assets</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TEAM & INVITES TAB */}
        <TabsContent value="team" className="space-y-6">
          <div className="flex justify-between items-center bg-[#252541] p-4 rounded-lg border border-[#3a3a5a]">
             <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a7a9a]" />
                <Input 
                    placeholder="Search invitations..." 
                    className="pl-9 bg-[#1a1a2e] border-[#3a3a5a] text-white w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Button variant="outline" className="border-[#3a3a5a] text-[#b0b0c0] hover:text-white ml-4" onClick={loadInvitations}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>

          <Card className="bg-[#252541] border-[#3a3a5a]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-[#FFC107]"/> Sent Invitations</CardTitle>
              <CardDescription className="text-[#7a7a9a]">Manage pending and accepted invitations for your organization.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
               {loadingInvites ? (
                 <div className="p-8 text-center text-[#b0b0c0] flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin"/> Loading invitations...
                 </div>
               ) : (
                 <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left">
                    <thead className="text-[#7a7a9a] border-b border-[#3a3a5a] bg-[#1a1a2e]/50">
                      <tr>
                        <th className="py-4 px-6 font-medium">Email / Name</th>
                        <th className="py-4 px-6 font-medium">Role</th>
                        <th className="py-4 px-6 font-medium">Department</th>
                        <th className="py-4 px-6 font-medium">Status</th>
                        <th className="py-4 px-6 font-medium">Sent</th>
                        <th className="py-4 px-6 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#e0e0e0]">
                      {filteredInvites.length === 0 && (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-[#7a7a9a]">No invitations found.</td>
                        </tr>
                      )}
                      {filteredInvites.map((invite) => (
                        <tr key={invite.id} className="border-b border-[#3a3a5a]/50 hover:bg-[#2d2d4a] transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-medium text-white">{invite.email}</div>
                            <div className="text-xs text-[#7a7a9a]">{invite.first_name} {invite.last_name}</div>
                          </td>
                          <td className="py-4 px-6 capitalize">{invite.role.replace('_', ' ')}</td>
                          <td className="py-4 px-6 text-[#b0b0c0]">{invite.departments?.name || '-'}</td>
                          <td className="py-4 px-6">
                            <Badge className={`
                              ${invite.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : ''}
                              ${invite.status === 'accepted' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                              ${invite.status === 'declined' || invite.status === 'expired' ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''}
                            `}>
                              {invite.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-[#7a7a9a]">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(invite.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                             {invite.status === 'pending' && (
                               <div className="flex justify-end gap-2">
                                 <Button variant="ghost" size="sm" onClick={() => handleResend(invite)} title="Resend Link">
                                   <RefreshCcw className="h-4 w-4 text-blue-400" />
                                 </Button>
                                 <Button variant="ghost" size="sm" onClick={() => handleCancelClick(invite.id)} title="Cancel Invite">
                                   <Trash2 className="h-4 w-4 text-red-400" />
                                 </Button>
                               </div>
                             )}
                             {invite.status === 'accepted' && (
                               <CheckCircle className="h-5 w-5 text-green-500 ml-auto opacity-50" />
                             )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                 </div>
               )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <OrgAdminSettings />
        </TabsContent>
      </Tabs>

      <InviteUserModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)}
        orgId={currentOrganization?.id}
        onInviteSent={loadInvitations}
      />

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="bg-[#1a1a2e] border-[#3a3a5a] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Invitation?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#b0b0c0]">
              Are you sure you want to cancel this invitation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#3a3a5a] text-[#b0b0c0] hover:text-white hover:bg-[#3a3a5a]">
              Keep Invitation
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Cancel Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </DashboardLayout>
  );
}