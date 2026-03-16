
import React, { useState, useRef } from 'react';
import { User } from '../types.ts';
import { sendNotificationEmail } from '../services/notificationService.ts';
import { 
  Moon, Sun, Mail, Check, Shield, Bell, Key, Save, 
  Loader2, Sparkles, Phone, School, User as UserIcon, Layout, X, Camera, Trash2
} from 'lucide-react';

interface SettingsProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (document.documentElement.classList.contains('dark') ? 'dark' : 'light')
  );
  
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    institution: user.institution || '',
    profilePicture: user.profilePicture || ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('edugenius_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('edugenius_theme', 'light');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData(prev => ({ ...prev, profilePicture: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, profilePicture: '' }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const updatedUser = { ...user, ...formData };
    
    localStorage.setItem('edugenius_user', JSON.stringify(updatedUser));
    
    const users = JSON.parse(localStorage.getItem('noteforge_users') || '[]');
    const updatedUsers = users.map((u: User) => u.id === user.id ? updatedUser : u);
    localStorage.setItem('noteforge_users', JSON.stringify(updatedUsers));

    const changedFields: string[] = [];
    if (formData.name !== user.name) changedFields.push('Name');
    if (formData.email !== user.email) changedFields.push('Email');
    if (formData.phone !== user.phone) changedFields.push('Phone');
    if (formData.institution !== user.institution) changedFields.push('Institution');
    if (formData.profilePicture !== user.profilePicture) changedFields.push('Profile Picture');

    if (changedFields.length > 0) {
      await sendNotificationEmail('PROFILE_UPDATE', { 
        name: updatedUser.name, 
        email: updatedUser.email, 
        fields: changedFields 
      });
    }
    
    onUpdateUser(updatedUser);
    setIsSaving(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-10 pb-20 md:pb-0">
      <div className="flex justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Configuration</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your professional profile.</p>
        </div>
        {showSavedToast && (
          <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg animate-fade-up">
            <Check className="w-3.5 h-3.5" /> Synchronized & Real Notification Sent
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="flex lg:flex-col overflow-x-auto gap-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap flex-shrink-0 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-slate-800'}`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-8">
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-8 md:p-14 shadow-sm animate-in fade-in duration-500">
              
              <div className="flex flex-col md:flex-row items-center gap-10 mb-14 border-b border-slate-100 dark:border-slate-800 pb-12">
                <div className="relative group">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-xl relative">
                    {formData.profilePicture ? (
                      <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <UserIcon className="w-12 h-12 md:w-16 md:h-16" />
                      </div>
                    )}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white gap-2 cursor-pointer"
                    >
                      <Camera className="w-8 h-8" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Change Photo</span>
                    </button>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                  />
                </div>
                <div className="space-y-4 text-center md:text-left">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Identity Portrait</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs">
                    Upload a professional portrait to personalize your intelligence workspace. Recommended size: 512x512px.
                  </p>
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Upload New
                    </button>
                    {formData.profilePicture && (
                      <button 
                        onClick={handleRemovePhoto}
                        className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-bold dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-bold dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-bold dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Institution</label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({...formData, institution: e.target.value})}
                    className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-bold dark:text-white"
                  />
                </div>
              </div>
              <div className="mt-12 flex flex-col items-end gap-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Saving will trigger an Email notification</p>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm shadow-lg flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Sync & Notify
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-8 md:p-14 shadow-sm animate-in fade-in duration-500">
               <div className="grid grid-cols-2 gap-6">
                <button
                  onClick={() => toggleTheme('light')}
                  className={`p-8 rounded-[2rem] border-4 transition-all flex flex-col items-center gap-4 ${theme === 'light' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'bg-slate-50 dark:bg-slate-850 text-slate-400 border-transparent'}`}
                >
                  <Sun className="w-8 h-8" />
                  <span className="font-black text-sm uppercase tracking-widest">Light Mode</span>
                </button>
                <button
                  onClick={() => toggleTheme('dark')}
                  className={`p-8 rounded-[2rem] border-4 transition-all flex flex-col items-center gap-4 ${theme === 'dark' ? 'border-indigo-600 bg-indigo-900/30 text-indigo-400' : 'bg-slate-50 dark:bg-slate-850 text-slate-400 border-transparent'}`}
                >
                  <Moon className="w-8 h-8" />
                  <span className="font-black text-sm uppercase tracking-widest">Dark Mode</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
