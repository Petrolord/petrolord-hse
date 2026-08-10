// PETROLORD HSE CONTEXT MIGRATION v1 (2026-05-06)
// PETROLORD HSE CONTEXT MIGRATION v2 (2026-05-06): decouple PostgREST joins
// PETROLORD HSE CONTEXT MIGRATION v3 (2026-05-07): expose userData alias
// Migrated from organization_users to organization_members + organization_apps.
// Access derivation moved off hseQueries.checkHSEAccess (legacy) to a direct
// organization_apps lookup. See SQL migration 2026-05-06_unify_signup_trigger_v2.
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

// organization_members.role vocabulary is wider than the UI's canonical set
// (LeftNav gates on super_admin/org_admin/manager/supervisor/staff plus the
// specialist roles). Aliases map stored roles onto that set so invited
// members don't land on an empty sidebar.
const ROLE_ALIASES = {
  owner: 'org_admin',
  admin: 'org_admin',
  member: 'staff',
  employee: 'staff'
};
const normalizeRole = (r) => ROLE_ALIASES[r] || r || 'staff';

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

      let activeOrgId = null; // org the entitlement check below must evaluate

      if (isSuperAdminEmail) {
        setRealRole('super_admin');
        setAccessLevel('premium');
        setLimits({ email_limit: -1, image_limit: -1, video_limit: -1 });
        if(activeModule.id === 'hse') setActiveModule({ id: 'dashboard', label: 'Dashboard', color: '#FFC107' });

        try {
          const { data: rawMems } = await supabase
            .from('organization_members')
            .select('*')
            .eq('user_id', userId);
          const _orgIds = (rawMems || []).map(m => m.organization_id);
          const { data: orgsList } = _orgIds.length
            ? await supabase.from('organizations').select('*').in('id', _orgIds)
            : { data: [] };
          const memberships = (rawMems || []).map(m => ({
            ...m,
            organization: (orgsList || []).find(o => o.id === m.organization_id) || null
          }));
            
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
        const { data: rawMems2, error: memError } = await supabase
            .from('organization_members')
            .select('*')
            .eq('user_id', userId);

        if (memError) throw memError;

        const _orgIds2 = (rawMems2 || []).map(m => m.organization_id);
        const { data: orgsList2 } = _orgIds2.length
          ? await supabase.from('organizations').select('*').in('id', _orgIds2)
          : { data: [] };
        const memberships = (rawMems2 || []).map(m => ({
          ...m,
          organization: (orgsList2 || []).find(o => o.id === m.organization_id) || null
        }));

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
            activeOrgId = activeMembership.organization_id;
            const mappedRole = normalizeRole(activeMembership.role);
            setRealRole(mappedRole);
            // userModules now derived from organization_apps in the access check below
            
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

      // Access Check — derived from organization_apps (post-unification 2026-05-06).
      // Super admins keep their pre-set 'premium'; everyone else is evaluated here.
      if (!isSuperAdminEmail) {
        try {
            // Evaluate entitlement for the ACTIVE org, not an arbitrary
            // membership row (multi-org users got a random org's access before).
            const userOrgId = activeOrgId;

            if (userOrgId) {
              const { data: orgApps } = await supabase
                .from('organization_apps')
                .select('app_id, module_id, status')
                .eq('organization_id', userOrgId)
                .eq('status', 'ACTIVE');

              const hseApp = (orgApps || []).find(a => a.app_id === 'hse');
              if (hseApp) {
                const isPremium = hseApp.module_id !== 'hse_free';
                setAccessLevel(isPremium ? 'premium' : 'basic');
                setUserModules((orgApps || []).map(a => a.app_id));
              } else {
                setAccessLevel('none');
                setUserModules([]);
              }
            } else {
              setAccessLevel('none');
            }
        } catch (e) { console.log("Access check warning", e); }
      }

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
         setRealRole(normalizeRole(membership?.role));
         // userModules will refresh via refreshContext on next access check
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
        // Note: TOKEN_REFRESHED fires on every tab visibility change in some browsers,
        // which causes navigation/state bounce mid-action. Only refresh on actual sign-in.
        if (event === 'SIGNED_IN') refreshContext();
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
      'super_admin': 100, 'owner': 95, 'org_admin': 90, 'manager': 80, 'supervisor': 50,
      'staff_admin': 40, 'consultant': 30, 'contractor': 20, 'intern': 10,
      'auditor': 35, 'viewer': 5, 'hse_coordinator': 85, 'hse_officer': 70, 'department_manager': 75, 'employee': 15,
      'staff': 20, 'admin': 90, 'member': 20
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
  // userData: backwards-compat alias used by older components.
  // Combines auth user fields with current org_id so legacy code doing
  // userData.organization_id works without rewriting every component.
  const userData = currentUser ? {
    ...currentUser,
    organization_id: currentOrganization?.id || null
  } : null;


  // FIXED: Memoize the context value to prevent re-renders of consumers
  const value = useMemo(() => ({
    userData,
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