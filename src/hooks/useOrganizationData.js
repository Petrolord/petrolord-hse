import { useState, useEffect } from 'react';
import { useHSE } from '@/context/HSEContext';
import { supabase } from '@/lib/customSupabaseClient';

export const useOrganizationData = () => {
  const { currentOrganization } = useHSE();
  
  const getDepartments = async () => {
    if (!currentOrganization) return [];
    const { data } = await supabase
      .from('departments')
      .select('*')
      .eq('organization_id', currentOrganization.id);
    return data || [];
  };

  const getPositions = async () => {
    if (!currentOrganization) return [];
    const { data } = await supabase
      .from('positions')
      .select('*, departments(name)')
      .eq('organization_id', currentOrganization.id);
    return data || [];
  };

  const getSites = async () => {
    if (!currentOrganization) return [];
    const { data } = await supabase
      .from('organization_sites')
      .select('*')
      .eq('organization_id', currentOrganization.id);
    return data || [];
  };

  const getSafetyPersonnel = async () => {
    if (!currentOrganization) return [];
    // Fetch key personnel
    const { data } = await supabase
      .from('key_personnel')
      .select('role, user_id'); // We might not get user details directly if RLS blocks 'users' table read for non-admins
    
    // In a real app we'd resolve user names via a public profile table or RPC
    // For now we return IDs, consumer needs to map them if possible
    return data || [];
  };

  return {
    getDepartments,
    getPositions,
    getSites,
    getSafetyPersonnel
  };
};