
import React, { useState } from 'react';
import { useApp } from '../App';
import { BRAND_INFO } from '../constants';
import Calculator from './Calculator';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setView, view, t, theme, setTheme, setLanguage, language, user, setUser } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'transactions', label: t('transactions'), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 'reports', label: t('reports'), icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'settings', label: t('settings'), icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  const personalWhatsappUrl = `https://wa.me/${user?.mobile?.replace(/\D/g, '')}`;

  return (
    <div className="flex h-screen overflow-hidden print:h-auto print:overflow-visible">
      <Calculator isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 transform bg-white dark:bg-gray-800 border-r dark:border-gray-700 md:translate-x-0 md:static md:inset-0 print:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b dark:border-gray-700">
          <span className="text-2xl font-black text-primary tracking-tighter italic">ManageMoney</span>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="mt-8 px-4 space-y-3">
          {navItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => { setView(item.id); setIsSidebarOpen(false); }} 
              className={`flex items-center w-full px-5 py-4 text-sm font-black transition-all rounded-2xl ${view === item.id ? 'bg-primary text-white shadow-xl translate-x-1' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
              style={view === item.id ? { boxShadow: '0 10px 15px -3px var(--primary-color)4D' } : {}}
            >
              <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} /></svg>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t dark:border-gray-700">
          <div className="flex items-center px-4 py-4 mb-4 bg-gray-50 dark:bg-gray-700/50 rounded-3xl border dark:border-gray-600 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white text-lg font-black mr-3 shadow-lg overflow-hidden shrink-0">
              {user?.profilePic ? <img src={user.profilePic} alt="P" className="w-full h-full object-cover" /> : user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black truncate dark:text-gray-100">{user?.name}</p>
              <p className="text-[9px] font-bold text-gray-400 truncate uppercase tracking-tighter">{user?.mobile}</p>
            </div>
          </div>
          <button onClick={() => setUser(null)} className="flex items-center w-full px-5 py-3 text-sm font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all">
            <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            {t('logout')}
          </button>
        </div>
      </aside>

      <main className="flex-1 relative overflow-y-auto focus:outline-none transition-colors duration-300 print:overflow-visible bg-white dark:bg-gray-900">
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b dark:border-gray-800 md:px-10 print:hidden">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-600 dark:text-gray-400 mr-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-lg font-black dark:text-white uppercase tracking-tighter leading-none">{t(view)}</h1>
          </div>
          <div className="flex items-center space-x-2">
             <a href={personalWhatsappUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-xl transition-all shadow-sm" title="My WhatsApp">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
             </a>
             <button onClick={() => setLanguage(language === 'EN' ? 'BN' : 'EN')} className="p-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm" title={t('language')}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </button>
             <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2.5 bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white rounded-xl transition-all shadow-sm" title={t('theme')}>
                {theme === 'dark' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.071 16.071l.707.707M7.657 7.657l.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
             </button>
          </div>
        </header>

        <div className="p-4 md:p-6 max-w-7xl mx-auto print:p-0">
          {children}
        </div>

        <button 
           onClick={() => setIsCalcOpen(!isCalcOpen)}
           className="fixed bottom-6 right-6 z-[90] w-12 h-12 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all print:hidden"
           style={{ boxShadow: '0 10px 15px -3px var(--primary-color)80' }}
           title={t('calculator')}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
        </button>

        <footer className="mt-auto py-6 text-center text-gray-400 dark:text-gray-500 border-t dark:border-gray-800 print:hidden">
          <p className="text-[9px] font-black uppercase tracking-widest mb-2">App Developed By Graphico Global</p>
          <div className="flex justify-center space-x-6">
             <a href={BRAND_INFO.facebook} target="_blank" rel="noopener noreferrer" className="text-[9px] uppercase font-black tracking-widest hover:text-primary transition-colors">Facebook</a>
             <a href={BRAND_INFO.website} target="_blank" rel="noopener noreferrer" className="text-[9px] uppercase font-black tracking-widest hover:text-primary transition-colors">Web</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
