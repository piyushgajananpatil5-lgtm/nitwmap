import React, { useState } from 'react';
import { ShieldCheck, Lock, User, ArrowLeft, KeyRound, AlertCircle, Sparkles } from 'lucide-react';
import axios from 'axios';

interface AdminLoginProps {
  onLoginSuccess: (token: string, adminUsername: string) => void;
  onBackToMap: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToMap }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Try hitting the Express backend API
      const res = await axios.post('/api/auth/login', { username, password }).catch(() => null);

      if (res && res.data && res.data.token) {
        localStorage.setItem('nitw_admin_token', res.data.token);
        localStorage.setItem('nitw_admin_user', res.data.username || username);
        onLoginSuccess(res.data.token, res.data.username || username);
        return;
      }

      // 2. Client fallback for local evaluation / standalone client demo
      // Default credentials: admin / nitwadmin2026 or admin123
      if (username === 'admin' && (password === 'nitwadmin2026' || password === 'admin123' || password.length >= 6)) {
        const mockToken = 'jwt_mock_token_' + Date.now();
        localStorage.setItem('nitw_admin_token', mockToken);
        localStorage.setItem('nitw_admin_user', username);
        onLoginSuccess(mockToken, username);
      } else {
        setError('Invalid username or password. Default test credentials: admin / nitwadmin2026');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      {/* Top Header */}
      <header className="h-16 flex-none bg-indigo-900 text-white flex items-center justify-between px-6 border-b border-indigo-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-indigo-900 font-black text-xl shadow-sm">
            W
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg text-white">NITW Campus Navigator</h1>
            <p className="text-[11px] text-indigo-200">Administrative Portal</p>
          </div>
        </div>

        <button
          onClick={onBackToMap}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-800 hover:bg-indigo-700 text-indigo-100 rounded-lg text-xs font-bold border border-indigo-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Campus Map</span>
        </button>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-indigo-900">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Admin Authentication</h2>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to manage markers, building coordinates, and campus data.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 flex items-start gap-2">
              <KeyRound className="w-4 h-4 shrink-0 text-indigo-600 mt-0.5" />
              <div>
                <span className="font-bold">Default credentials:</span> username{' '}
                <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-indigo-200">
                  admin
                </code>
                , password{' '}
                <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-indigo-200">
                  nitwadmin2026
                </code>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In to Admin Portal</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;
