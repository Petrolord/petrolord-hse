import { supabase } from '@/lib/customSupabaseClient';

export const departmentService = {
  /**
   * Fetch all departments for a specific organization
   * Note: We don't join manager here because FK might be missing. 
   * Manager details should be resolved on the frontend using organization_users list.
   */
  async getDepartments(orgId) {
    if (!orgId) throw new Error("Organization ID is required");
    
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('organization_id', orgId)
      .order('name');
      
    if (error) throw error;
    return data;
  },

  /**
   * Fetch only active departments (useful for dropdowns)
   */
  async getActiveDepartments(orgId) {
    if (!orgId) throw new Error("Organization ID is required");

    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('organization_id', orgId)
      .eq('is_active', true)
      .order('name');
      
    if (error) throw error;
    return data;
  },

  /**
   * Create a new department
   */
  async createDepartment(departmentData) {
    // Validate required fields
    if (!departmentData.organization_id) throw new Error("Organization ID is required for department creation");
    if (!departmentData.name) throw new Error("Department name is required");

    const { data, error } = await supabase
      .from('departments')
      .insert([departmentData])
      .select()
      .single();
      
    if (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('A department with this name already exists.');
      }
      console.error("Supabase Create Department Error:", error);
      throw error;
    }
    return data;
  },

  /**
   * Update an existing department
   */
  async updateDepartment(id, updates) {
    if (!id) throw new Error("Department ID is required for update");

    const { data, error } = await supabase
      .from('departments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      if (error.code === '23505') {
        throw new Error('A department with this name already exists.');
      }
      console.error("Supabase Update Department Error:", error);
      throw error;
    }
    return data;
  },

  /**
   * Delete a department
   */
  async deleteDepartment(id) {
    if (!id) throw new Error("Department ID is required for deletion");

    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  },

  /**
   * Toggle active status
   */
  async toggleStatus(id, currentStatus) {
    return this.updateDepartment(id, { is_active: !currentStatus });
  }
};