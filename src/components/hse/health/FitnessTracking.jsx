import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Award, Flame, Timer, TrendingUp, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { fitnessService } from '@/services/fitnessService';
import { useHSE } from '@/context/HSEContext';
import { useToast } from "@/components/ui/use-toast";

// Mock Chart Data
const weeklyData = [
  { day: 'Mon', steps: 6500 }, { day: 'Tue', steps: 8200 }, { day: 'Wed', steps: 10500 },
  { day: 'Thu', steps: 7800 }, { day: 'Fri', steps: 9200 }, { day: 'Sat', steps: 12000 }, { day: 'Sun', steps: 5400 }
];

export default function FitnessTracking() {
  const { currentUser, currentOrganization } = useHSE();
  const { toast } = useToast();
  const [todaySteps, setTodaySteps] = useState(0);
  const [goal, setGoal] = useState(8000);
  const [inputSteps, setInputSteps] = useState('');
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(currentUser && currentOrganization) {
      loadFitnessData();
    }
  }, [currentUser, currentOrganization]);

  const loadFitnessData = async () => {
    setLoading(true);
    try {
      const data = await fitnessService.getTodayActivity(currentUser.id, currentOrganization.id);
      setTodaySteps(data.steps || 0);
      setGoal(data.goal || 8000);
      const log = await fitnessService.getActivityLog(currentUser.id, currentOrganization.id);
      setActivityLog(log);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSteps = async () => {
    if(!inputSteps) return;
    const steps = parseInt(inputSteps);
    try {
      await fitnessService.logActivity({
        user_id: currentUser.id,
        organization_id: currentOrganization.id,
        steps: steps,
        activity_type: 'Walking',
        activity_date: new Date().toISOString()
      });
      setTodaySteps(prev => prev + steps);
      setInputSteps('');
      toast({ title: "Steps Logged!", description: "Keep up the good work!" });
      loadFitnessData(); // Refresh log
    } catch(e) {
      toast({ title: "Error", description: "Failed to log steps.", variant: "destructive" });
    }
  };

  const progressPercentage = Math.min((todaySteps / goal) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Progress Card */}
        <Card className="bg-[#1e1e30] border-[#2a2a40] md:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex justify-between">
              <span>Daily Step Goal</span>
              <span className="text-blue-400 font-bold">{todaySteps.toLocaleString()} / {goal.toLocaleString()}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Progress value={progressPercentage} className="h-4 bg-[#2a2a40]" indicatorClassName="bg-gradient-to-r from-blue-500 to-green-400" />
                <p className="text-right text-xs text-[#8f8fdb] mt-2">{Math.round(progressPercentage)}% Completed</p>
              </div>
              
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-xs text-[#8f8fdb] mb-1 block">Add Steps (Manual)</label>
                  <Input 
                    type="number" 
                    placeholder="e.g. 2500" 
                    value={inputSteps}
                    onChange={(e) => setInputSteps(e.target.value)}
                    className="bg-[#25253e] border-[#3a3a5a] text-white" 
                  />
                </div>
                <Button onClick={handleAddSteps} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Activity className="mr-2 h-4 w-4" /> Log Steps
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Streaks & Badges */}
        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardHeader><CardTitle className="text-white">Achievements</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">5 Days</p>
                <p className="text-xs text-[#8f8fdb]">Current Streak</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <BadgeItem icon={Award} active={true} label="10K Club" />
              <BadgeItem icon={Trophy} active={false} label="Marathon" />
              <BadgeItem icon={TrendingUp} active={true} label="Consistent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Log */}
        <Card className="bg-[#1e1e30] border-[#2a2a40] lg:col-span-2">
          <CardHeader><CardTitle className="text-white">Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityLog.length === 0 ? (
                <p className="text-[#8f8fdb] text-center py-4">No activity logged yet.</p>
              ) : (
                activityLog.slice(0, 5).map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-[#25253e] rounded-lg border border-[#2a2a40]">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400">
                        {log.activity_type === 'Running' ? <Timer className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-white font-medium">{log.activity_type}</p>
                        <p className="text-xs text-[#8f8fdb]">{new Date(log.activity_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">{log.steps} steps</p>
                      {log.duration_minutes && <p className="text-xs text-[#8f8fdb]">{log.duration_minutes} mins</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trend (Visual Mock) */}
        <Card className="bg-[#1e1e30] border-[#2a2a40]">
          <CardHeader><CardTitle className="text-white">Weekly Trend</CardTitle></CardHeader>
          <CardContent className="h-64 flex items-end justify-between px-2 pb-2">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-2 group">
                <div className="relative w-8 bg-[#2a2a40] rounded-t-sm h-40 flex items-end overflow-hidden">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.steps / 12000) * 100}%` }}
                    className={`w-full ${d.steps >= 8000 ? 'bg-green-500' : 'bg-blue-500'} group-hover:opacity-80 transition-opacity`}
                  />
                </div>
                <span className="text-xs text-[#8f8fdb]">{d.day}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BadgeItem({ icon: Icon, active, label }) {
  return (
    <div className={`flex flex-col items-center p-3 rounded-lg border ${active ? 'bg-[#2a2a40] border-blue-500/50' : 'bg-[#1a1a2e] border-[#2a2a40] opacity-50'}`}>
      <Icon className={`h-6 w-6 mb-2 ${active ? 'text-yellow-400' : 'text-gray-500'}`} />
      <span className="text-[10px] text-center text-[#e0e0e0]">{label}</span>
    </div>
  );
}