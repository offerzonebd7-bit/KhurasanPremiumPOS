
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { TransactionType, Transaction } from '../types';

const Transactions: React.FC = () => {
  const { transactions, t, deleteTransaction, user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');
  const [printTx, setPrintTx] = useState<Transaction | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = filterDate ? tx.date === filterDate : true;
      const matchesType = filterType === 'ALL' ? true : tx.type === filterType;
      return matchesSearch && matchesDate && matchesType;
    });
  }, [transactions, searchTerm, filterDate, filterType]);

  const handleExcelExport = () => {
    const headers = "Description,Category,Type,Amount,Date\n";
    const rows = filteredTransactions.map(tx => `${tx.description},${tx.category},${tx.type},${tx.amount},${tx.date}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Full_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const currencySymbol = user?.currency || '৳';

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder={t('search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-[10px] font-black dark:text-white"
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-[10px] font-black dark:text-white"
            >
              <option value="ALL">All Types</option>
              <option value="INCOME">{t('income')}</option>
              <option value="EXPENSE">{t('expense')}</option>
              <option value="DUE">{t('dues')}</option>
            </select>
            <button onClick={handleExcelExport} className="p-2.5 bg-emerald-600 text-white rounded-xl shadow hover:bg-emerald-700 transition-all">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={2.5}/></svg>
            </button>
            <button onClick={() => window.print()} className="p-2.5 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition-all">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            </button>
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
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-bold uppercase tracking-widest text-[9px]">{t('noTransactions')}</td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                    <td className="px-6 py-4 text-[10px] font-black text-gray-400">{tx.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${tx.type === 'INCOME' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : tx.type === 'EXPENSE' ? 'bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`}></div>
                        <span className="text-xs font-black dark:text-gray-200">{tx.description}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-xs font-black ${tx.type === 'INCOME' ? 'text-emerald-600' : tx.type === 'EXPENSE' ? 'text-rose-600' : 'text-amber-600'}`}>
                      {currencySymbol}{tx.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setPrintTx(tx)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Print This">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" strokeWidth={2.5}/></svg>
                        </button>
                        <button onClick={() => deleteTransaction(tx.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth={2.5}/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Print Modal */}
      {printTx && (
         <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-md animate-in zoom-in print:p-0">
            <div className="w-full max-w-lg bg-white p-10 rounded-[40px] shadow-2xl relative print:shadow-none print:rounded-none">
                <button onClick={() => setPrintTx(null)} className="absolute top-6 right-6 p-2 bg-gray-50 text-gray-400 rounded-xl hover:text-rose-500 no-print">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="border-t-[6px] border-blue-600 pt-8">
                   <div className="flex items-center gap-5 mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-blue-600 flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                        {user?.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : <span className="text-2xl font-black text-blue-600">{user?.name.charAt(0)}</span>}
                      </div>
                      <div>
                         <h2 className="text-xl font-black text-blue-900">{user?.name}</h2>
                         <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{user?.mobile}</p>
                      </div>
                   </div>
                   <div className="bg-gray-50 p-6 rounded-2xl mb-8 space-y-4">
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                         <span className="text-[9px] font-black text-gray-400 uppercase">Description:</span>
                         <span className="text-xs font-black">{printTx.description}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                         <span className="text-[9px] font-black text-gray-400 uppercase">Category:</span>
                         <span className="text-xs font-black">{printTx.category}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                         <span className="text-[9px] font-black text-gray-400 uppercase">Type:</span>
                         <span className="text-xs font-black uppercase text-blue-600">{printTx.type}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-2">
                         <span className="text-[9px] font-black text-gray-400 uppercase">Date:</span>
                         <span className="text-xs font-black">{printTx.date}</span>
                      </div>
                      <div className="flex justify-between pt-2">
                         <span className="text-[10px] font-black uppercase text-gray-900">Total Amount:</span>
                         <span className="text-xl font-black text-blue-700">{currencySymbol}{printTx.amount.toLocaleString()}</span>
                      </div>
                   </div>
                   <div className="text-center text-[7px] font-black uppercase tracking-[0.5em] text-gray-300">
                      ManageMoney Pro Invoice
                   </div>
                </div>
                <button onClick={() => window.print()} className="w-full mt-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg no-print">
                   Confirm Print
                </button>
            </div>
         </div>
      )}
    </div>
  );
};

export default Transactions;
