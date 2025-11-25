import React, { useMemo } from 'react';
import { Chat, User } from '../types';
import { MessageSquarePlus, Trash2, LogOut, Moon, Sun, ChevronLeft, ChevronRight, User as UserIcon, MessageSquare, Sparkles, Zap, Bot, Network } from 'lucide-react';

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  collapsed: boolean;
  currentUser: User;
  users: User[];
  isDark: boolean;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string, e: React.MouseEvent) => void;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  onToggleMock: () => void;
  onLogout: () => void;
  onSwitchAccount: (userId: string) => void;
  onUpgrade: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  chats,
  currentChatId,
  collapsed,
  currentUser,
  users,
  isDark,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onToggleSidebar,
  onToggleTheme,
  onToggleMock,
  onLogout,
  onSwitchAccount,
  onUpgrade
}) => {
  const groupedChats = useMemo(() => {
    const groups: Record<string, Chat[]> = {
      'Today': [],
      'Yesterday': [],
      'Previous 7 Days': [],
      'Previous 30 Days': [],
      'Older': []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const last7Days = today - (86400000 * 7);
    const last30Days = today - (86400000 * 30);

    chats.forEach(chat => {
      const chatDate = chat.updatedAt;
      if (chatDate >= today) groups['Today'].push(chat);
      else if (chatDate >= yesterday) groups['Yesterday'].push(chat);
      else if (chatDate >= last7Days) groups['Previous 7 Days'].push(chat);
      else if (chatDate >= last30Days) groups['Previous 30 Days'].push(chat);
      else groups['Older'].push(chat);
    });

    return groups;
  }, [chats]);

  if (collapsed) {
    return (
      <div className="h-full bg-gray-50 dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-gray-800 w-0 md:w-16 flex flex-col items-center py-4 transition-all duration-300 overflow-hidden relative">
         <button 
          onClick={onToggleSidebar}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400"
        >
          <ChevronRight size={20} />
        </button>
        
        <div className="mt-16 flex flex-col gap-4">
          <button onClick={onNewChat} className="p-3 bg-teal-500 text-white rounded-full shadow-md hover:bg-teal-600 transition-colors">
            <MessageSquarePlus size={20} />
          </button>
        </div>

        <div className="mt-auto flex flex-col gap-4 mb-4">
           {currentUser.plan === 'free' && (
             <button onClick={onUpgrade} className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors" title="Upgrade to Pro">
               <Zap size={16} />
             </button>
           )}
           <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold select-none cursor-pointer" title={currentUser.email}>
              {currentUser.email[0].toUpperCase()}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-gray-800 w-[280px] flex flex-col transition-all duration-300 z-20 absolute md:relative">
      
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button 
          onClick={onNewChat}
          className="flex items-center gap-2 bg-white dark:bg-[#2d2d2d] border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2.5 text-sm font-medium hover:border-teal-500 dark:hover:border-teal-500 transition-colors w-full shadow-sm text-gray-700 dark:text-gray-200"
        >
          <MessageSquarePlus size={18} className="text-teal-500" />
          <span>New Thread</span>
        </button>
        <button 
          onClick={onToggleSidebar}
          className="ml-2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
        {Object.entries(groupedChats).map(([label, groupChats]) => {
          const chatsInGroup = groupChats as Chat[];
          return chatsInGroup.length > 0 && (
            <div key={label} className="mb-6">
              <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</h3>
              <div className="flex flex-col gap-1">
                {chatsInGroup.map(chat => (
                  <div 
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}
                    className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors ${
                      currentChatId === chat.id 
                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-medium' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2d2d2d]'
                    }`}
                  >
                    <MessageSquare size={16} className={currentChatId === chat.id ? 'text-teal-500' : 'text-gray-400'} />
                    <span className="truncate flex-1">{chat.title || 'New Chat'}</span>
                    
                    <button 
                      onClick={(e) => onDeleteChat(chat.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / Settings */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a1a]">
        <div className="flex flex-col gap-2">
          
          {/* Upgrade Banner */}
          {currentUser.plan === 'free' && (
            <button 
              onClick={onUpgrade}
              className="flex items-center gap-3 px-3 py-2.5 mb-2 text-sm bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100 dark:border-amber-900/30 rounded-xl text-amber-700 dark:text-amber-400 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30 transition-all group"
            >
              <div className="p-1 rounded-md bg-white dark:bg-amber-900/40 text-amber-500 shadow-sm">
                 <Zap size={14} className="fill-current" />
              </div>
              <span className="font-medium">Upgrade to Pro</span>
            </button>
          )}

          {/* Mock API Toggle */}
          <button 
            onClick={onToggleMock}
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${currentUser.settings.useMockApi ? 'text-teal-600 bg-teal-50 dark:bg-teal-900/20 font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2d2d2d]'}`}
          >
            <Network size={18} className={currentUser.settings.useMockApi ? 'text-teal-500' : 'text-gray-400'} />
            <span className="flex-1 text-left">{currentUser.settings.useMockApi ? 'Mock Mode On' : 'Real API Mode'}</span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${currentUser.settings.useMockApi ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${currentUser.settings.useMockApi ? 'left-4.5 translate-x-0.5' : 'left-0.5'}`}></div>
            </div>
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={onToggleTheme}
            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2d2d2d] rounded-lg transition-colors"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* Account Dropdown */}
          <div className="relative group">
            <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2d2d2d] rounded-lg cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-xs text-white">
                {currentUser.email[0].toUpperCase()}
              </div>
              <div className="flex-1 truncate">
                <div className="font-medium flex items-center gap-1.5">
                  {currentUser.email.split('@')[0]}
                  {currentUser.plan === 'pro' && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-teal-500 to-emerald-500 text-white uppercase tracking-wider">
                      PRO
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400">Manage Account</div>
              </div>
            </div>

            {/* Hover Menu for Accounts */}
            <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-[#2d2d2d] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden hidden group-hover:block z-50">
              <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 px-2 py-1">Switch Account</p>
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => u.id !== currentUser.id && onSwitchAccount(u.id)}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded flex items-center gap-2 ${u.id === currentUser.id ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-[10px] text-gray-600">
                        {u.email[0].toUpperCase()}
                    </div>
                    <span className="truncate flex-1">{u.email}</span>
                    {u.plan === 'pro' && <span className="w-2 h-2 rounded-full bg-teal-500"></span>}
                  </button>
                ))}
              </div>
              <button 
                onClick={onLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;