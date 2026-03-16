
import React, { useState, useCallback, useEffect } from 'react';
import { User, UserRole } from '../types.ts';
import { 
  Loader2, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  ChevronRight,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { sendNotificationEmail } from '../services/notificationService.ts';

interface AuthProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'signup' | 'verify_pending';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('signup');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('edugenius_theme') || 'light';
    const dark = storedTheme === 'dark';
    setIsDarkMode(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('edugenius_theme', newMode ? 'dark' : 'light');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError(null);

    const token = Math.random().toString(36).substr(2, 12).toUpperCase();
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${firstName} ${lastName}`,
      email,
      role: UserRole.STUDENT,
      isEmailVerified: false,
      emailVerificationToken: token,
      emailVerificationExpires: new Date(Date.now() + 30 * 60 * 1000)
    };

    const existingUsers = JSON.parse(localStorage.getItem('noteforge_users') || '[]');
    if (existingUsers.some((u: User) => u.email === email)) {
      setError("An account with this email already exists.");
      setLoading(false);
      return;
    }
    localStorage.setItem('noteforge_users', JSON.stringify([...existingUsers, newUser]));

    try {
      await sendNotificationEmail('VERIFY_EMAIL', { name: newUser.name, email: newUser.email, token });
      setMode('verify_pending');
    } catch (err) {
      onLogin({...newUser, isEmailVerified: true});
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const existingUsers = JSON.parse(localStorage.getItem('noteforge_users') || '[]');
    const user = existingUsers.find((u: User) => u.email === email);
    if (!user) {
      setError("Account not found.");
      setLoading(false);
      return;
    }
    if (!user.isEmailVerified) {
      setError("Please verify your email.");
      setLoading(false);
      return;
    }
    localStorage.setItem('edugenius_user', JSON.stringify(user));
    onLogin(user);
    setLoading(false);
  };

  const handleGoogleLogin = useCallback(() => {
    setLoading(true);
    setError(null);
    const mockUser: User = {
      id: 'google-' + Math.random().toString(36).substr(2, 9),
      name: 'Intelligence Scholar',
      email: 'scholar@gmail.com',
      role: UserRole.STUDENT,
      isEmailVerified: true
    };
    localStorage.setItem('edugenius_user', JSON.stringify(mockUser));
    
    setTimeout(() => {
      onLogin(mockUser);
      setLoading(false);
    }, 800);
  }, [onLogin]);

  if (mode === 'verify_pending') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 transition-colors duration-500">
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-white/5 text-center space-y-8 shadow-2xl transition-all">
          <div className="w-20 h-20 bg-brand-500/10 text-brand-500 rounded-3xl flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Verify Your Identity</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">We've sent a verification link to secure your intelligence workspace.</p>
          </div>
          <button 
            onClick={() => onLogin({ id: 'temp', name: firstName, email, isEmailVerified: true, role: UserRole.STUDENT })}
            className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold text-sm hover:bg-brand-700 transition-all shadow-xl shadow-brand-600/20 active:scale-95"
          >
            Verify Instantly
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 md:p-12 transition-colors duration-500 relative overflow-y-auto">
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50">
        <button 
          onClick={toggleTheme}
          className="p-3 glass rounded-2xl text-slate-500 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-all shadow-lg active:scale-90"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-200 dark:border-white/5 animate-fade-up">
        
        <div className="w-full md:w-[45%] relative hidden md:block group overflow-hidden border-r border-slate-100 dark:border-white/5 min-h-[600px]">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            alt="AI Intelligence Synthesis"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/30 dark:from-slate-950 dark:via-transparent dark:to-black/30" />
          
          <div className="relative z-10 w-full h-full p-10 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-xl font-black text-white tracking-tighter uppercase">Intelligence Suite</span>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-3xl font-black text-white leading-tight tracking-tight max-w-xs">
                Synthesize Knowledge, Scale Research
              </h2>
              <p className="text-slate-300 text-sm font-medium leading-relaxed max-w-xs">
                Harness the power of Universal Synthesis to transform disparate data into high-performance intelligence.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 sm:p-10 md:p-16 bg-white dark:bg-slate-900 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-8">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {mode === 'signup' ? 'Join the Hub' : 'Enter Workspace'}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {mode === 'signup' ? 'Already using our tools?' : "New to the platform?"}{' '}
                <button 
                  onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
                  className="text-brand-600 font-bold hover:underline transition-all"
                >
                  {mode === 'signup' ? 'Log in' : 'Create account'}
                </button>
              </p>
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl animate-fade-up text-center">
                {error}
              </div>
            )}

            <form onSubmit={mode === 'signup' ? handleSignup : handleLogin} className="space-y-4">
              {mode === 'signup' && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <input 
                    type="text" 
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="flex-1 px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/50 transition-all font-medium text-base placeholder:text-slate-400"
                  />
                  <input 
                    type="text" 
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="flex-1 px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/50 transition-all font-medium text-base placeholder:text-slate-400"
                  />
                </div>
              )}

              <input 
                type="email" 
                placeholder="Institutional Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/50 transition-all font-medium text-base placeholder:text-slate-400"
              />

              <div className="relative group">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/50 transition-all font-medium text-base placeholder:text-slate-400"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {mode === 'signup' && (
                <div className="flex items-center gap-3 px-1 py-2">
                  <input 
                    type="checkbox" 
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="w-5 h-5 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-brand-600 accent-brand-600" 
                  />
                  <label className="text-xs text-slate-500 dark:text-slate-400 font-medium select-none">
                    I agree to the <span className="text-slate-900 dark:text-white font-bold hover:underline cursor-pointer">Intelligence Protocol</span>
                  </label>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-brand-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'signup' ? 'Launch Your Hub' : 'Enter Intelligence Suite')}
              </button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-white/5"></div></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-white dark:bg-slate-900 px-4">Secure Academic Access</div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center gap-3 text-slate-900 dark:text-white font-bold text-sm hover:bg-slate-100 dark:hover:bg-white/10 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
              {loading ? 'Authenticating...' : 'Sign in with Google'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
