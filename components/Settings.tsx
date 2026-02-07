
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../App';
import { CURRENCIES, THEME_COLORS } from '../constants';
import { Moderator, UIConfig } from '../types';

const Settings: React.FC = () => {
  const { user, setUser, role, moderatorName, t, syncUserProfile, resetApp, theme, language } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState({ 
    name: user?.name || '', 
    mobile: user?.mobile || '', 
    email: user?.email || '',
    currency: user?.currency || '৳',
    slogan: user?.slogan || '',
    description: user?.description || '',
    password: user?.password || ''
  });

  const [uiConfig, setUiConfig] = useState<UIConfig>(user?.uiConfig || {
    headlineSize: 1.25,
    bodySize: 0.875,
    btnScale: 1
  });

  const [showPin, setShowPin] = useState(false);
  const [pinVerification, setPinVerification] = useState('');
  const [modForm, setModForm] = useState({ name: '', email: '', code: '' });
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'moderators' | 'appearance' | 'system'>('profile');

  useEffect(() => {
    if (user?.uiConfig) setUiConfig(user.uiConfig);
  }, [user?.uiConfig]);

  if (role === 'MODERATOR') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full flex items-center justify-center border-4 border-rose-100 dark:border-rose-900 shadow-xl">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <div>
           <h2 className="text-2xl font-black uppercase tracking-widest dark:text-white">Moderator Access</h2>
           <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-widest">You have limited permissions in this view.</p>
        </div>
        <button 
          onClick={() => {
            const pin = prompt(language === 'EN' ? 'Enter Admin Secret PIN:' : 'এডমিন সিক্রেট পিন দিন:');
            if (pin === user?.secretCode) setUser(user, 'ADMIN');
          }}
          className="px-10 py-5 bg-primary text-white font-black rounded-2xl shadow-2xl uppercase tracking-[0.2em] text-[11px] border-b-8 border-black/20"
        >
          Switch to Admin
        </button>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const pin = prompt(language === 'EN' ? 'Enter Secret PIN to save:' : 'সেভ করতে সিক্রেট পিন দিন:');
    if (pin !== user.secretCode) return alert('Invalid PIN!');
    
    const updatedUser = { ...user, ...profileData, uiConfig };
    await syncUserProfile(updatedUser);
    alert('Settings Updated Successfully!');
  };

  const handleUiChange = (key: keyof UIConfig, value: number) => {
    setUiConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleColorChange = async (color: string) => {
    if (!user) return;
    const updatedUser = { ...user, primaryColor: color };
    await syncUserProfile(updatedUser);
  };

  const handleAddModerator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const newMod: Moderator = { id: 'MOD-' + Date.now(), ...modForm };
    const updatedUser = { ...user, moderators: [...(user.moderators || []), newMod] };
    await syncUserProfile(updatedUser);
    setModForm({ name: '', email: '', code: '' });
  };

  const menuItems = [
    { id: 'profile', label: 'Shop Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    { id: 'moderators', label: 'Moderators', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'appearance', label: 'Appearance', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
    { id: 'system', label: 'System', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20 max-w-6xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <aside className="lg:w-64 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar">
        {menuItems.map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex items-center px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-b-4 ${activeTab === item.id ? 'bg-primary text-white shadow-xl border-black/20' : 'bg-white dark:bg-gray-800 text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <svg className="w-5 h-5 mr-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} /></svg>
            {item.label}
          </button>
        ))}
      </aside>

      <div className="flex-1 space-y-6">
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-sm border dark:border-gray-700 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row items-center gap-10 mb-10">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[40px] bg-gray-50 dark:bg-gray-900 border-4 border-primary/20 flex items-center justify-center overflow-hidden shadow-inner">
                   {user?.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : <span className="text-2xl font-black text-primary/20">LOGO</span>}
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-2xl shadow-xl">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeWidth={2.5}/></svg>
                </button>
                <input type="file" ref={fileInputRef} onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file && user) {
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                      const updatedUser = { ...user, profilePic: reader.result as string };
                      await syncUserProfile(updatedUser);
                    };
                    reader.readAsDataURL(file);
                  }
                }} accept="image/*" className="hidden" />
              </div>
              <div className="flex-1 space-y-4 w-full">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-2xl outline-none font-bold text-xs" placeholder="Shop Name" />
                    <input type="text" value={profileData.mobile} onChange={e => setProfileData({...profileData, mobile: e.target.value})} className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-2xl outline-none font-bold text-xs" placeholder="Mobile Number" />
                 </div>
                 <input type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-2xl outline-none font-bold text-xs" placeholder="Business Email" />
                 <input type="text" value={profileData.slogan} onChange={e => setProfileData({...profileData, slogan: e.target.value})} className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-2xl outline-none font-bold text-xs" placeholder="Shop Slogan (e.g. Pure Tradition)" />
                 <textarea value={profileData.description} onChange={e => setProfileData({...profileData, description: e.target.value})} className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-2xl outline-none font-bold text-xs h-24" placeholder="Short Business Description" />
                 <select value={profileData.currency} onChange={e => setProfileData({...profileData, currency: e.target.value})} className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-2xl outline-none font-black text-xs">
                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
                 </select>
                 
                 <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-[30px] space-y-6">
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest">Interface Scaling</p>
                    <div className="space-y-4">
                       <div>
                          <label className="flex justify-between text-[9px] font-bold text-gray-400 uppercase mb-2"><span>Headline Size</span><span>{uiConfig.headlineSize}rem</span></label>
                          <input type="range" min="1.25" max="2.5" step="0.05" value={uiConfig.headlineSize} onChange={e => handleUiChange('headlineSize', parseFloat(e.target.value))} className="w-full accent-primary" />
                       </div>
                       <div>
                          <label className="flex justify-between text-[9px] font-bold text-gray-400 uppercase mb-2"><span>Body Text Size</span><span>{uiConfig.bodySize}rem</span></label>
                          <input type="range" min="0.7" max="1.1" step="0.02" value={uiConfig.bodySize} onChange={e => handleUiChange('bodySize', parseFloat(e.target.value))} className="w-full accent-primary" />
                       </div>
                       <div>
                          <label className="flex justify-between text-[9px] font-bold text-gray-400 uppercase mb-2"><span>Button Scale</span><span>{uiConfig.btnScale}x</span></label>
                          <input type="range" min="0.8" max="1.2" step="0.05" value={uiConfig.btnScale} onChange={e => handleUiChange('btnScale', parseFloat(e.target.value))} className="w-full accent-primary" />
                       </div>
                    </div>
                 </div>

                 <button onClick={handleUpdateProfile} className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl uppercase tracking-widest text-[10px] border-b-4 border-black/20">{t('save')}</button>
              </div>
            </div>
          </div>
        )}
        {/* Rest of the Tabs... */}
      </div>
    </div>
  );
};

export default Settings;
