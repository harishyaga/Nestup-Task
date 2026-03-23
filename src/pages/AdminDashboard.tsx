import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { motion } from 'framer-motion';
import {
  ListTodo,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
} from 'lucide-react';

const AdminDashboard = () => {
  const { workItems, members, getBlockedItems, getReadyItems } = useData();

  const totalItems = workItems.length;
  const completed = workItems.filter((w) => w.status === 'completed').length;
  const inProgress = workItems.filter((w) => w.status === 'in_progress').length;
  const blocked = getBlockedItems().length;
  const ready = getReadyItems().length;
  const overallProgress = totalItems > 0 ? Math.round(workItems.reduce((s, w) => s + w.progress, 0) / totalItems) : 0;

  const stats = [
    { label: 'Total Items', value: totalItems, icon: ListTodo, color: 'text-primary' },
    { label: 'In Progress', value: inProgress, icon: Clock, color: 'text-warning' },
    { label: 'Blocked', value: blocked, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-success' },
  ];

  const memberWorkloads = members.map((m) => {
    const tasks = workItems.filter((w) => w.assignedTo === m._id && w.status !== 'completed');
    return { ...m, tasks, load: tasks.length, overloaded: tasks.length >= m.capacity };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of all work items and team performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center ${s.color}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Overall Progress */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Overall Progress</CardTitle>
            <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{completed} completed</span>
            <span>{ready} ready to start</span>
            <span>{blocked} blocked</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Workload */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" /> Member Workload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {memberWorkloads.map((m) => (
              <div key={m._id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary-foreground">{m.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                    <span className={`text-xs font-medium ${m.overloaded ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {m.load}/{m.capacity}
                    </span>
                  </div>
                  <Progress value={(m.load / m.capacity) * 100} className="h-1.5 mt-1" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Items */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Recent Work Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {workItems.slice(0, 5).map((w) => (
              <div key={w._id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{w.title}</p>
                  <p className="text-xs text-muted-foreground">{w.assignedToName || 'Unassigned'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={w.priority} />
                  <StatusBadge status={w.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
