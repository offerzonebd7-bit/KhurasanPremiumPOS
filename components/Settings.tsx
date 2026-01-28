
import React, { useState, useRef } from 'react';
import { useApp } from '../App';
import { BRAND_INFO, CURRENCIES, THEME_COLORS } from '../constants';

const Settings: React.FC = () => {
  const { user, setUser, t, language, setLanguage, theme, setTheme, resetApp } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    currency: user?.currency || '৳',
  });
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [verifySecret, setVerifySecret] = useState('');
  const [showVerifySecret, setShowVerifySecret] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdating(true);
    setTimeout(() => {
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      
      const allUsers = JSON.parse(localStorage.getItem('mm_all_users') || '[]');
      const userIndex = allUsers.findIndex((u: any) => u.id === user.id);
      if (userIndex !== -1) {
        allUsers[userIndex] = updatedUser;
        localStorage.setItem('mm_all_users', JSON.stringify(allUsers));
      }

      setIsUpdating(false);
      alert(t('save') + ' Successful!');
    }, 500);
  };

  const handleSetPrimaryColor = (color: string) => {
    if (!user) return;
    const updatedUser = { ...user, primaryColor: color };
    setUser(updatedUser);
    
    const allUsers = JSON.parse(localStorage.getItem('mm_all_users') || '[]');
    const userIndex = allUsers.findIndex((u: any) => u.id === user.id);
    if (userIndex !== -1) {
      allUsers[userIndex] = updatedUser;
      localStorage.setItem('mm_all_users', JSON.stringify(allUsers));
    }
  };

  const handleShowPassword = () => {
    if (verifySecret === user?.secretCode) {
      setIsPasswordVisible(true);
      setVerifySecret('');
    } else {
      alert(language === 'EN' ? 'Invalid Secret Code!' : 'ভুল সিক্রেট কোড!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20">
      {/* Profile & Color Switcher */}
      <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border dark:border-gray-700">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
          <div className="relative group shrink-0">
            <div className="w-32 h-32 rounded-3xl bg-primary/10 flex items-center justify-center text-primary text-4xl font-black border-2 border-white dark:border-gray-800 shadow-xl overflow-hidden transition-all group-hover:scale-105">
              {user?.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : user?.name.charAt(0).toUpperCase()}
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-3.5 bg-primary text-white rounded-2xl shadow-xl border-2 border-white dark:border-gray-800 hover:scale-110 active:scale-90 transition-all z-10">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            </button>
            <input type="file" ref={fileInputRef} onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && user) {
                const reader = new FileReader();
                reader.onloadend = () => setUser({ ...user, profilePic: reader.result as string });
                reader.readAsDataURL(file);
              }
            }} className="hidden" accept="image/*" />
          </div>
          
          <div className="flex-1 w-full space-y-6">
            <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter flex items-center">
               <span className="w-2 h-6 bg-primary mr-3 rounded-full"></span>
               {t('profile')}
            </h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{language === 'EN' ? 'Name' : 'নাম'}</label>
                  <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl outline-none font-bold text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('currency')}</label>
                  <select value={profileData.currency} onChange={(e) => setProfileData({...profileData, currency: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl outline-none font-black text-xs">
                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('mobileNumber')}</label>
                  <input type="tel" value={profileData.mobile} onChange={(e) => setProfileData({...profileData, mobile: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl outline-none font-bold text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                  <input type="email" value={profileData.email} disabled className="w-full px-5 py-3.5 bg-gray-100 dark:bg-gray-900 border dark:border-gray-700 rounded-xl outline-none font-bold opacity-60 text-xs" />
                </div>
              </div>
              
              {/* Theme Color Picker */}
              <div className="space-y-3 pt-2">
                 <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('themeColor')}</label>
                 <div className="flex flex-wrap gap-2.5">
                    {THEME_COLORS.map(tc => (
                       <button 
                         key={tc.color} 
                         type="button" 
                         onClick={() => handleSetPrimaryColor(tc.color)}
                         className={`w-9 h-9 rounded-xl border-4 transition-all hover:scale-110 flex items-center justify-center ${user?.primaryColor === tc.color ? 'border-white dark:border-gray-800 scale-110 shadow-lg' : 'border-transparent'}`}
                         style={{ backgroundColor: tc.color }}
                         title={tc.name}
                       >
                          {user?.primaryColor === tc.color && (
                             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                          )}
                       </button>
                    ))}
                 </div>
              </div>

              <button type="submit" className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg hover:opacity-90 transition-all active:scale-95 uppercase tracking-widest text-[10px]">
                {isUpdating ? '...' : t('save')}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Official Support Buttons */}
      <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border dark:border-gray-700">
        <h3 className="text-lg font-black mb-6 dark:text-white uppercase tracking-tighter flex items-center">
          <span className="w-2 h-6 bg-primary mr-3 rounded-full"></span>
          Graphico Global Support
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <a href={BRAND_INFO.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-blue-700 transition-all active:scale-95">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
              Facebook Page
           </a>
           <a href={BRAND_INFO.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-emerald-700 transition-all active:scale-95">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              WhatsApp Support
           </a>
        </div>
      </section>

      {/* Security - Account Recovery */}
      <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border dark:border-gray-700">
        <h3 className="text-lg font-black mb-6 dark:text-white uppercase tracking-tighter flex items-center">
          <svg className="w-5 h-5 mr-3 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          {t('accountRecovery')}
        </h3>
        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl space-y-6 border dark:border-gray-700">
          {!isPasswordVisible ? (
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full space-y-1 relative">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('enterSecret')}</label>
                <input type={showVerifySecret ? "text" : "password"} value={verifySecret} onChange={(e) => setVerifySecret(e.target.value)}
                  className="w-full px-5 py-3.5 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-xl outline-none font-bold text-lg tracking-[0.2em] pr-12" placeholder="••••" />
                <button type="button" onClick={() => setShowVerifySecret(!showVerifySecret)} className="absolute right-4 top-[38px] text-gray-400">
                  {showVerifySecret ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                  )}
                </button>
              </div>
              <button onClick={handleShowPassword} className="h-12 px-8 bg-rose-600 text-white font-black rounded-xl hover:bg-rose-700 active:scale-95 transition-all shadow-md uppercase tracking-widest text-[9px]">
                {t('verify')}
              </button>
            </div>
          ) : (
            <div className="p-6 bg-primary rounded-2xl flex justify-between items-center border-2 border-white/20 shadow-xl animate-in zoom-in">
              <div>
                <p className="text-[8px] font-black text-white/60 uppercase tracking-widest">{t('password')}</p>
                <p className="text-3xl font-black text-white font-mono tracking-tighter mt-1">{user?.password}</p>
              </div>
              <button onClick={() => setIsPasswordVisible(false)} className="px-5 py-2 bg-white/20 text-white rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-white/30 transition-all">Hide</button>
            </div>
          )}
        </div>
      </section>

      {/* Admin Danger */}
      <section className="bg-rose-50 dark:bg-rose-900/10 p-8 rounded-2xl border-2 border-dashed border-rose-200 dark:border-rose-900/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-black text-rose-600 dark:text-rose-400 uppercase tracking-tighter leading-none">{t('resetApp')}</h3>
          <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-widest">{language === 'EN' ? 'This wipes all your transaction data.' : 'আপনার সব তথ্য চিরতরে মুছে যাবে।'}</p>
        </div>
        <button onClick={resetApp} className="px-10 py-4 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-700 active:scale-95 transition-all shadow-lg uppercase tracking-widest text-[9px]">
          Reset System
        </button>
      </section>
    </div>
  );
};

export default Settings;
