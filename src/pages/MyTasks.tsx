import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { WorkStatus } from '@/types';
import { Save, AlertTriangle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const MyTasks = () => {
  const { user } = useAuth();
  const { workItems, updateWorkItem, getWorkItem } = useData();
  const myTasks = workItems.filter((w) => w.assignedTo === user?._id);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<WorkStatus>('pending');
  const [blockedReason, setBlockedReason] = useState('');
  const [updateMsg, setUpdateMsg] = useState('');

  const selectTask = (id: string) => {
    const item = getWorkItem(id);
    if (!item) return;
    setSelectedId(id);
    setProgress(item.progress);
    setStatus(item.status);
    setBlockedReason(item.blockedReason || '');
  };

  const handleSave = () => {
    if (!selectedId) return;
    const updates: any = { progress, status };
    if (status === 'blocked') updates.blockedReason = blockedReason;
    else updates.blockedReason = undefined;

    if (updateMsg.trim()) {
      const item = getWorkItem(selectedId);
      updates.updates = [
        ...(item?.updates || []),
        { id: `u-${Date.now()}`, userId: user?._id, userName: user?.name, message: updateMsg, timestamp: new Date().toISOString() },
      ];
    }

    updateWorkItem(selectedId, updates);
    toast.success('Task updated');
    setUpdateMsg('');
  };

  const selected = selectedId ? getWorkItem(selectedId) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
        <p className="text-muted-foreground text-sm mt-1">Update progress and manage your work items</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task list */}
        <div className="space-y-2">
          {myTasks.map((w) => (
            <Card
              key={w._id}
              className={`shadow-card cursor-pointer transition-all ${selectedId === w._id ? 'ring-2 ring-primary' : 'hover:shadow-elevated'}`}
              onClick={() => selectTask(w._id)}
            >
              <CardContent className="p-3">
                <p className="text-sm font-medium text-foreground">{w.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={w.progress} className="h-1.5 flex-1" />
                  <span className="text-xs font-mono text-muted-foreground">{w.progress}%</span>
                </div>
                <div className="flex gap-1 mt-2">
                  <PriorityBadge priority={w.priority} />
                  <StatusBadge status={w.status} />
                </div>
              </CardContent>
            </Card>
          ))}
          {myTasks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No tasks assigned</p>
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {selected ? (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">{selected.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{selected.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Progress (%)</Label>
                    <Input type="number" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as WorkStatus)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {status === 'blocked' && (
                  <div>
                    <Label className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-destructive" /> Blocked Reason</Label>
                    <Textarea value={blockedReason} onChange={(e) => setBlockedReason(e.target.value)} placeholder="Explain what's blocking this task" />
                  </div>
                )}

                <div>
                  <Label className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Add Update</Label>
                  <Textarea value={updateMsg} onChange={(e) => setUpdateMsg(e.target.value)} placeholder="Document progress or notes" />
                </div>

                <Button onClick={handleSave} className="gradient-primary text-primary-foreground">
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>

                {/* Update history */}
                {selected.updates.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Update History</p>
                    <div className="space-y-2">
                      {selected.updates.slice().reverse().map((u) => (
                        <div key={u.id} className="p-2 rounded-lg bg-muted/50">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-foreground">{u.userName}</span>
                            <span className="text-muted-foreground">{new Date(u.timestamp).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{u.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Select a task to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTasks;
