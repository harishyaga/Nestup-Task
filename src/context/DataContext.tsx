import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { WorkItem, User, Dependency } from '@/types';
import { mockWorkItems, mockUsers } from '@/data/mockData';

interface DataContextType {
  workItems: WorkItem[];
  members: User[];
  addWorkItem: (item: Omit<WorkItem, '_id' | 'createdAt' | 'updatedAt' | 'updates' | 'dependents'>) => void;
  updateWorkItem: (id: string, updates: Partial<WorkItem>) => void;
  deleteWorkItem: (id: string) => void;
  addMember: (member: Omit<User, '_id'>) => void;
  deleteMember: (id: string) => void;
  getWorkItem: (id: string) => WorkItem | undefined;
  getMember: (id: string) => User | undefined;
  getReadyItems: () => WorkItem[];
  getBlockedItems: () => WorkItem[];
  getMemberWorkload: (memberId: string) => WorkItem[];
  checkCircularDependency: (itemId: string, deps: Dependency[]) => boolean;
  suggestAssignment: (item: WorkItem) => User | undefined;
  getDependencyChain: (itemId: string) => WorkItem[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [workItems, setWorkItems] = useState<WorkItem[]>(mockWorkItems);
  const [members, setMembers] = useState<User[]>(mockUsers.filter((u) => u.role === 'member'));

  const getWorkItem = useCallback((id: string) => workItems.find((w) => w._id === id), [workItems]);
  const getMember = useCallback((id: string) => members.find((m) => m._id === id), [members]);

  const addWorkItem = useCallback(
    (item: Omit<WorkItem, '_id' | 'createdAt' | 'updatedAt' | 'updates' | 'dependents'>) => {
      const now = new Date().toISOString();
      const newItem: WorkItem = {
        ...item,
        _id: `work-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        updates: [],
        dependents: [],
      };
      setWorkItems((prev) => {
        const updated = [...prev, newItem];
        // update dependents for dependencies
        return updated.map((w) => {
          if (newItem.dependencies.some((d) => d.workItemId === w._id)) {
            return { ...w, dependents: [...w.dependents, newItem._id] };
          }
          return w;
        });
      });
    },
    []
  );

  const updateWorkItem = useCallback((id: string, updates: Partial<WorkItem>) => {
    setWorkItems((prev) =>
      prev.map((w) => (w._id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w))
    );
  }, []);

  const deleteWorkItem = useCallback((id: string) => {
    setWorkItems((prev) =>
      prev
        .filter((w) => w._id !== id)
        .map((w) => ({
          ...w,
          dependencies: w.dependencies.filter((d) => d.workItemId !== id),
          dependents: w.dependents.filter((d) => d !== id),
        }))
    );
  }, []);

  const addMember = useCallback((member: Omit<User, '_id'>) => {
    setMembers((prev) => [...prev, { ...member, _id: `member-${Date.now()}` }]);
  }, []);

  const deleteMember = useCallback((id: string) => {
    setMembers((prev) => prev.filter((m) => m._id !== id));
    setWorkItems((prev) =>
      prev.map((w) => (w.assignedTo === id ? { ...w, assignedTo: undefined, assignedToName: undefined } : w))
    );
  }, []);

  const isDependencyMet = useCallback(
    (dep: Dependency): boolean => {
      const item = workItems.find((w) => w._id === dep.workItemId);
      if (!item) return false;
      if (dep.type === 'full') return item.progress >= 100;
      return item.progress >= dep.requiredPercentage;
    },
    [workItems]
  );

  const getReadyItems = useCallback(() => {
    return workItems.filter(
      (w) =>
        w.status !== 'completed' &&
        w.status !== 'blocked' &&
        w.dependencies.every((d) => isDependencyMet(d))
    );
  }, [workItems, isDependencyMet]);

  const getBlockedItems = useCallback(() => {
    return workItems.filter(
      (w) => w.status === 'blocked' || (w.dependencies.length > 0 && !w.dependencies.every((d) => isDependencyMet(d)))
    );
  }, [workItems, isDependencyMet]);

  const getMemberWorkload = useCallback(
    (memberId: string) => workItems.filter((w) => w.assignedTo === memberId && w.status !== 'completed'),
    [workItems]
  );

  const checkCircularDependency = useCallback(
    (itemId: string, deps: Dependency[]): boolean => {
      const visited = new Set<string>();
      const check = (currentId: string): boolean => {
        if (currentId === itemId) return true;
        if (visited.has(currentId)) return false;
        visited.add(currentId);
        const item = workItems.find((w) => w._id === currentId);
        if (!item) return false;
        return item.dependents.some((d) => check(d));
      };
      return deps.some((d) => check(d.workItemId));
    },
    [workItems]
  );

  const suggestAssignment = useCallback(
    (item: WorkItem): User | undefined => {
      const candidates = members.filter((m) => {
        const hasSkill = item.skills.some((s) => m.skills.includes(s));
        const workload = workItems.filter((w) => w.assignedTo === m._id && w.status !== 'completed').length;
        return hasSkill && workload < m.capacity;
      });
      if (!candidates.length) return undefined;
      // sort by least workload, then most skill match
      return candidates.sort((a, b) => {
        const aLoad = workItems.filter((w) => w.assignedTo === a._id && w.status !== 'completed').length;
        const bLoad = workItems.filter((w) => w.assignedTo === b._id && w.status !== 'completed').length;
        if (aLoad !== bLoad) return aLoad - bLoad;
        const aSkills = item.skills.filter((s) => a.skills.includes(s)).length;
        const bSkills = item.skills.filter((s) => b.skills.includes(s)).length;
        return bSkills - aSkills;
      })[0];
    },
    [members, workItems]
  );

  const getDependencyChain = useCallback(
    (itemId: string): WorkItem[] => {
      const chain: WorkItem[] = [];
      const visited = new Set<string>();
      const traverse = (id: string) => {
        if (visited.has(id)) return;
        visited.add(id);
        const item = workItems.find((w) => w._id === id);
        if (!item) return;
        chain.push(item);
        item.dependencies.forEach((d) => traverse(d.workItemId));
      };
      traverse(itemId);
      return chain;
    },
    [workItems]
  );

  return (
    <DataContext.Provider
      value={{
        workItems,
        members,
        addWorkItem,
        updateWorkItem,
        deleteWorkItem,
        addMember,
        deleteMember,
        getWorkItem,
        getMember,
        getReadyItems,
        getBlockedItems,
        getMemberWorkload,
        checkCircularDependency,
        suggestAssignment,
        getDependencyChain,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
