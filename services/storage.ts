import { User, Chat, AppState } from '../types';

const KEYS = {
  USERS: 'ai_clone_users',
  CURRENT_USER_ID: 'ai_clone_current_user_id',
  APP_STATE: 'ai_clone_app_state',
  CHATS_PREFIX: 'ai_clone_chats_',
};

// --- User Management ---

export const getUsers = (): User[] => {
  const data = localStorage.getItem(KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  const existingIndex = users.findIndex((u) => u.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
};

export const getCurrentUserId = (): string | null => {
  return localStorage.getItem(KEYS.CURRENT_USER_ID);
};

export const setCurrentUserId = (id: string | null): void => {
  if (id) {
    localStorage.setItem(KEYS.CURRENT_USER_ID, id);
  } else {
    localStorage.removeItem(KEYS.CURRENT_USER_ID);
  }
};

// --- Chat Management ---

export const getUserChats = (userId: string): Chat[] => {
  const data = localStorage.getItem(`${KEYS.CHATS_PREFIX}${userId}`);
  return data ? JSON.parse(data) : [];
};

export const saveUserChats = (userId: string, chats: Chat[]): void => {
  localStorage.setItem(`${KEYS.CHATS_PREFIX}${userId}`, JSON.stringify(chats));
};

export const saveChat = (userId: string, chat: Chat): void => {
  if (chat.isTemporary) return; // Don't save temporary chats
  
  const chats = getUserChats(userId);
  const existingIndex = chats.findIndex((c) => c.id === chat.id);
  
  if (existingIndex >= 0) {
    chats[existingIndex] = chat;
  } else {
    chats.unshift(chat); // Add new chats to the beginning
  }
  saveUserChats(userId, chats);
};

export const deleteChat = (userId: string, chatId: string): void => {
  const chats = getUserChats(userId);
  const filtered = chats.filter((c) => c.id !== chatId);
  saveUserChats(userId, filtered);
};

// --- App State ---

export const getStoredAppState = (): Partial<AppState> => {
  const data = localStorage.getItem(KEYS.APP_STATE);
  return data ? JSON.parse(data) : {};
};

export const saveStoredAppState = (state: Partial<AppState>): void => {
  const current = getStoredAppState();
  localStorage.setItem(KEYS.APP_STATE, JSON.stringify({ ...current, ...state }));
};