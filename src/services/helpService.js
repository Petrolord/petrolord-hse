import { supabase } from '@/lib/customSupabaseClient';

export const helpService = {
  async getCategories() {
    const { data, error } = await supabase
      .from('help_categories')
      .select('*')
      .order('display_order');
    if (error) throw error;
    return data;
  },

  async getArticles(categoryId) {
    let query = supabase
      .from('help_articles')
      .select('*')
      .eq('is_published', true)
      .order('title');
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getArticleBySlug(slug) {
    const { data, error } = await supabase
      .from('help_articles')
      .select('*, help_categories(name)')
      .eq('slug', slug)
      .single();
    if (error) throw error;
    return data;
  },

  async searchArticles(query) {
    const { data, error } = await supabase
      .from('help_articles')
      .select('id, title, slug, content, difficulty_level, category_id')
      .eq('is_published', true)
      .ilike('title', `%${query}%`)
      .limit(10);
      
    if (error) throw error;
    return data;
  },

  async submitFeedback(articleId, isHelpful, comment) {
    const { data, error } = await supabase
      .from('help_feedback')
      .insert({
        article_id: articleId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        is_helpful: isHelpful,
        comment
      });
    
    if (error) throw error;

    // Increment counters
    const field = isHelpful ? 'helpful_count' : 'not_helpful_count';
    /* Note: Supabase doesn't support atomic increment easily via client without RPC, 
       so we'll skip the immediate counter update for now or implement an RPC later. 
       Assuming low traffic for this prototype. */
    
    return data;
  },

  async createTicket(ticketData) {
    const user = (await supabase.auth.getUser()).data.user;
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        ...ticketData,
        user_id: user.id
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getMyTickets() {
    const user = (await supabase.auth.getUser()).data.user;
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};