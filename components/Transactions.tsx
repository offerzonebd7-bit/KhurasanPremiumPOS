
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { TransactionType, Transaction } from '../types';

const Transactions: React.FC = () => {
  const { transactions, t, deleteTransaction, user, role, syncUserProfile } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');
  const [printTx, setPrintTx] = useState<Transaction | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = filterDate ? tx.date === filterDate : true;
      const matchesType = filterType === 'ALL' ? true : tx.type === filterType;
      return matchesSearch && matchesDate && matchesType;
    });
  }, [transactions, searchTerm, filterDate, filterType]);

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx || !user) return;
    const updatedTxs = transactions.map(tx => tx.id === editingTx.id ? editingTx : tx);
    localStorage.setItem(`mm_txs_${user.id}`, JSON.stringify(updatedTxs));
    window.location.reload(); // Quick refresh for context
    setEditingTx(null);
  };

  const currencySymbol = user?.currency || '৳';

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      {editingTx && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md">
           <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-[40px] shadow-2xl p-10 border-4 border-primary/20">
              <h3 className="text-xl font-black mb-6 dark:text-white uppercase tracking-tighter">Edit Transaction</h3>
              <form onSubmit={handleUpdateTransaction} className="space-y-4">
                 <input type="text" value={editingTx.description} onChange={e => setEditingTx({...editingTx, description: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl outline-none font-bold text-xs" placeholder="Description" required />
                 <input type="number" value={editingTx.amount} onChange={e => setEditingTx({...editingTx, amount: parseFloat(e.target.value) || 0})} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl outline-none font-bold text-xs" placeholder="Amount" required />
                 <button type="submit" className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl uppercase tracking-widest text-[10px]">Save Changes</button>
                 <button type="button" onClick={() => setEditingTx(null)} className="w-full py-2 text-gray-400 font-black uppercase text-[8px] tracking-widest">Cancel</button>
              </form>
           </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder={t('search')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl outline-none text-xs font-bold" />
          </div>
          <div className="flex flex-wrap gap-2">
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl outline-none text-[10px] font-black dark:text-white" />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl outline-none text-[10px] font-black dark:text-white">
              <option value="ALL">All Types</option>
              <option value="INCOME">{t('income')}</option>
              <option value="EXPENSE">{t('expense')}</option>
              <option value="DUE">{t('dues')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('date')}</th>
                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('description')}</th>
                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('amount')}</th>
                <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                  <td className="px-6 py-4 text-[10px] font-black text-gray-400">{tx.date}</td>
                  <td className="px-6 py-4 text-xs font-black dark:text-gray-200">{tx.description}</td>
                  <td className={`px-6 py-4 text-xs font-black ${tx.type === 'INCOME' ? 'text-emerald-600' : tx.type === 'EXPENSE' ? 'text-rose-600' : 'text-amber-600'}`}>
                    {currencySymbol}{tx.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingTx(tx)} className="p-2 text-blue-500 bg-blue-50 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                      <button onClick={() => setPrintTx(tx)} className="p-2 text-emerald-500 bg-emerald-50 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" strokeWidth={2.5}/></svg></button>
                      {role === 'ADMIN' && <button onClick={() => deleteTransaction(tx.id)} className="p-2 text-rose-500 bg-rose-50 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth={2.5}/></svg></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {printTx && (
         <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-md animate-in zoom-in print:p-0">
            <div className="w-full max-w-lg bg-white p-10 rounded-[40px] shadow-2xl relative print:shadow-none print:rounded-none">
                <button onClick={() => setPrintTx(null)} className="absolute top-6 right-6 p-2 bg-gray-50 text-gray-400 rounded-xl hover:text-rose-500 no-print">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="border-t-[8px] border-primary pt-8">
                   <div className="flex items-center gap-6 mb-8">
                      <div className="w-20 h-20 rounded-2xl bg-gray-50 border-2 border-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                        {user?.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : <span className="text-2xl font-black text-primary/20">LOGO</span>}
                      </div>
                      <div>
                         <h2 className="text-2xl font-black text-primary leading-tight uppercase italic">{user?.name}</h2>
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{user?.slogan}</p>
                         <p className="text-[8px] font-bold text-gray-500 mt-1">{user?.mobile} • {user?.email}</p>
                      </div>
                   </div>
                   <div className="bg-gray-50 p-8 rounded-3xl mb-8 space-y-4 border-2 border-gray-100">
                      <div className="flex justify-between border-b border-gray-200 pb-2"><span className="text-[10px] font-black text-gray-400 uppercase">Description</span><span className="text-sm font-black">{printTx.description}</span></div>
                      <div className="flex justify-between border-b border-gray-200 pb-2"><span className="text-[10px] font-black text-gray-400 uppercase">Category</span><span className="text-sm font-black">{printTx.category}</span></div>
                      <div className="flex justify-between border-b border-gray-200 pb-2"><span className="text-[10px] font-black text-gray-400 uppercase">Tx Type</span><span className="text-sm font-black uppercase text-primary">{printTx.type}</span></div>
                      <div className="flex justify-between pt-4"><span className="text-[12px] font-black uppercase text-gray-900">Final Amount</span><span className="text-2xl font-black text-primary">{currencySymbol}{printTx.amount.toLocaleString()}</span></div>
                   </div>
                   <div className="flex justify-between items-end mt-16 border-t-2 border-dashed border-gray-200 pt-8">
                      <div className="text-[7px] font-black uppercase tracking-[0.3em] text-gray-300">Khurasan Premium POS System</div>
                      <div className="text-center w-40">
                         <div className="border-b-2 border-black mb-2"></div>
                         <p className="text-[8px] font-black uppercase tracking-widest">Authorized Sign</p>
                      </div>
                   </div>
                </div>
                <button onClick={() => window.print()} className="w-full mt-10 py-5 bg-primary text-white rounded-2xl font-black uppercase text-[11px] shadow-xl no-print">Confirm Print</button>
            </div>
         </div>
      )}
    </div>
  );
};

export default Transactions;
