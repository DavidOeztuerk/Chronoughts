// API Response Types
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  roles: string[];
  createdAt: string;
  lastLoginAt?: string;
}

export interface Thought {
  id: string;
  title: string;
  content: string;
  category: string;
  importance: number;
  status?: string;
  notes?: string;
  tags: string[];
  connectionsCount?: number;
  timestamp?: string;
  createdAt: string;
  updatedAt: string;
  version?: number;
  isArchived?: boolean;
  viewCount?: number;
  attachments?: any[];
  bio?: string;
}

export interface ThoughtConnection {
  id: string;
  sourceThoughtId: string;
  targetThoughtId: string;
  sourceThoughtTitle?: string;
  targetThoughtTitle?: string;
  connectionType: ConnectionType;
  description?: string;
  strength: number;
  createdAt: string;
}

export enum ConnectionType {
  RelatesTo = 'RelatesTo',
  EvolvesFrom = 'EvolvesFrom',
  Contradicts = 'Contradicts',
  Implements = 'Implements',
  GroupsWith = 'GroupsWith',
  References = 'References',
  Continues = 'Continues',
  Replaces = 'Replaces'
}

export interface ThoughtTask {
  id: string;
  thoughtId: string;
  thoughtTitle?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
  estimatedHours: number;
  actualHours?: number;
  parentTaskId?: string;
  parentTaskTitle?: string;
  subTasks: ThoughtTask[];
  progress: number;
}

export enum TaskStatus {
  Todo = 'Todo',
  InProgress = 'InProgress',
  Blocked = 'Blocked',
  Review = 'Review',
  Done = 'Done',
  Cancelled = 'Cancelled'
}

export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export enum TaskType {
  Epic = 'Epic',
  Feature = 'Feature',
  UserStory = 'UserStory',
  Task = 'Task',
  Bug = 'Bug',
  Research = 'Research'
}

// Request Types
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

export interface ThoughtRequest {
  title?: string;
  content?: string;
  category?: string;
  importance?: number;
  status?: string;
  notes?: string;
  tags: string[];
}

export interface ThoughtConnectionRequest {
  sourceThoughtId: string;
  targetThoughtId: string;
  connectionType: ConnectionType;
  description?: string;
  strength: number;
}