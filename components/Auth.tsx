
import React, { useState } from 'react';
import { useApp } from '../App';
import { BRAND_INFO } from '../constants';
import { UserProfile, UserRole } from '../types';

const Auth: React.FC = () => {
  const { setUser, t, theme } = useApp();
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'recovery'>('login');
  const [loginRole, setLoginRole] = useState<UserRole>('ADMIN');
  const [formData, setFormData] = useState({ 
    name: '', email: '', mobile: '', password: '', confirmPassword: '', secretCode: '', modCode: '', recoveryPin: '', newPassword: '' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const allUsers: UserProfile[] = JSON.parse(localStorage.getItem('mm_all_users') || '[]');

    if (authMode === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      const newUser: UserProfile = {
        id: 'U-' + Date.now(),
        name: formData.name,
        email: formData.email.toLowerCase(),
        mobile: formData.mobile,
        password: formData.password,
        secretCode: formData.secretCode,
        currency: '৳',
        primaryColor: '#4169E1',
        accounts: [],
        moderators: [],
        products: [],
        partners: []
      };

      localStorage.setItem('mm_all_users', JSON.stringify([...allUsers, newUser]));
      setUser(newUser, 'ADMIN');
    } else if (authMode === 'recovery') {
      const userIdx = allUsers.findIndex(u => u.email === formData.email.toLowerCase() && u.secretCode === formData.recoveryPin);
      if (userIdx !== -1) {
        allUsers[userIdx].password = formData.newPassword;
        localStorage.setItem('mm_all_users', JSON.stringify(allUsers));
        setSuccess('Password Updated Successfully!');
        setTimeout(() => setAuthMode('login'), 2000);
      } else {
        setError('Invalid Email or Secret PIN');
      }
    } else {
      if (loginRole === 'ADMIN') {
        const found = allUsers.find(u => u.email === formData.email.toLowerCase() && u.password === formData.password);
        if (found) {
          setUser(found, 'ADMIN');
        } else {
          setError('Invalid Email or Password');
        }
      } else {
        const shop = allUsers.find(u => u.moderators?.some(m => m.email === formData.email.toLowerCase() && m.code === formData.modCode));
        if (shop) {
          const mod = shop.moderators.find(m => m.email === formData.email.toLowerCase());
          setUser(shop, 'MODERATOR', mod?.name || 'Moderator');
        } else {
          setError('Invalid Moderator Credentials');
        }
      }
    }
  };

  const btnBase = "w-full py-5 font-black rounded-lg shadow-xl active:scale-95 transition-all uppercase tracking-[0.2em] text-[11px] border-b-4";

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-6 ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-blue-50 text-gray-900'}`}>
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-[30px] sm:rounded-[40px] shadow-2xl overflow-hidden border-4 border-blue-600/10 animate-in fade-in zoom-in duration-300">
        <div className="p-10 text-center bg-gradient-to-br from-blue-700 to-indigo-900 text-white">
          <h1 className="text-3xl font-black tracking-tighter italic leading-none">{BRAND_INFO.name}</h1>
          <p className="mt-3 text-blue-200 text-[9px] font-black uppercase tracking-[0.4em]">{BRAND_INFO.developer}</p>
        </div>
        
        {authMode !== 'recovery' && (
          <div className="flex p-2 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
             <button onClick={() => setLoginRole('ADMIN')} className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${loginRole === 'ADMIN' ? 'bg-white dark:bg-gray-700 shadow-md text-blue-600' : 'text-gray-400'}`}>{t('admin')}</button>
             <button onClick={() => setLoginRole('MODERATOR')} className={`flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${loginRole === 'MODERATOR' ? 'bg-white dark:bg-gray-700 shadow-md text-blue-600' : 'text-gray-400'}`}>{t('moderator')}</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && <div className="p-4 text-[9px] font-black text-rose-600 bg-rose-50 rounded-xl border border-rose-200 uppercase tracking-widest">{error}</div>}
          {success && <div className="p-4 text-[9px] font-black text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-200 uppercase tracking-widest">{success}</div>}
          
          {authMode === 'signup' && (
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-4 rounded-xl border-2 dark:bg-gray-800 outline-none font-bold text-sm border-b-4 border-black/5" placeholder="Shop/Brand Name" required />
          )}
          
          <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-5 py-4 rounded-xl border-2 dark:bg-gray-800 outline-none font-bold text-sm border-b-4 border-black/5" placeholder="Email Address" required />
          
          {authMode === 'recovery' ? (
            <>
              <input type="text" value={formData.recoveryPin} onChange={(e) => setFormData({ ...formData, recoveryPin: e.target.value })} className="w-full px-5 py-4 rounded-xl border-2 dark:bg-gray-800 outline-none font-black text-sm border-b-4 border-black/5" placeholder="Secret Recovery PIN" required />
              <input type="password" value={formData.newPassword} onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })} className="w-full px-5 py-4 rounded-xl border-2 dark:bg-gray-800 outline-none font-bold text-sm border-b-4 border-black/5" placeholder="New Password" required />
            </>
          ) : (
            <input 
              type="password" 
              value={loginRole === 'MODERATOR' ? formData.modCode : formData.password} 
              onChange={(e) => loginRole === 'MODERATOR' ? setFormData({...formData, modCode: e.target.value}) : setFormData({...formData, password: e.target.value})} 
              className="w-full px-5 py-4 rounded-xl border-2 dark:bg-gray-800 outline-none font-bold text-sm border-b-4 border-black/5" 
              placeholder={loginRole === 'MODERATOR' ? "Moderator User Code" : "Password"} 
              required 
            />
          )}

          {authMode === 'signup' && (
              <>
                <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="w-full px-5 py-4 rounded-xl border-2 dark:bg-gray-800 outline-none font-bold text-sm border-b-4 border-black/5" placeholder="Confirm Password" required />
                <div className="relative group">
                  <input type="text" value={formData.secretCode} onChange={(e) => setFormData({ ...formData, secretCode: e.target.value })} className="w-full px-5 py-4 rounded-xl border-2 dark:bg-gray-800 outline-none font-black text-sm border-b-4 border-blue-600/50" placeholder="Secret PIN (e.g. 1234)" required />
                  <div className="hidden group-hover:block absolute -top-10 left-0 bg-blue-900 text-white p-2 rounded text-[8px] font-bold z-10 w-full">{t('secretTooltip')}</div>
                </div>
              </>
          )}

          <button type="submit" className={`${btnBase} bg-blue-600 border-blue-800 text-white mt-4`}>
            {authMode === 'login' ? t('login') : authMode === 'signup' ? t('signup') : 'Recover Password'}
          </button>
          
          <div className="flex flex-col gap-4 mt-4 text-center">
            {authMode === 'login' ? (
              <>
                <button type="button" onClick={() => setAuthMode('signup')} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Create New Shop</button>
                <button type="button" onClick={() => setAuthMode('recovery')} className="text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-colors">{t('forgotPassword')}</button>
              </>
            ) : (
              <button type="button" onClick={() => setAuthMode('login')} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Back to Login</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
export default Auth;
