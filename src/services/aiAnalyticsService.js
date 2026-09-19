// Backs AIAnalyticsContext. No AI insight, safety-score or prediction model sits
// behind these calls yet, so they return empty results instead of the built-in
// example figures they used to return. The real, persisted AI forecast lives in
// predictiveAnalyticsService (AI Analytics module).
export const aiAnalyticsService = {
  async getInsights(_orgId) {
    return [];
  },

  async getSafetyScore(_orgId) {
    return null;
  },

  async getPredictions(_orgId) {
    return null;
  }
};
