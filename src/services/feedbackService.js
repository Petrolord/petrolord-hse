import { supabase } from '@/lib/customSupabaseClient';

export const feedbackService = {
  async submitFeedback(feedbackData) {
    const { data, error } = await supabase
      .from('feedback')
      .insert([feedbackData])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  async getFeedbackStats(organizationId) {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error fetching feedback:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return {
        avgRating: 0,
        totalFeedback: 0,
        distribution: [0,0,0,0,0],
        recent: []
      };
    }

    const total = data.length;
    const sum = data.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    const avg = total > 0 ? (sum / total).toFixed(1) : 0;
    
    const distribution = [0,0,0,0,0];
    data.forEach(f => {
      if(f.rating >=1 && f.rating <=5) distribution[f.rating-1]++;
    });

    return {
      avgRating: avg,
      totalFeedback: total,
      distribution,
      recent: data.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)
    };
  }
};