import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { motion } from 'framer-motion';
import { ClipboardList, AlertTriangle, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

const MemberDashboard = () => {
  const { user } = useAuth();
  const { workItems, getWorkItem } = useData();

  const myTasks = workItems.filter((w) => w.assignedTo === user?._id);
  const completed = myTasks.filter((w) => w.status === 'completed').length;
  const inProgress = myTasks.filter((w) => w.status === 'in_progress').length;
  const blocked = myTasks.filter((w) => w.status === 'blocked').length;
  const pending = myTasks.filter((w) => w.status === 'pending').length;

  // Work items that depend on my tasks
  const impactedItems = workItems.filter(
    (w) => w.dependencies.some((d) => myTasks.some((t) => t._id === d.workItemId))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground text-sm mt-1">Your assigned work and progress</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'In Progress', value: inProgress, icon: Clock, color: 'text-warning' },
          { label: 'Pending', value: pending, icon: ClipboardList, color: 'text-primary' },
          { label: 'Blocked', value: blocked, icon: AlertTriangle, color: 'text-destructive' },
          { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-success' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="shadow-card">
              <CardContent className="p-4 text-center">
                <s.icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* My Tasks */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">My Work Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {myTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No work items assigned</p>
          ) : (
            myTasks.map((w) => (
              <div key={w._id} className="p-3 rounded-lg border border-border bg-card">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{w.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{w.description.slice(0, 80)}...</p>
                  </div>
                  <div className="flex gap-1.5">
                    <PriorityBadge priority={w.priority} />
                    <StatusBadge status={w.status} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={w.progress} className="h-2 flex-1" />
                  <span className="text-xs font-mono font-medium text-foreground">{w.progress}%</span>
                </div>
                {w.blockedReason && (
                  <div className="mt-2 text-xs text-destructive bg-destructive/10 p-2 rounded">
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    {w.blockedReason}
                  </div>
                )}
                {w.dependencies.length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Depends on: {w.dependencies.map((d) => {
                      const dep = getWorkItem(d.workItemId);
                      return dep ? `${dep.title} (${d.type === 'full' ? '100%' : `${d.requiredPercentage}%`})` : 'Unknown';
                    }).join(', ')}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Impact */}
      {impactedItems.length > 0 && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRight className="w-4 h-4" /> Your Work Impacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {impactedItems.map((w) => (
              <div key={w._id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium text-foreground">{w.title}</p>
                  <p className="text-xs text-muted-foreground">Assigned to: {w.assignedToName || 'Unassigned'}</p>
                </div>
                <StatusBadge status={w.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MemberDashboard;
