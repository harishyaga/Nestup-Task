import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { Progress } from '@/components/ui/progress';
import { Priority, WorkStatus, Dependency } from '@/types';
import { Plus, Trash2, Search, GitBranch } from 'lucide-react';
import { toast } from 'sonner';

const WorkItems = () => {
  const { workItems, members, addWorkItem, updateWorkItem, deleteWorkItem, checkCircularDependency, suggestAssignment, getWorkItem } = useData();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [skills, setSkills] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(8);
  const [deps, setDeps] = useState<Dependency[]>([]);

  const resetForm = () => {
    setTitle(''); setDescription(''); setPriority('medium'); setAssignedTo('');
    setSkills(''); setEstimatedHours(8); setDeps([]); setEditId(null);
  };

  const openEdit = (id: string) => {
    const item = getWorkItem(id);
    if (!item) return;
    setTitle(item.title); setDescription(item.description); setPriority(item.priority);
    setAssignedTo(item.assignedTo || ''); setSkills(item.skills.join(', '));
    setEstimatedHours(item.estimatedHours); setDeps(item.dependencies);
    setEditId(id); setIsOpen(true);
  };

  const handleSubmit = () => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    const skillsArr = skills.split(',').map((s) => s.trim()).filter(Boolean);
    const member = members.find((m) => m._id === assignedTo);

    if (editId) {
      updateWorkItem(editId, {
        title, description, priority, assignedTo: assignedTo || undefined,
        assignedToName: member?.name, skills: skillsArr, estimatedHours, dependencies: deps,
      });
      toast.success('Work item updated');
    } else {
      if (deps.length > 0 && checkCircularDependency('new', deps)) {
        toast.error('Circular dependency detected!');
        return;
      }
      addWorkItem({
        title, description, priority, status: 'pending', progress: 0,
        assignedTo: assignedTo || undefined, assignedToName: member?.name,
        skills: skillsArr, estimatedHours, dependencies: deps, blockedReason: undefined,
      });
      toast.success('Work item created');
    }
    resetForm(); setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteWorkItem(id);
    toast.success('Work item deleted');
  };

  const addDep = () => setDeps([...deps, { workItemId: '', type: 'full', requiredPercentage: 100 }]);
  const removeDep = (i: number) => setDeps(deps.filter((_, idx) => idx !== i));
  const updateDep = (i: number, field: string, val: string | number) =>
    setDeps(deps.map((d, idx) => idx === i ? { ...d, [field]: val, ...(field === 'type' && val === 'full' ? { requiredPercentage: 100 } : {}) } : d));

  const filtered = workItems.filter((w) => {
    const matchSearch = w.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || w.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Work Items</h1>
          <p className="text-muted-foreground text-sm mt-1">{workItems.length} total items</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" /> New Work Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editId ? 'Edit' : 'Create'} Work Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Work item title" /></div>
              <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the work" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(['low', 'medium', 'high', 'critical'] as Priority[]).map((p) => (
                        <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assign To</Label>
                  <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Skills (comma-separated)</Label><Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Node.js" /></div>
                <div><Label>Est. Hours</Label><Input type="number" value={estimatedHours} onChange={(e) => setEstimatedHours(Number(e.target.value))} /></div>
              </div>

              {/* Dependencies */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-1"><GitBranch className="w-3 h-3" /> Dependencies</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={addDep}><Plus className="w-3 h-3 mr-1" />Add</Button>
                </div>
                {deps.map((d, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-end">
                    <div className="flex-1">
                      <Select value={d.workItemId} onValueChange={(v) => updateDep(i, 'workItemId', v)}>
                        <SelectTrigger className="text-xs"><SelectValue placeholder="Select item" /></SelectTrigger>
                        <SelectContent>
                          {workItems.filter((w) => w._id !== editId).map((w) => (
                            <SelectItem key={w._id} value={w._id} className="text-xs">{w.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Select value={d.type} onValueChange={(v) => updateDep(i, 'type', v)}>
                      <SelectTrigger className="w-24 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                      </SelectContent>
                    </Select>
                    {d.type === 'partial' && (
                      <Input type="number" className="w-16 text-xs" value={d.requiredPercentage} min={1} max={99}
                        onChange={(e) => updateDep(i, 'requiredPercentage', Number(e.target.value))} />
                    )}
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeDep(i)} className="text-destructive"><Trash2 className="w-3 h-3" /></Button>
                  </div>
                ))}
              </div>

              <Button onClick={handleSubmit} className="w-full gradient-primary text-primary-foreground">
                {editId ? 'Update' : 'Create'} Work Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((w) => (
          <Card key={w._id} className="shadow-card hover:shadow-elevated transition-shadow cursor-pointer" onClick={() => openEdit(w._id)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">{w.title}</p>
                    {w.dependencies.length > 0 && (
                      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                        <GitBranch className="w-3 h-3" />{w.dependencies.length}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{w.assignedToName || 'Unassigned'} · {w.estimatedHours}h</p>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={w.priority} />
                  <StatusBadge status={w.status} />
                  <Button variant="ghost" size="sm" className="text-destructive"
                    onClick={(e) => { e.stopPropagation(); handleDelete(w._id); }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <Progress value={w.progress} className="h-1.5 flex-1" />
                <span className="text-xs font-mono text-muted-foreground">{w.progress}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WorkItems;
