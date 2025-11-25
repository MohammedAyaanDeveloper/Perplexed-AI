import React, { useState } from 'react';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (email: string, pass: string) => Promise<void>;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await onLogin(email, password);
      } else {
        await onRegister(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#111] p-4">
      <div className="w-full max-w-md">
        
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500 text-white mb-4 shadow-lg shadow-teal-500/30">
            <span className="text-3xl font-bold">P</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Perplexed AI</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Your intelligent companion for everything.</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          
          {/* Tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-800">
            <button
              className={`flex-1 py-4 text-sm font-medium transition-colors ${isLogin ? 'text-teal-600 border-b-2 border-teal-500 bg-teal-50/50 dark:bg-teal-900/10' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              onClick={() => { setIsLogin(true); setError(''); }}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-4 text-sm font-medium transition-colors ${!isLogin ? 'text-teal-600 border-b-2 border-teal-500 bg-teal-50/50 dark:bg-teal-900/10' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              onClick={() => { setIsLogin(false); setError(''); }}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/30">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#2d2d2d] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-gray-900 dark:text-white transition-all"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                <input
                  type="password"
                  placeholder="Password (min 8 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#2d2d2d] border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-gray-900 dark:text-white transition-all"
                />
              </div>

              {isLogin && (
                 <div className="flex items-center">
                    <input id="remember" type="checkbox" className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-500 dark:text-gray-400">Remember me</label>
                 </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-xl transition-all transform active:scale-[0.98] shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center mt-8 text-xs text-gray-400">
          Powered by Google Gemini API
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;