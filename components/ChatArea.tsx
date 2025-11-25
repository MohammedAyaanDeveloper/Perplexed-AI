import React, { useState, useRef, useEffect } from 'react';
import { Message, Chat } from '../types';
import { Send, Menu, Bot, User as UserIcon, Loader2, Glasses, BookOpen } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatAreaProps {
  chat: Chat | null;
  messages: Message[];
  isTemp: boolean;
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onToggleTemp: () => void;
  onToggleSidebar: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  chat,
  messages,
  isTemp,
  isLoading,
  onSendMessage,
  onToggleTemp,
  onToggleSidebar
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    // Auto-grow textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#1f1f1f] relative">
      
      {/* Header */}
      <div className="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 justify-between bg-white/80 dark:bg-[#1f1f1f]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3 overflow-hidden">
          <button onClick={onToggleSidebar} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg md:hidden">
            <Menu size={20} />
          </button>
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 truncate">
            {isTemp ? 'Temporary Chat' : (chat?.title || 'New Conversation')}
          </h2>
          {isTemp && <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">Incognito</span>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
              <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center mb-4 text-teal-600 dark:text-teal-400">
                <Bot size={32} />
              </div>
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">How can I help you today?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                I can help you with writing, coding, analysis, and answering questions using the Gemini API.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'user' 
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300' 
                  : 'bg-teal-500 text-white'
              }`}>
                {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
              </div>

              {/* Content */}
              <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.role === 'user' && <div className="text-xs text-gray-400 mb-1">You</div>}
                {msg.role === 'model' && <div className="text-xs text-teal-600 dark:text-teal-400 mb-1 font-medium">Gemini</div>}
                
                <div className={`rounded-2xl px-5 py-3.5 shadow-sm text-[15px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gray-100 dark:bg-[#2d2d2d] text-gray-800 dark:text-gray-100'
                    : 'bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800'
                }`}>
                  <MarkdownRenderer content={msg.content} />

                  {/* Sources Display */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700/50">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                        <BookOpen size={14} className="text-teal-500" />
                        <span>Sources</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.sources.map((source, idx) => (
                          <a 
                            key={idx} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-[#252525] hover:bg-gray-100 dark:hover:bg-[#2f2f2f] transition-colors border border-gray-100 dark:border-gray-700 group"
                          >
                            <div className="w-5 h-5 rounded flex-shrink-0 bg-white dark:bg-[#333] flex items-center justify-center text-[10px] text-gray-500 dark:text-gray-400 font-bold shadow-sm group-hover:text-teal-500 group-hover:scale-105 transition-all">
                              {idx + 1}
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-300 truncate font-medium group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                              {source.title}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="flex items-center gap-2 mt-2">
                 <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                 </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-[#1f1f1f] relative">
        <div className="max-w-3xl mx-auto relative">
          <form 
            onSubmit={handleSubmit}
            className={`relative flex items-end gap-2 p-2 rounded-2xl border transition-all duration-200 ${
              input ? 'border-teal-500 shadow-md ring-1 ring-teal-500/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            } bg-gray-50 dark:bg-[#2d2d2d]`}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isTemp ? "Ask anything (history not saved)..." : "Ask anything..."}
              className="w-full bg-transparent border-0 focus:ring-0 resize-none max-h-[200px] min-h-[44px] py-2.5 px-3 text-gray-800 dark:text-gray-100 placeholder-gray-400 text-[15px]"
              rows={1}
            />
            
            <div className="flex items-center gap-2 pb-1.5 pr-1">
               <button
                type="button"
                onClick={onToggleTemp}
                className={`p-2 rounded-full transition-colors ${
                  isTemp 
                    ? 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white' 
                    : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title="Temporary Mode"
              >
                <Glasses size={20} />
              </button>

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`p-2 rounded-full transition-all duration-200 ${
                  input.trim() && !isLoading
                    ? 'bg-teal-500 text-white shadow-sm hover:bg-teal-600 transform hover:scale-105' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </form>
          
          <div className="text-center mt-2">
             <p className="text-[10px] text-gray-400 dark:text-gray-500">
               AI can make mistakes. Consider checking important information.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;