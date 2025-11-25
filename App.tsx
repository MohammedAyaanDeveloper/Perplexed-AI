import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, Chat, Message, AppState } from './types';
import * as Storage from './services/storage';
import { sendMessageToGemini } from './services/geminiService';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import PaymentModal from './components/PaymentModal';

const App: React.FC = () => {
  // --- State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTemporary, setIsTemporary] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // --- Initialization ---
  useEffect(() => {
    const users = Storage.getUsers();
    setAllUsers(users);
    
    const storedUserId = Storage.getCurrentUserId();
    const appState = Storage.getStoredAppState();

    if (storedUserId) {
      const user = users.find(u => u.id === storedUserId);
      if (user) {
        setCurrentUser(user);
        loadUserChats(user.id);
        if (user.settings.theme === 'dark') {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }
      }
    }

    if (appState.sidebarCollapsed !== undefined) {
      setSidebarCollapsed(appState.sidebarCollapsed);
    }
  }, []);

  // --- Helpers ---
  const loadUserChats = (userId: string) => {
    const loadedChats = Storage.getUserChats(userId);
    // Sort by updated at desc
    loadedChats.sort((a, b) => b.updatedAt - a.updatedAt);
    setChats(loadedChats);
  };

  const createNewChat = useCallback((temp = false) => {
    setIsTemporary(temp);
    setCurrentChatId(null);
    setMessages([]);
  }, []);

  // --- Auth Handlers ---
  const handleLogin = async (email: string, pass: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Always fetch latest users from storage to avoid stale state issues
    const currentUsers = Storage.getUsers();
    
    // Simple mock auth
    const user = currentUsers.find(u => u.email.toLowerCase() === normalizedEmail && u.passwordHash === btoa(pass));
    
    if (user) {
      // Update local state if it was stale
      setAllUsers(currentUsers);
      
      setCurrentUser(user);
      Storage.setCurrentUserId(user.id);
      loadUserChats(user.id);
      setIsDark(user.settings.theme === 'dark');
      if (user.settings.theme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const handleRegister = async (email: string, pass: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    // Fetch latest users
    const currentUsers = Storage.getUsers();
    
    if (currentUsers.some(u => u.email.toLowerCase() === normalizedEmail)) {
      throw new Error('Email already exists');
    }
    
    const newUser: User = {
      id: uuidv4(),
      email: normalizedEmail,
      passwordHash: btoa(pass),
      plan: 'free', // Default plan
      createdAt: Date.now(),
      settings: { 
        theme: 'light',
        useMockApi: !process.env.API_KEY // Default to Mock if no key provided
      }
    };
    Storage.saveUser(newUser);
    
    // Update local state for users
    const updatedUsers = [...currentUsers, newUser];
    setAllUsers(updatedUsers);

    // Auto login manually
    setCurrentUser(newUser);
    Storage.setCurrentUserId(newUser.id);
    loadUserChats(newUser.id);
    
    // Default to light mode for new users
    setIsDark(false);
    document.documentElement.classList.remove('dark');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    Storage.setCurrentUserId(null);
    setChats([]);
    setMessages([]);
    setCurrentChatId(null);
  };

  const handleSwitchAccount = (userId: string) => {
    const users = Storage.getUsers(); // Get latest
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      Storage.setCurrentUserId(user.id);
      loadUserChats(user.id);
      setIsDark(user.settings.theme === 'dark');
      if (user.settings.theme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      createNewChat();
    }
  };

  const handleUpgrade = async () => {
    if (!currentUser) return;
    
    // Create updated user object
    const updatedUser: User = { ...currentUser, plan: 'pro' };
    
    // Save to storage
    Storage.saveUser(updatedUser);
    
    // Update state
    setCurrentUser(updatedUser);
    
    // Update allUsers list in state
    const users = Storage.getUsers();
    setAllUsers(users);
  };

  // --- Chat Handlers ---
  const handleSendMessage = async (text: string) => {
    if (!currentUser) return;

    const newMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Prepare chat object for storage
    let chatId = currentChatId;
    let isNewChat = false;

    if (!chatId) {
      chatId = uuidv4();
      isNewChat = true;
      setCurrentChatId(chatId);
    }

    // Call Gemini API (or Mock)
    try {
      const useMock = currentUser.settings.useMockApi;
      const { text: responseText, sources } = await sendMessageToGemini(updatedMessages, text, useMock);
      
      const aiMessage: Message = {
        id: uuidv4(),
        role: 'model',
        content: responseText,
        sources: sources,
        timestamp: Date.now()
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);

      // Save if not temporary
      if (!isTemporary && chatId) {
        const title = isNewChat ? (text.slice(0, 40) + (text.length > 40 ? '...' : '')) : (chats.find(c => c.id === chatId)?.title || 'New Chat');
        
        const chatToSave: Chat = {
          id: chatId,
          userId: currentUser.id,
          title,
          messages: finalMessages,
          isTemporary: false,
          createdAt: isNewChat ? Date.now() : (chats.find(c => c.id === chatId)?.createdAt || Date.now()),
          updatedAt: Date.now()
        };

        Storage.saveChat(currentUser.id, chatToSave);
        loadUserChats(currentUser.id); // Refresh sidebar
      }

    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'model',
        content: `I'm sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key or try enabling Mock Mode.`,
        timestamp: Date.now()
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
      setIsTemporary(false);
      // On mobile, close sidebar
      if (window.innerWidth < 768) setSidebarCollapsed(true);
    }
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    Storage.deleteChat(currentUser.id, chatId);
    loadUserChats(currentUser.id);
    if (currentChatId === chatId) {
      createNewChat();
    }
  };

  // --- UI Handlers ---
  const handleToggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    Storage.saveStoredAppState({ sidebarCollapsed: newState });
  };

  const handleToggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    
    if (currentUser) {
      const updatedUser: User = { ...currentUser, settings: { ...currentUser.settings, theme: newTheme ? 'dark' : 'light' } };
      setCurrentUser(updatedUser);
      Storage.saveUser(updatedUser);
    }
  };

  const handleToggleMockApi = () => {
    if (currentUser) {
      const newMode = !currentUser.settings.useMockApi;
      const updatedUser: User = { ...currentUser, settings: { ...currentUser.settings, useMockApi: newMode } };
      setCurrentUser(updatedUser);
      Storage.saveUser(updatedUser);
    }
  };

  // Render logic
  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} />;
  }

  const currentChatObject = chats.find(c => c.id === currentChatId) || null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#1a1a1a]">
      <Sidebar 
        chats={chats}
        currentChatId={currentChatId}
        collapsed={sidebarCollapsed}
        currentUser={currentUser}
        users={allUsers}
        isDark={isDark}
        onNewChat={() => createNewChat(false)}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onToggleSidebar={handleToggleSidebar}
        onToggleTheme={handleToggleTheme}
        onToggleMock={handleToggleMockApi}
        onLogout={handleLogout}
        onSwitchAccount={handleSwitchAccount}
        onUpgrade={() => setShowPaymentModal(true)}
      />
      <ChatArea 
        chat={currentChatObject}
        messages={messages}
        isTemp={isTemporary}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onToggleTemp={() => {
            if (messages.length === 0) setIsTemporary(!isTemporary);
            else createNewChat(!isTemporary);
        }}
        onToggleSidebar={handleToggleSidebar}
      />
      
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handleUpgrade}
      />
    </div>
  );
};

export default App;