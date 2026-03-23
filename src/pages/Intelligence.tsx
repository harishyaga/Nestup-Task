import React from 'react';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, UserCheck, AlertTriangle, Clock, Zap } from 'lucide-react';

const Intelligence = () => {
  const { workItems, members, suggestAssignment, getBlockedItems, getMemberWorkload } = useData();

  // Unassigned items with suggestions
  const unassigned = workItems.filter((w) => !w.assignedTo && w.status !== 'completed');
  const suggestions = unassigned.map((w) => ({ item: w, suggested: suggestAssignment(w) }));

  // Overloaded members
  const overloaded = members.filter((m) => {
    const load = getMemberWorkload(m._id).length;
    return load >= m.capacity;
  });

  // Recently unblocked (items whose deps are now met but still pending)
  const nowReady = workItems.filter((w) => {
    if (w.status !== 'pending' || w.dependencies.length === 0) return false;
    return w.dependencies.every((d) => {
      const dep = workItems.find((x) => x._id === d.workItemId);
      if (!dep) return false;
      return d.type === 'full' ? dep.progress >= 100 : dep.progress >= d.requiredPercentage;
    });
  });

  // Estimated completion
  const totalHours = workItems.filter((w) => w.status !== 'completed').reduce((s, w) => s + w.estimatedHours * (1 - w.progress / 100), 0);
  const activeMemberCount = members.filter((m) => getMemberWorkload(m._id).length > 0).length || 1;
  const estDays = Math.ceil(totalHours / (activeMemberCount * 8));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Intelligence & Automation</h1>
        <p className="text-muted-foreground text-sm mt-1">AI-powered insights and suggestions</p>
      </div>

      {/* Estimated Completion */}
      <Card className="shadow-card border-primary/20">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Clock className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Estimated Project Completion</p>
            <p className="text-2xl font-bold text-foreground">{estDays} working days</p>
            <p className="text-xs text-muted-foreground">{Math.round(totalHours)}h remaining across {activeMemberCount} active members</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignment Suggestions */}
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" /> Assignment Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">All items are assigned!</p>
            ) : (
              suggestions.map(({ item, suggested }) => (
                <div key={item._id} className="p-3 rounded-lg border border-border">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.skills.map((s) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                  </div>
                  {suggested ? (
                    <div className="mt-2 flex items-center gap-2 text-xs text-success">
                      <Zap className="w-3 h-3" />
                      Suggested: <span className="font-medium">{suggested.name}</span>
                      <span className="text-muted-foreground">(matching skills, low workload)</span>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-warning">No suitable member found</p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <div className="space-y-6">
          {/* Ready to Start */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-success" /> Ready to Start
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {nowReady.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No newly unblocked items</p>
              ) : (
                nowReady.map((w) => (
                  <div key={w._id} className="flex items-center gap-2 p-2 rounded-lg bg-success/10">
                    <Zap className="w-4 h-4 text-success" />
                    <p className="text-sm text-foreground">{w.title} — all dependencies met!</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Overloaded Members */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" /> Overloaded Members
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {overloaded.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No overloaded members</p>
              ) : (
                overloaded.map((m) => (
                  <div key={m._id} className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <p className="text-sm text-foreground">{m.name} — at capacity ({getMemberWorkload(m._id).length}/{m.capacity})</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Intelligence;
