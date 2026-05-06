import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  TrendingUp,
  Calendar,
  Users,
  Shield,
  Activity
} from 'lucide-react';

function DashboardView() {
  const quickStats = [
    { 
      id: 'open-actions', 
      label: 'Open Actions', 
      value: '24', 
      icon: CheckCircle, 
      color: '#2196F3',
      trend: '+3 this week'
    },
    { 
      id: 'overdue-actions', 
      label: 'Overdue Actions', 
      value: '8', 
      icon: AlertTriangle, 
      color: '#FF5252',
      trend: '2 critical'
    },
    { 
      id: 'new-observations', 
      label: 'New Observations', 
      value: '12', 
      icon: Eye, 
      color: '#4CAF50',
      trend: 'Last 7 days'
    },
    { 
      id: 'incidents-mtd', 
      label: 'Incidents MTD', 
      value: '3', 
      icon: TrendingUp, 
      color: '#FFC107',
      trend: '-1 vs last month'
    },
  ];

  const recentActivity = [
    { id: 1, type: 'incident', title: 'Near Miss - Drilling Area', time: '2 hours ago', severity: 'medium' },
    { id: 2, type: 'observation', title: 'Safety Equipment Check Completed', time: '4 hours ago', severity: 'low' },
    { id: 3, type: 'action', title: 'Fire Drill - Platform A', time: '1 day ago', severity: 'high' },
    { id: 4, type: 'permit', title: 'Hot Work Permit Approved', time: '1 day ago', severity: 'medium' },
  ];

  const upcomingEvents = [
    { id: 1, title: 'Monthly HSE Review Meeting', date: '2025-12-15', type: 'meeting' },
    { id: 2, title: 'Fire Safety Training - Batch 2', date: '2025-12-18', type: 'training' },
    { id: 3, title: 'Quarterly Safety Audit', date: '2025-12-20', type: 'audit' },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="petrolord-card p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="p-3 rounded-lg transition-all duration-300 group-hover:scale-110"
                  style={{ backgroundColor: stat.color + '20' }}
                >
                  <Icon className="h-6 w-6" style={{ color: stat.color }} />
                </div>
                <span className="text-xs text-[#7a7a9a]">{stat.trend}</span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-[#e0e0e0]">{stat.value}</p>
                <p className="text-sm text-[#b0b0c0]">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 petrolord-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#e0e0e0] flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#FFC107]" />
              Recent Activity
            </h2>
            <button className="text-sm text-[#FFC107] hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-lg bg-[#1a1a2e] hover:bg-[#2d2d4a] transition-all duration-200 cursor-pointer"
              >
                <div 
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    activity.severity === 'high' ? 'bg-red-500' :
                    activity.severity === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#e0e0e0] truncate">{activity.title}</p>
                  <p className="text-xs text-[#7a7a9a]">{activity.time}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-[#252541] text-[#b0b0c0] capitalize">
                  {activity.type}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="petrolord-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#e0e0e0] flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#FFC107]" />
              Upcoming
            </h2>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-4 rounded-lg bg-[#1a1a2e] hover:bg-[#2d2d4a] transition-all duration-200 cursor-pointer"
              >
                <p className="text-sm font-medium text-[#e0e0e0] mb-2">{event.title}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#7a7a9a]">{event.date}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-[#252541] text-[#FFC107] capitalize">
                    {event.type}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="petrolord-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-[#2196F3]/20">
              <Users className="h-6 w-6 text-[#2196F3]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#e0e0e0]">156</p>
              <p className="text-sm text-[#b0b0c0]">Active Personnel</p>
            </div>
          </div>
          <div className="text-xs text-[#7a7a9a]">98% compliance rate</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="petrolord-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-[#4CAF50]/20">
              <Shield className="h-6 w-6 text-[#4CAF50]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#e0e0e0]">342</p>
              <p className="text-sm text-[#b0b0c0]">Days Without LTI</p>
            </div>
          </div>
          <div className="text-xs text-[#7a7a9a]">Target: 365 days</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="petrolord-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-[#FFC107]/20">
              <TrendingUp className="h-6 w-6 text-[#FFC107]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#e0e0e0]">92%</p>
              <p className="text-sm text-[#b0b0c0]">Safety Score</p>
            </div>
          </div>
          <div className="text-xs text-[#7a7a9a]">+5% from last month</div>
        </motion.div>
      </div>
    </div>
  );
}

export default DashboardView;