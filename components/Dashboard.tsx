
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../App';
import { TransactionType, Transaction } from '../types';

const Dashboard: React.FC = () => {
  const { transactions, t, addTransaction, updateTransaction, deleteTransaction, user, language, locationName } = useApp();
  const [formData, setFormData] = useState({ amount: '', description: '', type: 'INCOME' as TransactionType, category: '' });
  const [time, setTime] = useState(new Date());
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatClock = () => {
    const hours = time.getHours();
    const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return { hhmm: `${displayHours}:${minutes}`, ss: seconds, ampm };
  };

  const { hhmm, ss, ampm } = formatClock();
  const todayStr = new Date().toISOString().split('T')[0];

  const summary = useMemo(() => {
    const totals = (txs: any[]) => ({
      income: txs.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0),
      expense: txs.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0),
      dues: txs.filter(t => t.type === 'DUE').reduce((acc, curr) => acc + curr.amount, 0),
    });
    const all = totals(transactions);
    const today = totals(transactions.filter(tx => tx.date === todayStr));
    return { all, today };
  }, [transactions, todayStr]);

  const todayRecords = useMemo(() => {
    return transactions.filter(tx => tx.date === todayStr);
  }, [transactions, todayStr]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;
    addTransaction({
      amount: parseFloat(formData.amount),
      description: formData.description,
      type: formData.type,
      category: formData.category || (language === 'EN' ? 'General' : 'সাধারণ'),
      date: todayStr,
    });
    setFormData({ ...formData, amount: '', description: '', category: '' });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    updateTransaction(editingTx.id, {
      amount: editingTx.amount,
      description: editingTx.description,
      type: editingTx.type,
      category: editingTx.category,
    });
    setEditingTx(null);
  };

  const handleExcelExport = () => {
    const headers = "Description,Category,Type,Amount,Date\n";
    const rows = todayRecords.map(tx => `${tx.description},${tx.category},${tx.type},${tx.amount},${tx.date}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Statement_${todayStr}.csv`;
    a.click();
  };

  const currencySymbol = user?.currency || '৳';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Sleek Refined Header */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl border-2 border-primary/20 overflow-hidden bg-primary/5 dark:bg-gray-900 flex items-center justify-center shadow-inner">
                {user?.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : <div className="text-primary font-black text-2xl">{user?.name.charAt(0)}</div>}
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight dark:text-white leading-none">{user?.name}</h2>
              <p className="text-[9px] font-black uppercase tracking-widest text-primary mt-2 flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> {locationName}
              </p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <div className="flex items-baseline justify-center md:justify-end gap-1">
               <span className="text-4xl font-black font-mono tracking-tighter dark:text-white leading-none">{hhmm}</span>
               <div className="flex flex-col items-start leading-none mb-1">
                  <span className="text-sm font-black font-mono text-gray-400 dark:text-gray-500">{ss}</span>
                  <span className="text-[10px] font-black text-primary">{ampm}</span>
               </div>
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] mt-1 text-gray-400">
              {time.toLocaleDateString(language === 'EN' ? 'en-US' : 'bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      {/* Entry System */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex gap-2">
             <button type="button" onClick={() => setFormData({...formData, type: 'INCOME'})} className={`flex-1 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] border-2 transition-all ${formData.type === 'INCOME' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'bg-transparent border-emerald-500/10 text-emerald-500 hover:bg-emerald-50'}`}>
                {t('income')}
             </button>
             <button type="button" onClick={() => setFormData({...formData, type: 'EXPENSE'})} className={`flex-1 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] border-2 transition-all ${formData.type === 'EXPENSE' ? 'bg-rose-500 border-rose-500 text-white shadow-lg' : 'bg-transparent border-rose-500/10 text-rose-500 hover:bg-rose-50'}`}>
                {t('expense')}
             </button>
             <button type="button" onClick={() => setFormData({...formData, type: 'DUE'})} className={`flex-1 py-3.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] border-2 transition-all ${formData.type === 'DUE' ? 'bg-amber-500 border-amber-500 text-white shadow-lg' : 'bg-transparent border-amber-500/10 text-amber-500 hover:bg-amber-50'}`}>
                {t('dues')}
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-xl outline-none font-bold text-xs focus:border-primary transition-all peer placeholder-transparent" id="dash-desc" required />
              <label htmlFor="dash-desc" className="absolute left-5 top-3.5 text-[9px] font-black text-gray-400 uppercase tracking-widest transition-all peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-2 peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-800 peer-[:not(:placeholder-shown)]:px-2 pointer-events-none">{t('description')}</label>
            </div>
            <div className="relative">
              <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-xl outline-none font-bold text-xs focus:border-primary transition-all peer placeholder-transparent" id="dash-amt" required />
              <label htmlFor="dash-amt" className="absolute left-5 top-3.5 text-[9px] font-black text-gray-400 uppercase tracking-widest transition-all peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-2 peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-800 peer-[:not(:placeholder-shown)]:px-2 pointer-events-none">{t('amount')} ({currencySymbol})</label>
            </div>
            <div className="relative">
              <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-xl outline-none font-bold text-xs focus:border-primary transition-all peer placeholder-transparent" id="dash-cat" />
              <label htmlFor="dash-cat" className="absolute left-5 top-3.5 text-[9px] font-black text-gray-400 uppercase tracking-widest transition-all peer-focus:-top-2 peer-focus:left-3 peer-focus:bg-white dark:peer-focus:bg-gray-800 peer-focus:px-2 peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-gray-800 peer-[:not(:placeholder-shown)]:px-2 pointer-events-none">{t('category')}</label>
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-[0.4em] shadow-lg hover:opacity-90 transition-all active:scale-95">
            {t('addTransaction')}
          </button>
        </form>
      </section>

      {/* Main Totals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceCard title={t('totalBalance')} value={summary.all.income - summary.all.expense} color="bg-primary" symbol={currencySymbol} />
        <div className="grid grid-cols-3 gap-3">
           <BalanceCard title={t('income')} value={summary.all.income} color="bg-emerald-500" symbol={currencySymbol} />
           <BalanceCard title={t('expense')} value={summary.all.expense} color="bg-rose-500" symbol={currencySymbol} />
           <BalanceCard title={t('dues')} value={summary.all.dues} color="bg-amber-500" symbol={currencySymbol} />
        </div>
      </div>

      {/* Today's Summary Section */}
      <section className="bg-gray-50 dark:bg-gray-900/40 p-5 rounded-2xl border dark:border-gray-800">
        <h3 className="text-[10px] font-black dark:text-white uppercase tracking-[0.3em] opacity-50 mb-4">{t('todaysSummary')}</h3>
        <div className="grid grid-cols-3 gap-4">
           <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Today's Income</p>
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-1">{currencySymbol}{summary.today.income.toLocaleString()}</p>
           </div>
           <div className="bg-rose-50 dark:bg-rose-950/20 p-4 rounded-xl border border-rose-100 dark:border-rose-900/30">
              <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest">Today's Expense</p>
              <p className="text-lg font-black text-rose-700 dark:text-rose-400 mt-1">{currencySymbol}{summary.today.expense.toLocaleString()}</p>
           </div>
           <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
              <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Today's Dues</p>
              <p className="text-lg font-black text-amber-700 dark:text-amber-400 mt-1">{currencySymbol}{summary.today.dues.toLocaleString()}</p>
           </div>
        </div>
      </section>

      {/* Today's Records Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
        <div className="flex items-center justify-between gap-4 mb-6">
           <h3 className="text-[10px] font-black dark:text-white uppercase tracking-[0.3em] opacity-50">Today's History</h3>
           <div className="flex items-center gap-2">
              <button onClick={() => setIsInvoiceOpen(true)} className="p-2 bg-primary text-white rounded-lg shadow hover:opacity-90 transition-all" title={t('printInvoice')}>
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              </button>
              <button onClick={handleExcelExport} className="p-2 bg-emerald-600 text-white rounded-lg shadow hover:opacity-90 transition-all" title={t('exportExcel')}>
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={2.5}/></svg>
              </button>
           </div>
        </div>
        <div className="space-y-3">
           {todayRecords.length === 0 ? (
              <div className="text-center py-10 text-gray-400 font-bold uppercase tracking-widest text-[9px]">{t('noTransactions')}</div>
           ) : (
              todayRecords.map(tx => (
                 <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/20 rounded-xl border dark:border-gray-700 group transition-all">
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tx.type === 'INCOME' ? 'bg-emerald-50 text-emerald-500' : tx.type === 'EXPENSE' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'}`}>
                          {tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '-' : '•'}
                       </div>
                       <div>
                          <p className="font-black text-xs dark:text-white leading-tight">{tx.description}</p>
                          <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mt-1">{tx.category}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <p className={`text-sm font-black ${tx.type === 'INCOME' ? 'text-emerald-500' : tx.type === 'EXPENSE' ? 'text-rose-500' : 'text-amber-500'}`}>
                          {currencySymbol}{tx.amount.toLocaleString()}
                       </p>
                       <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                          <button onClick={() => setEditingTx(tx)} className="text-primary hover:scale-110 transition-all"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth={2.5}/></svg></button>
                          <button onClick={() => deleteTransaction(tx.id)} className="text-rose-500 hover:scale-110 transition-all"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth={2.5}/></svg></button>
                       </div>
                    </div>
                 </div>
              ))
           )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingTx && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-sm bg-white dark:bg-gray-800 p-8 rounded-[25px] shadow-2xl">
               <h3 className="text-lg font-black mb-6 dark:text-white uppercase tracking-tighter">{t('update')}</h3>
               <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="space-y-1">
                     <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('description')}</label>
                     <input type="text" value={editingTx.description} onChange={e => setEditingTx({...editingTx, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border dark:border-gray-700 dark:bg-gray-700 font-bold text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('amount')}</label>
                        <input type="number" value={editingTx.amount} onChange={e => setEditingTx({...editingTx, amount: parseFloat(e.target.value)})} className="w-full px-4 py-3 rounded-xl border dark:border-gray-700 dark:bg-gray-700 font-bold text-xs" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Type</label>
                        <select value={editingTx.type} onChange={e => setEditingTx({...editingTx, type: e.target.value as any})} className="w-full px-4 py-3 rounded-xl border dark:border-gray-700 dark:bg-gray-700 font-black text-[9px]">
                           <option value="INCOME">{t('income')}</option>
                           <option value="EXPENSE">{t('expense')}</option>
                           <option value="DUE">{t('dues')}</option>
                        </select>
                     </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                     <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl font-black uppercase text-[9px]">{t('save')}</button>
                     <button type="button" onClick={() => setEditingTx(null)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-xl font-black uppercase text-[9px]">{t('cancel')}</button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {/* Invoice Modal */}
      {isInvoiceOpen && (
         <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-md animate-in zoom-in print:p-0">
            <div className="w-full max-w-3xl bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[30px] shadow-2xl relative print:rounded-none print:shadow-none print:p-12 print:border-none overflow-y-auto max-h-screen">
               <button onClick={() => setIsInvoiceOpen(false)} className="absolute top-6 right-6 p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all print:hidden">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>

               <div className="flex flex-col h-full border-t-[6px] border-primary pt-8">
                  <div className="flex items-center justify-between mb-10">
                     <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl border-2 border-primary p-1 bg-white shadow-lg overflow-hidden shrink-0">
                           {user?.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : <div className="text-3xl font-black text-primary h-full flex items-center justify-center">{user?.name.charAt(0)}</div>}
                        </div>
                        <div>
                           <h1 className="text-2xl font-black text-primary dark:text-blue-400 tracking-tight leading-none">{user?.name}</h1>
                           <p className="text-[9px] font-black text-gray-400 mt-2 uppercase tracking-[0.3em]">{user?.mobile} • {user?.email}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest">Statement Date</p>
                        <p className="text-lg font-black dark:text-white">{todayStr}</p>
                     </div>
                  </div>

                  <table className="w-full text-left mb-8 border-collapse">
                     <thead>
                        <tr className="bg-primary text-white">
                           <th className="p-4 font-black uppercase text-[9px] tracking-widest">{t('description')}</th>
                           <th className="p-4 font-black uppercase text-[9px] tracking-widest">{t('category')}</th>
                           <th className="p-4 font-black uppercase text-[9px] tracking-widest text-right">{t('amount')}</th>
                        </tr>
                     </thead>
                     <tbody className="bg-white dark:bg-gray-800">
                        {todayRecords.map(tx => (
                           <tr key={tx.id} className="border-b border-gray-100 dark:border-gray-700">
                              <td className="p-4 text-xs font-black dark:text-white">{tx.description} ({tx.type})</td>
                              <td className="p-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest">{tx.category}</td>
                              <td className="p-4 text-xs font-black text-right dark:text-white">{currencySymbol}{tx.amount.toLocaleString()}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>

                  <div className="flex justify-end mt-4">
                     <div className="w-64 space-y-2">
                        <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                           <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Day Income:</span>
                           <span className="text-xs font-black text-emerald-600">{currencySymbol}{summary.today.income.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                           <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Day Expense:</span>
                           <span className="text-xs font-black text-rose-600">{currencySymbol}{summary.today.expense.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between p-4 bg-primary rounded-2xl text-white">
                           <span className="font-black text-xs uppercase">Grand Total:</span>
                           <span className="font-black text-lg">{currencySymbol}{(summary.today.income - summary.today.expense).toLocaleString()}</span>
                        </div>
                     </div>
                  </div>

                  <div className="mt-auto pt-10 border-t border-gray-100 dark:border-gray-700 text-center text-[7px] font-black uppercase tracking-[0.8em] text-gray-300">
                     ManageMoney Pro - Graphico Global
                  </div>
               </div>

               <div className="mt-8 flex justify-center no-print">
                  <button onClick={() => window.print()} className="px-10 py-3.5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-xl hover:opacity-90 transition-all">
                     Print Statement
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

const BalanceCard: React.FC<{ title: string, value: number, color: string, symbol: string }> = ({ title, value, color, symbol }) => {
   return (
      <div className={`${color} p-5 rounded-xl text-white shadow-sm hover:scale-105 transition-all group overflow-hidden relative`}>
         <div className="absolute -right-2 -bottom-2 w-10 h-10 bg-white/10 rounded-full blur-lg"></div>
         <p className="text-[8px] font-black uppercase tracking-widest opacity-60">{title}</p>
         <p className="text-lg font-black mt-2 leading-none">{symbol}{value.toLocaleString()}</p>
      </div>
   );
};

export default Dashboard;
