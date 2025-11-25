export interface UserSettings {
  theme: 'light' | 'dark';
  useMockApi: boolean;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string; // Simple hash for demo
  plan: 'free' | 'pro';
  createdAt: number;
  settings: UserSettings;
}

export type Role = 'user' | 'model';

export interface Source {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  sources?: Source[];
}

export interface Chat {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  isTemporary: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  currentUser: User | null;
  currentChatId: string | null;
  isTemporaryMode: boolean;
  sidebarCollapsed: boolean;
}