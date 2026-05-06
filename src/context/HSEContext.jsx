import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { hseQueries } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export const HSEContext = createContext(null);

const SUPER_ADMIN_EMAILS = [
  'info@petrolord.com',
  'ayoasaolu@gmail.com',
  'ayodejiasaolu1@gmail.com',
  'support@petrolord.com'
];

export function HSEProvider({ children }) {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [currentOrganization, setCurrentOrganization] = useState(null);
  const [organizations, setOrganizations] = useState([]); 
  const [allOrgMemberships, setAllOrgMemberships] = useState([]); 
  
  const [realRole, setRealRole] = useState(null); 
  const [simulatedRole, setSimulatedRole] = useState(null);
  const [userModules, setUserModules] = useState([]); 
  const [accessLevel, setAccessLevel] = useState('none'); 
  const [subscription, setSubscription] = useState(null);
  
  const [usageMetrics, setUsageMetrics] = useState(null);
  const [limits, setLimits] = useState({
    email_limit: 25,
    image_limit: 5,
    video_limit: 0
  });

  const [activeModule, setActiveModule] = useState({ 
    id: 'hse', 
    label: 'HSE Management',
    color: '#FFC107'
  });

  // Real-time Sidebar Counts
  const [sidebarCounts, setSidebarCounts] = useState({
    incidents: 0,
    observations: 0,
    actions: 0
  });

  const fetchSidebarCounts = async (orgId) => {
    if (!orgId) return;
    try {
      const { count: incidentsCount } = await supabase
        .from('incidents')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'open')
        .in('report_type', ['Incident', 'Near Miss', 'Accident']);

      const { count: observationsCount } = await supabase
        .from('incidents')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
        .eq('status', 'open')
        .in('report_type', ['Safety Observation', 'Hazard Identification', 'Behavioral', 'Unsafe Act', 'Unsafe Condition']);

      const { count: actionsCount } = await supabase
        .from('tasks') 
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');
        
      setSidebarCounts({
        incidents: incidentsCount || 0,
        observations: observationsCount || 0,
        actions: actionsCount || 0
      });
    } catch (e) {
      console.error("Error fetching sidebar counts:", e);
    }
  };

  const refreshContext = async () => {
    // Only show loading if we don't have data yet
    if (!currentUser && !currentOrganization) {
        setIsLoading(true);
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setIsAuthenticated(false);
        setRealRole(null);
        setSimulatedRole(null);
        setCurrentUser(null);
        setOrganizations([]);
        setCurrentOrganization(null);
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);
      const userId = session.user.id;
      const userEmail = session.user.email;
      const isSuperAdminEmail = SUPER_ADMIN_EMAILS.includes(userEmail);
      
      setCurrentUser({
        id: userId,
        email: userEmail,
        name: session.user.user_metadata?.full_name || userEmail.split('@')[0],
        avatar: session.user.user_metadata?.avatar_url,
        role: isSuperAdminEmail ? 'super_admin' : 'staff_admin'
      });

      if (isSuperAdminEmail) {
        setRealRole('super_admin');
        setAccessLevel('premium');
        setLimits({ email_limit: -1, image_limit: -1, video_limit: -1 });
        if(activeModule.id === 'hse') setActiveModule({ id: 'dashboard', label: 'Dashboard', color: '#FFC107' });

        try {
          const { data: memberships } = await supabase
            .from('organization_users')
            .select(`*, organization:organizations(*)`)
            .eq('user_id', userId);
            
          if (memberships && memberships.length > 0) {
            setAllOrgMemberships(memberships);
            const userOrgs = memberships.map(m => m.organization).filter(Boolean);
            setOrganizations(userOrgs);
            
            // Only set if not already set to prevent loop
            if (!currentOrganization && userOrgs.length > 0) {
                setCurrentOrganization(userOrgs[0]);
            }
          }
        } catch (err) { console.warn("Super Admin fetch error:", err); }

      } else {
        const { data: memberships, error: memError } = await supabase
            .from('organization_users')
            .select(`*, organization:organizations(*)`)
            .eq('user_id', userId);

        if (memError) throw memError;

        setAllOrgMemberships(memberships || []);
        const userOrgs = memberships?.map(m => m.organization).filter(Boolean) || [];
        setOrganizations(userOrgs);

        let activeMembership = null;
        
        if (currentOrganization && memberships?.some(m => m.organization_id === currentOrganization.id)) {
            activeMembership = memberships.find(m => m.organization_id === currentOrganization.id);
        } 
        else if (memberships?.length > 0) {
            activeMembership = memberships[0];
        }

        if (activeMembership) {
            setRealRole(activeMembership.user_role || 'staff_admin');
            setUserModules(activeMembership.modules || []);
            
            // Only update if organization truly changed
            if (!currentOrganization || currentOrganization.id !== activeMembership.organization.id) {
                setCurrentOrganization(activeMembership.organization);
            }
            
            setSubscription({
                tier: activeMembership.organization?.subscription_tier || 'free',
                status: 'active',
                ...activeMembership.organization
            });
        } else {
            if (userOrgs.length > 0 && !currentOrganization) {
                setCurrentOrganization(userOrgs[0]);
            }
        }
      }

      // Access Check
      try {
          const { data: accessData } = await hseQueries.checkHSEAccess(userId);
          if (accessData?.has_hse_access) {
             setAccessLevel(accessData.access_level);
             setLimits({
               email_limit: accessData.email_limit,
               image_limit: accessData.image_limit,
               video_limit: accessData.video_limit
             });
          } else {
             setAccessLevel('none');
          }
      } catch (e) { console.log("Access check warning", e); }

    } catch (err) {
      console.error('Context refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetCurrentOrganization = (org) => {
    const membership = allOrgMemberships.find(m => m.organization_id === org.id);
    if (membership || realRole === 'super_admin') {
      setCurrentOrganization(org);
      // Removed immediate fetchSidebarCounts here, useEffect will handle it
      
      if (realRole !== 'super_admin') {
         setRealRole(membership?.user_role || 'staff_admin');
         setUserModules(membership?.modules || []);
      }
      setSubscription({
        tier: org.subscription_tier || 'free',
        status: 'active',
        ...org
      });
      toast({ title: "Organization Switched", description: `Now viewing ${org.name}` });
    }
  };

  // Safe dependency on ID string, not object reference
  useEffect(() => {
    if (currentOrganization?.id) {
        fetchSidebarCounts(currentOrganization.id);
    }
  }, [currentOrganization?.id]);

  useEffect(() => {
    if (!currentOrganization?.id) return;

    const channel = supabase
      .channel('hse-counts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents', filter: `organization_id=eq.${currentOrganization.id}` }, 
        () => fetchSidebarCounts(currentOrganization.id)
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, 
        () => fetchSidebarCounts(currentOrganization.id)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentOrganization?.id]);

  useEffect(() => {
    refreshContext();
    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') refreshContext();
        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setCurrentUser(null);
          setCurrentOrganization(null);
          setOrganizations([]);
          setIsLoading(false);
        }
      }
    );
    return () => { authListener.unsubscribe(); };
  }, []);

  const role = simulatedRole || realRole;

  const checkPermission = (requiredRole) => {
    if (!role) return false;
    if (role === 'super_admin') return true;
    const hierarchy = {
      'super_admin': 100, 'org_admin': 90, 'manager': 80, 'supervisor': 50,
      'staff_admin': 40, 'consultant': 30, 'contractor': 20, 'intern': 10,
      'auditor': 35, 'viewer': 5, 'hse_coordinator': 85, 'hse_officer': 70, 'department_manager': 75, 'employee': 15
    };
    return (hierarchy[role] || 0) >= (hierarchy[requiredRole] || 0);
  };

  const isFeatureAvailable = (featureName) => {
    if (role === 'super_admin') return true;
    const map = { 'emails': 'email_limit', 'images': 'image_limit', 'videos': 'video_upload_count' };
    const limitKey = map[featureName];
    if (!limitKey) return true;
    const limit = limits[limitKey];
    if (limit === -1) return true;
    const usageKey = featureName === 'emails' ? 'email_count' : 
                     featureName === 'images' ? 'image_upload_count' : 
                     featureName === 'videos' ? 'video_upload_count' : null;
    const currentUsage = usageMetrics?.[usageKey] || 0;
    return currentUsage < limit;
  };

  const trackUsage = async (featureName) => {
    if (role === 'super_admin' && !currentOrganization) return; 
    const colMap = { 'emails': 'email_count', 'images': 'image_upload_count', 'videos': 'video_upload_count' };
    if (colMap[featureName]) {
      const { data } = await hseQueries.incrementFeatureUsage(colMap[featureName]);
      if (data) setUsageMetrics(data);
    }
  };

  // FIXED: Memoize the context value to prevent re-renders of consumers
  const value = useMemo(() => ({
    isAuthenticated, isLoading, currentUser, currentOrganization, organizations,
    role, realRole, simulatedRole, setSimulatedRole,
    userModules, subscription, accessLevel, limits, usageMetrics,
    activeModule, setActiveModule,
    sidebarCounts,
    checkPermission, isFeatureAvailable, trackUsage, refreshContext,
    setCurrentOrganization: handleSetCurrentOrganization
  }), [
    isAuthenticated, isLoading, currentUser, currentOrganization?.id, organizations.length, 
    role, realRole, simulatedRole, 
    activeModule.id, sidebarCounts.incidents, sidebarCounts.observations, sidebarCounts.actions
  ]);

  return <HSEContext.Provider value={value}>{children}</HSEContext.Provider>;
}

export function useHSE() {
  const context = useContext(HSEContext);
  if (!context) throw new Error('useHSE must be used within HSEProvider');
  return context;
}