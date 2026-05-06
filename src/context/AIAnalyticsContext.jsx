import React, { createContext, useContext, useState, useEffect } from 'react';
import { useHSE } from './HSEContext';
import { aiAnalyticsService } from '@/services/aiAnalyticsService';

const AIAnalyticsContext = createContext();

export const useAI = () => useContext(AIAnalyticsContext);

export const AIAnalyticsProvider = ({ children }) => {
  const { currentOrganization } = useHSE();
  const [insights, setInsights] = useState([]);
  const [safetyScore, setSafetyScore] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshAI = async () => {
    if (!currentOrganization) return;
    setLoading(true);
    try {
      const [ins, score, preds] = await Promise.all([
        aiAnalyticsService.getInsights(currentOrganization.id),
        aiAnalyticsService.getSafetyScore(currentOrganization.id),
        aiAnalyticsService.getPredictions(currentOrganization.id)
      ]);
      setInsights(ins);
      setSafetyScore(score);
      setPredictions(preds);
    } catch (e) {
      console.error("AI Analytics Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAI();
  }, [currentOrganization]);

  return (
    <AIAnalyticsContext.Provider value={{ insights, safetyScore, predictions, loading, refreshAI }}>
      {children}
    </AIAnalyticsContext.Provider>
  );
};