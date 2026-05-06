import { supabase } from '@/lib/customSupabaseClient';

export const safetyMomentService = {
  async fetchCategories() {
    const { data, error } = await supabase
      .from('safety_moment_categories')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  async fetchMoments({ search = '', category = 'all', duration = 'all' }) {
    let query = supabase
      .from('safety_moments')
      .select(`
        *,
        category:safety_moment_categories(name, color, icon)
      `)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }
    if (category !== 'all') {
      query = query.eq('category_id', category);
    }
    
    if (duration !== 'all') {
      if (duration === '5') query = query.lte('duration', 5);
      else if (duration === '10') query = query.gt('duration', 5).lte('duration', 10);
      else if (duration === '15') query = query.gt('duration', 10).lte('duration', 15);
      else if (duration === '20+') query = query.gt('duration', 15);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async fetchMomentById(id) {
    const { data, error } = await supabase
      .from('safety_moments')
      .select(`
        *,
        category:safety_moment_categories(name, color, icon)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async toggleSave(momentId, userId) {
    const { data: existing } = await supabase
      .from('user_saved_moments')
      .select('id')
      .eq('user_id', userId)
      .eq('moment_id', momentId)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('user_saved_moments')
        .delete()
        .eq('id', existing.id);
      if (error) throw error;
      return false; 
    } else {
      const { error } = await supabase
        .from('user_saved_moments')
        .insert({ user_id: userId, moment_id: momentId });
      if (error) throw error;
      return true; 
    }
  },

  async fetchSavedMomentIds(userId) {
    const { data, error } = await supabase
      .from('user_saved_moments')
      .select('moment_id')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data.map(item => item.moment_id);
  },

  async createUserMoment(momentData) {
    const { difficulty_level, ...rest } = momentData;
    const { data, error } = await supabase
      .from('safety_moments')
      .insert([rest])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async trackView(momentId, userId) {
    if (!momentId || !userId) return;
    await supabase.from('safety_moment_views').insert({ moment_id: momentId, user_id: userId });
  },

  async trackDownload(momentId, userId, format) {
    await supabase.from('safety_moment_downloads').insert({ moment_id: momentId, user_id: userId, format });
  },

  async shareMoment(momentId, userId, emails) {
    const inserts = emails.map(email => ({
      moment_id: momentId,
      shared_by: userId,
      shared_with_email: email
    }));
    const { error } = await supabase.from('safety_moment_shares').insert(inserts);
    if (error) throw error;
    await this.incrementShare(momentId);
  },

  async incrementShare(momentId) {
    const { data } = await supabase.from('safety_moments').select('shares_count').eq('id', momentId).single();
    await supabase.from('safety_moments').update({ shares_count: (data?.shares_count || 0) + 1 }).eq('id', momentId);
  },

  async scheduleMoment(scheduleData) {
    const { data, error } = await supabase
      .from('scheduled_safety_moments')
      .insert([scheduleData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // FIXED SEEDING LOGIC TO SUPPORT UPSERT
  async seedMoments(momentsData) {
    console.log("Starting seed process for", momentsData.length, "moments...");

    // 1. Ensure categories exist
    const categories = [...new Set(momentsData.map(m => m.category_name))];
    
    const { data: existingCats } = await supabase.from('safety_moment_categories').select('id, name');
    const existingCatNames = existingCats?.map(c => c.name) || [];
    
    const newCats = categories.filter(c => !existingCatNames.includes(c));
    
    if (newCats.length > 0) {
      await supabase.from('safety_moment_categories').insert(
        newCats.map(name => ({
          name,
          color: '#1e40af', // Default Petrolord Blue
          icon: 'Shield'
        }))
      );
    }

    // Refresh categories map
    const { data: allCats } = await supabase.from('safety_moment_categories').select('id, name');
    const catMap = allCats.reduce((acc, cat) => ({ ...acc, [cat.name]: cat.id }), {});

    // 2. Fetch existing moments to map IDs for UPSERT
    const { data: existingMoments } = await supabase.from('safety_moments').select('id, title');
    const titleToIdMap = existingMoments?.reduce((acc, m) => ({ ...acc, [m.title]: m.id }), {}) || {};

    // 3. Prepare data with ID mapping and clean fields
    const formattedMoments = momentsData.map(m => {
      const { 
        category_name, 
        key_talking_points, // Maps to key_points
        one_minute_recap,   // Maps to description + one_minute_recap
        why_it_matters,     // Maps to content + why_it_matters
        description,
        content,
        key_points,
        difficulty_level,
        ...rest 
      } = m;

      const payload = {
        ...rest,
        id: titleToIdMap[m.title], // Add ID if it exists to trigger UPDATE
        category_id: catMap[category_name],
        
        // Detailed Content Fields (Phase 2)
        when_to_use: m.when_to_use,
        why_it_matters: m.why_it_matters,
        do_list: m.do_list,
        dont_list: m.dont_list,
        incident_scenario: m.incident_scenario,
        site_checklist: m.site_checklist,
        one_minute_recap: m.one_minute_recap,
        references: m.references,
        discussion_questions: m.discussion_questions,
        
        // Mapped/Legacy Fields for Phase 1 compatibility
        key_points: key_talking_points || key_points,
        description: one_minute_recap || description || m.why_it_matters,
        content: why_it_matters || content,
        
        // Metadata
        difficulty_level: null 
      };

      // Remove undefined ID so Supabase creates new UUID for inserts
      if (!payload.id) delete payload.id;
      
      return payload;
    });

    // 4. Perform Upsert in Batches
    console.log("Upserting payload:", formattedMoments.length, "items");
    
    const BATCH_SIZE = 50;
    let totalUpserted = 0;

    for (let i = 0; i < formattedMoments.length; i += BATCH_SIZE) {
        const batch = formattedMoments.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('safety_moments').upsert(batch, { onConflict: 'id' });
        
        if (error) {
            console.error("Seed error batch", i, error);
            throw error;
        }
        totalUpserted += batch.length;
    }
    
    return { success: true, count: totalUpserted };
  }
};