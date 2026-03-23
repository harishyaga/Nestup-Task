import React from 'react';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { Progress } from '@/components/ui/progress';
import { GitBranch, ArrowRight, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const Dependencies = () => {
  const { workItems, getWorkItem } = useData();
  const itemsWithDeps = workItems.filter((w) => w.dependencies.length > 0 || w.dependents.length > 0);

  const isDependencyMet = (dep: { workItemId: string; type: string; requiredPercentage: number }) => {
    const item = getWorkItem(dep.workItemId);
    if (!item) return false;
    return dep.type === 'full' ? item.progress >= 100 : item.progress >= dep.requiredPercentage;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dependency Map</h1>
        <p className="text-muted-foreground text-sm mt-1">Visualize work item relationships and blockers</p>
      </div>

      {/* Dependency chain visualization */}
      <div className="space-y-4">
        {itemsWithDeps.map((item) => (
          <Card key={item._id} className="shadow-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <GitBranch className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <StatusBadge status={item.status} />
              </div>

              {item.dependencies.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Depends on:</p>
                  <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                    {item.dependencies.map((dep, i) => {
                      const depItem = getWorkItem(dep.workItemId);
                      if (!depItem) return null;
                      const met = isDependencyMet(dep);
                      return (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                          {met ? (
                            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                          ) : depItem.status === 'blocked' ? (
                            <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-warning shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground">{depItem.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {dep.type === 'full' ? 'Needs 100%' : `Needs ${dep.requiredPercentage}%`}
                              {' · '}Current: {depItem.progress}%
                            </p>
                          </div>
                          <Progress value={depItem.progress} className="w-20 h-1.5" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {item.dependents.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Blocks:</p>
                  <div className="flex flex-wrap gap-2">
                    {item.dependents.map((depId) => {
                      const depItem = getWorkItem(depId);
                      if (!depItem) return null;
                      return (
                        <div key={depId} className="flex items-center gap-1.5 text-xs bg-muted/50 px-2 py-1 rounded">
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className="text-foreground">{depItem.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dependencies;
