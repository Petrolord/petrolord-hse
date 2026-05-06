import { supabase } from '@/lib/customSupabaseClient';

export const aiAnalyticsService = {
  async getInsights(orgId) {
    // In a real app, this would call an Edge Function running ML models
    // For now, we simulate AI insights based on existing data patterns
    
    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));

    return [
      {
        id: 1,
        type: 'prediction',
        title: 'High Incident Risk Forecast',
        description: 'Based on historical data, incident probability increases by 35% in the upcoming rainy season (June-July).',
        confidence: 0.85,
        trend: 'up'
      },
      {
        id: 2,
        type: 'anomaly',
        title: 'Unusual Permit Activity',
        description: 'Hot Work permits in Warehouse B are 200% above monthly average.',
        confidence: 0.92,
        trend: 'neutral'
      },
      {
        id: 3,
        type: 'recommendation',
        title: 'Suggest Training Refresher',
        description: 'Team Alpha has had 3 near misses related to "Lifting". Recommend "Manual Handling" refresher.',
        confidence: 0.78,
        trend: 'down'
      }
    ];
  },

  async getSafetyScore(orgId) {
    // Mock calculation of a comprehensive safety score
    return {
      overall: 87,
      breakdown: {
        incidents: 92,
        compliance: 85,
        training: 78,
        culture: 88
      },
      history: [
        { date: '2025-01', score: 82 },
        { date: '2025-02', score: 84 },
        { date: '2025-03', score: 83 },
        { date: '2025-04', score: 85 },
        { date: '2025-05', score: 87 }
      ]
    };
  },

  async getPredictions(orgId) {
    return {
      nextMonthIncidents: 4,
      riskLevel: 'Medium',
      contributingFactors: ['New Contractors', 'Equipment Maintenance Overdue']
    };
  }
};