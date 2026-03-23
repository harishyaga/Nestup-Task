export type UserRole = 'admin' | 'member';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  skills: string[];
  capacity: number; // max work items
  avatar?: string;
}

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type WorkStatus = 'pending' | 'in_progress' | 'blocked' | 'completed';

export interface Dependency {
  workItemId: string;
  type: 'partial' | 'full';
  requiredPercentage: number; // for partial: X%, for full: 100
}

export interface WorkUpdate {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

export interface WorkItem {
  _id: string;
  title: string;
  description: string;
  status: WorkStatus;
  priority: Priority;
  progress: number; // 0-100
  assignedTo?: string;
  assignedToName?: string;
  dependencies: Dependency[];
  dependents: string[]; // work items that depend on this
  blockedReason?: string;
  updates: WorkUpdate[];
  skills: string[];
  estimatedHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}
