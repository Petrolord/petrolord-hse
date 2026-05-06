import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { feedbackService } from '@/services/feedbackService';
import { useHSE } from '@/context/HSEContext';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { MessageSquare, ThumbsUp, Star } from 'lucide-react';

export default function FeedbackDashboard() {
  const { currentOrganization } = useHSE();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (currentOrganization?.id) {
      feedbackService.getFeedbackStats(currentOrganization.id).then(setStats);
    }
  }, [currentOrganization]);

  if (!stats) return <div className="p-8 text-center text-[#7a7a9a]">Loading feedback data...</div>;

  const pieData = stats.distribution.map((count, i) => ({ name: `${i+1} Stars`, value: count }));
  const COLORS = ['#ef4444', '#f97316', '#facc15', '#a3e635', '#22c55e'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
        <CardContent className="p-6 flex flex-col items-center justify-center h-[200px]">
          <Star className="h-8 w-8 text-yellow-400 mb-2" />
          <h3 className="text-4xl font-bold text-white">{stats.avgRating}</h3>
          <p className="text-[#7a7a9a] text-sm">Average Rating</p>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
        <CardContent className="p-6 flex flex-col items-center justify-center h-[200px]">
          <MessageSquare className="h-8 w-8 text-blue-400 mb-2" />
          <h3 className="text-4xl font-bold text-white">{stats.totalFeedback}</h3>
          <p className="text-[#7a7a9a] text-sm">Total Feedback Submissions</p>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1a2e] border-[#3a3a5a]">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-sm font-medium">Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0F1B2E', borderColor: '#3a3a5a', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '10px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Feedback List */}
      <Card className="bg-[#1a1a2e] border-[#3a3a5a] lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-white">Recent Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recent.length === 0 ? (
              <p className="text-[#7a7a9a]">No feedback yet.</p>
            ) : (
              stats.recent.map((f) => (
                <div key={f.id} className="flex gap-4 p-3 rounded bg-[#252541] border border-[#3a3a5a]">
                  <div className="bg-black/20 p-2 rounded h-fit">
                    <span className="font-bold text-yellow-400">{f.rating}★</span>
                  </div>
                  <div>
                    <p className="text-white text-sm">{f.comment || "No comment provided."}</p>
                    <p className="text-[#7a7a9a] text-xs mt-1">
                      On {f.target_type} • {new Date(f.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}