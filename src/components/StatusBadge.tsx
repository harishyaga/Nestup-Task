import React from 'react';
import { WorkStatus, Priority } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusConfig: Record<WorkStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'In Progress', className: 'bg-primary/15 text-primary' },
  blocked: { label: 'Blocked', className: 'bg-destructive/15 text-destructive' },
  completed: { label: 'Completed', className: 'bg-success/15 text-success' },
};

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', className: 'bg-primary/15 text-primary' },
  high: { label: 'High', className: 'bg-warning/15 text-warning' },
  critical: { label: 'Critical', className: 'bg-destructive/15 text-destructive' },
};

export const StatusBadge = ({ status }: { status: WorkStatus }) => {
  const cfg = statusConfig[status];
  return <Badge variant="outline" className={cn('border-0 font-medium text-xs', cfg.className)}>{cfg.label}</Badge>;
};

export const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const cfg = priorityConfig[priority];
  return <Badge variant="outline" className={cn('border-0 font-medium text-xs', cfg.className)}>{cfg.label}</Badge>;
};
