
import React, { useState, useRef } from 'react';
import { useApp } from '../App';
import { BRAND_INFO, CURRENCIES, THEME_COLORS } from '../constants';
import { Moderator, ThemeMode } from '../types';

const Settings: React.FC = () => {
  const { user, setUser, role, moderatorName, t, language, setLanguage, themeMode, setThemeMode, resetApp } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modFileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    currency: user?.currency || '৳',
  });

  const [newMod, setNewMod] = useState({ name: '', email: '', code: '', profilePic: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [verifySecret, setVerifySecret] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  const saveGlobalUser = (updatedUser: any) => {
    const allUsers = JSON.parse(localStorage.getItem('mm_all_users') || '[]');
    const userIndex = allUsers.findIndex((u: any) => u.id === updatedUser.id);
    if (userIndex !== -1) {
      allUsers[userIndex] = updatedUser;
      localStorage.setItem('mm_all_users', JSON.stringify(allUsers));
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedUser = { ...user, profilePic: reader.result as string };
        setUser(updatedUser, role, moderatorName);
        saveGlobalUser(updatedUser);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModPicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMod({ ...newMod, profilePic: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSetPrimaryColor = (color: string) => {
    if (!user || role === 'MODERATOR') return;
    const updatedUser = { ...user, primaryColor: color };
    setUser(updatedUser, role, moderatorName);
    saveGlobalUser(updatedUser);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdating(true);
    setTimeout(() => {
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser, role, moderatorName);
      saveGlobalUser(updatedUser);
      setIsUpdating(false);
      alert(t('save') + ' Successful!');
    }, 500);
  };

  const handleAddModerator = () => {
    if (!user || !newMod.name || !newMod.email || !newMod.code) {
      alert(language === 'EN' ? 'Please fill all fields' : 'সবগুলো ঘর পূরণ করুন');
      return;
    }
    const moderator: Moderator = {
      id: 'M-' + Date.now(),
      name: newMod.name,
      email: newMod.email,
      code: newMod.code,
      profilePic: newMod.profilePic
    };
    const updatedUser = { ...user, moderators: [...(user.moderators || []), moderator] };
    setUser(updatedUser, role, moderatorName);
    saveGlobalUser(updatedUser);
    setNewMod({ name: '', email: '', code: '', profilePic: '' });
    alert(language === 'EN' ? 'Moderator Added!' : 'মডারেটর যুক্ত করা হয়েছে!');
  };

  const handleRemoveModerator = (id: string) => {
    if (!user) return;
    if (!confirm(language === 'EN' ? 'Remove this moderator?' : 'আপনি কি মডারেটরটি ডিলিট করতে চান?')) return;
    const updatedUser = { ...user, moderators: user.moderators.filter(m => m.id !== id) };
    setUser(updatedUser, role, moderatorName);
    saveGlobalUser(updatedUser);
  };

  const handleExport = () => {
    const data = {
      user: user,
      transactions: JSON.parse(localStorage.getItem(`mm_tx_${user?.id}`) || '[]')
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ShopData_${user?.name}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (imported.user && imported.transactions) {
            setUser(imported.user, 'ADMIN');
            localStorage.setItem(`mm_tx_${imported.user.id}`, JSON.stringify(imported.transactions));
            saveGlobalUser(imported.user);
            alert('Data Imported Successfully!');
          }
        } catch {
          alert('Invalid Data File!');
        }
      };
      reader.readAsText(file);
    }
  };

  const btnBox = "w-full py-4 bg-primary text-white font-black rounded-lg shadow-lg hover:opacity-90 transition-all uppercase tracking-widest text-[10px] border-b-4 border-black/20";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20">
      
      {showResetModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md animate-in zoom-in duration-300">
           <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-[30px] shadow-2xl overflow-hidden border-4 border-rose-500/10">
              <div className="p-8 bg-rose-600 text-white flex justify-between items-center">
                 <h2 className="text-xl font-black uppercase tracking-tighter">{t('resetSecurityTitle')}</h2>
                 <button onClick={() => setShowResetModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              <div className="p-8 space-y-6">
                 <input type="password" value={resetCode} onChange={(e) => setResetCode(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-xl outline-none font-black text-2xl tracking-[0.4em] text-center" placeholder="••••" />
                 <div className="flex gap-4">
                    <button onClick={() => setShowResetModal(false)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-500 font-black rounded-xl uppercase tracking-widest text-[9px]">{t('cancel')}</button>
                    <button onClick={() => { if(resetApp(resetCode)) setShowResetModal(false); }} className="flex-1 py-4 bg-rose-600 text-white font-black rounded-xl uppercase tracking-widest text-[9px]">Confirm Reset</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Profile & Logo Upload */}
      <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border dark:border-gray-700">
        <h3 className="text-xl font-black mb-6 dark:text-white uppercase tracking-tighter flex items-center">
           <span className="w-2 h-6 bg-primary mr-3 rounded-full"></span>
           Shop Profile & Logo
        </h3>
        <div className="flex flex-col md:flex-row items-center gap-8">
           <div className="relative group">
              <div className="w-32 h-32 rounded-3xl bg-gray-100 dark:bg-gray-900 border-4 border-primary/20 flex items-center justify-center overflow-hidden shadow-inner">
                 {user?.profilePic ? (
                   <img src={user.profilePic} className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-4xl font-black text-gray-300">LOGO</span>
                 )}
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-xl shadow-lg hover:scale-110 transition-all">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleProfilePicChange} accept="image/*" className="hidden" />
           </div>
           <form onSubmit={handleUpdateProfile} className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} disabled={role === 'MODERATOR'} className="px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-xl outline-none font-bold text-xs border-b-4 border-black/10" placeholder="Shop Name" />
                 <select value={profileData.currency} onChange={(e) => setProfileData({...profileData, currency: e.target.value})} disabled={role === 'MODERATOR'} className="px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-xl outline-none font-black text-xs border-b-4 border-black/10">
                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
                 </select>
              </div>
              <button type="submit" disabled={role === 'MODERATOR'} className={btnBox}>{t('save')}</button>
           </form>
        </div>
      </section>

      {/* Moderator Settings */}
      {role === 'ADMIN' && (
        <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border dark:border-gray-700">
          <h3 className="text-xl font-black mb-6 dark:text-white uppercase tracking-tighter flex items-center">
             <span className="w-2 h-6 bg-blue-600 mr-3 rounded-full"></span>
             {t('moderatorSettings')}
          </h3>
          <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border-2 border-blue-100 dark:border-blue-800/50 space-y-6">
             <div className="flex flex-col md:flex-row gap-6">
                <div className="relative shrink-0">
                   <div className="w-24 h-24 rounded-2xl bg-white dark:bg-gray-800 border-2 border-blue-200 flex items-center justify-center overflow-hidden">
                      {newMod.profilePic ? <img src={newMod.profilePic} className="w-full h-full object-cover" /> : <svg className="w-10 h-10 text-gray-200" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>}
                   </div>
                   <button onClick={() => modFileInputRef.current?.click()} className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-lg shadow hover:scale-110 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                   </button>
                   <input type="file" ref={modFileInputRef} onChange={handleModPicChange} accept="image/*" className="hidden" />
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                   <input type="text" value={newMod.name} onChange={(e) => setNewMod({...newMod, name: e.target.value})} placeholder="Mod Name" className="px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-xs outline-none focus:border-blue-500 border-b-4 border-black/10" />
                   <input type="email" value={newMod.email} onChange={(e) => setNewMod({...newMod, email: e.target.value})} placeholder="Mod Email" className="px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-xs outline-none focus:border-blue-500 border-b-4 border-black/10" />
                   <input type="text" value={newMod.code} onChange={(e) => setNewMod({...newMod, code: e.target.value})} placeholder="User Code" className="px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg text-xs outline-none focus:border-blue-500 border-b-4 border-black/10" />
                   <button onClick={handleAddModerator} className="bg-blue-600 text-white font-black rounded-lg text-[10px] uppercase tracking-widest border-b-4 border-blue-800 py-3">Add Moderator</button>
                </div>
             </div>
             <div className="space-y-2">
                {user?.moderators?.map(mod => (
                   <div key={mod.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-100 dark:border-blue-900/50 shadow-sm border-b-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 overflow-hidden shrink-0">
                           {mod.profilePic ? <img src={mod.profilePic} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-blue-300">{mod.name.charAt(0)}</div>}
                        </div>
                        <div>
                          <p className="text-xs font-black dark:text-white uppercase">{mod.name}</p>
                          <p className="text-[9px] font-bold text-gray-400">{mod.email} | Code: {mod.code}</p>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveModerator(mod.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                   </div>
                ))}
             </div>
          </div>
        </section>
      )}

      {/* Backup & Restore */}
      <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border dark:border-gray-700">
         <h3 className="text-xl font-black mb-6 dark:text-white uppercase tracking-tighter flex items-center">
            <span className="w-2 h-6 bg-emerald-500 mr-3 rounded-full"></span>
            {t('backupRestore')}
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={handleExport} className="flex items-center justify-center gap-3 p-5 bg-emerald-500 text-white font-black rounded-xl uppercase tracking-widest text-[10px] border-b-4 border-emerald-700 active:scale-95 transition-all">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
               {t('exportData')}
            </button>
            <label className="flex items-center justify-center gap-3 p-5 bg-blue-500 text-white font-black rounded-xl uppercase tracking-widest text-[10px] border-b-4 border-blue-700 cursor-pointer active:scale-95 transition-all">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" /></svg>
               {t('importData')}
               <input type="file" onChange={handleImport} accept=".json" className="hidden" />
            </label>
         </div>
      </section>

      {/* Theme Options */}
      <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border dark:border-gray-700">
        <h3 className="text-xl font-black mb-6 dark:text-white uppercase tracking-tighter flex items-center">
           <span className="w-2 h-6 bg-primary mr-3 rounded-full"></span>
           {t('theme')} & {t('language')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('themeMode')}</label>
              <div className="flex p-1 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700">
                 {(['light', 'dark', 'system'] as ThemeMode[]).map(m => (
                    <button key={m} onClick={() => setThemeMode(m)} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${themeMode === m ? 'bg-primary text-white shadow-lg' : 'text-gray-400'}`}>
                       {t(m)}
                    </button>
                 ))}
              </div>
           </div>
           <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('themeColor')}</label>
              <div className="flex flex-wrap gap-2.5">
                {THEME_COLORS.map(tc => (
                   <button key={tc.color} type="button" onClick={() => handleSetPrimaryColor(tc.color)} className={`w-9 h-9 rounded-lg border-4 transition-all hover:scale-110 ${user?.primaryColor === tc.color ? 'border-white dark:border-gray-800 shadow-lg scale-110' : 'border-transparent'}`} style={{ backgroundColor: tc.color }} />
                ))}
              </div>
           </div>
        </div>
      </section>

      {/* Security Recovery */}
      {role === 'ADMIN' && (
        <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border dark:border-gray-700">
          <h3 className="text-lg font-black mb-6 dark:text-white uppercase tracking-tighter flex items-center">
            <span className="w-2 h-6 bg-rose-500 mr-3 rounded-full"></span>
            {t('accountRecovery')}
          </h3>
          <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 dark:border-gray-700">
            {!isPasswordVisible ? (
              <div className="flex gap-4">
                <input type="password" value={verifySecret} onChange={(e) => setVerifySecret(e.target.value)}
                  className="flex-1 px-5 py-3.5 bg-white dark:bg-gray-800 border-2 dark:border-gray-600 rounded-xl outline-none font-black tracking-widest border-b-4 border-black/10" placeholder="Enter Secret PIN" />
                <button onClick={() => { if(verifySecret === user?.secretCode) setIsPasswordVisible(true); else alert('Wrong PIN'); }} className="px-8 bg-rose-600 text-white font-black rounded-lg uppercase tracking-widest text-[9px] border-b-4 border-rose-800">{t('verify')}</button>
              </div>
            ) : (
              <div className="p-6 bg-primary rounded-xl flex justify-between items-center text-white">
                <div><p className="text-[8px] font-black opacity-60 uppercase">Password</p><p className="text-3xl font-black">{user?.password}</p></div>
                <button onClick={() => setIsPasswordVisible(false)} className="px-5 py-2 bg-white/20 rounded-lg text-[9px] font-black">HIDE</button>
              </div>
            )}
          </div>
        </section>
      )}

      {role === 'ADMIN' && (
        <section className="bg-rose-50 dark:bg-rose-950 p-8 rounded-2xl border-4 border-dashed border-rose-200 dark:border-rose-900/30 flex items-center justify-between">
          <div><h3 className="text-xl font-black text-rose-600 dark:text-rose-400 uppercase leading-none">{t('resetApp')}</h3><p className="text-[9px] font-black text-gray-500 mt-2 uppercase tracking-widest">Wipes all transaction records.</p></div>
          <button onClick={() => setShowResetModal(true)} className="px-10 py-4 bg-rose-600 text-white font-black rounded-lg shadow-lg uppercase tracking-widest text-[9px] border-b-4 border-rose-800">Reset System</button>
        </section>
      )}
    </div>
  );
};

export default Settings;
