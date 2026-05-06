import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, ArrowRight, TrendingDown, Clock, ShieldCheck } from 'lucide-react';
import { useHSE } from '@/context/HSEContext';
import { recommendationEngine } from '@/services/recommendationEngine';
import { supabase } from '@/lib/customSupabaseClient';

export default function RecommendationCards() {
  const { currentOrganization } = useHSE();
  const [recommendations, setRecommendations] = useState([]);
  
  useEffect(() => {
    if (currentOrganization?.id) {
      loadRecommendations();
      
      const channel = supabase
        .channel('public:recommendations')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'recommendations', filter: `organization_id=eq.${currentOrganization.id}` }, 
          () => loadRecommendations()
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentOrganization?.id]);

  const loadRecommendations = async () => {
    const data = await recommendationEngine.getRecommendations(currentOrganization.id);
    setRecommendations(data.filter(r => r.status === 'Generated'));
  };

  const handleAction = async (id, status) => {
    await recommendationEngine.updateRecommendationStatus(id, status);
  };

  if (recommendations.length === 0) return (
    <div className="text-center p-8 bg-[#1a1a2e] rounded-xl border border-[#3a3a5a] text-[#7a7a9a]">
      <ShieldCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
      <p>No pending recommendations. Great job!</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recommendations.map((rec) => (
        <Card key={rec.id} className="bg-[#1a1a2e] border-[#3a3a5a] flex flex-col hover:border-[#8b5cf6]/50 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start gap-2">
              <Badge className={`
                ${rec.recommendation_type === 'PREVENTIVE' ? 'bg-blue-500/20 text-blue-400' : ''}
                ${rec.recommendation_type === 'CORRECTIVE' ? 'bg-orange-500/20 text-orange-400' : ''}
                ${rec.recommendation_type === 'TRAINING' ? 'bg-purple-500/20 text-purple-400' : ''}
              `}>
                {rec.recommendation_type}
              </Badge>
              <span className="text-xs text-[#7a7a9a] flex items-center gap-1">
                <Clock className="h-3 w-3" /> {rec.timeline}
              </span>
            </div>
            <CardTitle className="text-white text-lg mt-2 leading-tight">{rec.title}</CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 pb-4">
            <p className="text-[#b0b0c0] text-sm mb-4">{rec.description}</p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs bg-black/20 p-2 rounded">
                <span className="text-[#7a7a9a]">Risk Reduction</span>
                <span className="text-green-400 font-bold flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" /> {rec.expected_risk_reduction}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs bg-black/20 p-2 rounded">
                <span className="text-[#7a7a9a]">Effort</span>
                <span className={`font-bold ${
                  rec.implementation_effort === 'Low' ? 'text-green-400' :
                  rec.implementation_effort === 'Medium' ? 'text-yellow-400' : 'text-orange-400'
                }`}>
                  {rec.implementation_effort}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs bg-black/20 p-2 rounded">
                <span className="text-[#7a7a9a]">Dept</span>
                <span className="text-white">{rec.affected_department}</span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="pt-0 grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={() => handleAction(rec.id, 'Rejected')}
            >
              <ThumbsDown className="h-4 w-4 mr-2" /> Reject
            </Button>
            <Button 
              className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white"
              onClick={() => handleAction(rec.id, 'Accepted')}
            >
              <ThumbsUp className="h-4 w-4 mr-2" /> Accept
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}