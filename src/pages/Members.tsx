import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';

const Members = () => {
  const { members, addMember, deleteMember, getMemberWorkload } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [skills, setSkills] = useState('');
  const [capacity, setCapacity] = useState(4);

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) { toast.error('Name and email required'); return; }
    addMember({
      name, email, role: 'member',
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      capacity,
    });
    toast.success('Member added');
    setName(''); setEmail(''); setSkills(''); setCapacity(4); setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Members</h1>
          <p className="text-muted-foreground text-sm mt-1">{members.length} members</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground"><Plus className="w-4 h-4 mr-2" />Add Member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Member</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" /></div>
              <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" /></div>
              <div><Label>Skills (comma-separated)</Label><Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Node.js" /></div>
              <div><Label>Capacity (max tasks)</Label><Input type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} /></div>
              <Button onClick={handleSubmit} className="w-full gradient-primary text-primary-foreground">Add Member</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map((m) => {
          const workload = getMemberWorkload(m._id);
          const load = workload.length;
          const overloaded = load >= m.capacity;
          return (
            <Card key={m._id} className="shadow-card">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-foreground">{m.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { deleteMember(m._id); toast.success('Member removed'); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {m.skills.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Workload</span>
                    <span className={overloaded ? 'text-destructive font-medium' : 'text-muted-foreground'}>{load}/{m.capacity}</span>
                  </div>
                  <Progress value={(load / m.capacity) * 100} className="h-1.5" />
                </div>
                {workload.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {workload.map((w) => (
                      <p key={w._id} className="text-xs text-muted-foreground truncate">• {w.title} ({w.progress}%)</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Members;
