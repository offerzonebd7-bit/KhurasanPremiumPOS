
import React, { useMemo, useState } from 'react';
import { useApp } from '../App';
import { SaleRecord } from '../types';

const TodaySales: React.FC = () => {
  const { user, t, syncUserProfile, language, role } = useApp();
  const [editingSale, setEditingSale] = useState<SaleRecord | null>(null);
  const [isDailyPrint, setIsDailyPrint] = useState(false);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = useMemo(() => {
    return (user?.sales || []).filter(s => s.date === todayStr);
  }, [user?.sales, todayStr]);

  const categorySummary = useMemo(() => {
    const summary: Record<string, { qty: number, profit: number, total: number }> = {};
    todaySales.forEach(s => {
      const cat = s.category || (language === 'EN' ? 'Uncategorized' : 'অনির্ধারিত');
      if (!summary[cat]) summary[cat] = { qty: 0, profit: 0, total: 0 };
      summary[cat].qty += s.qty;
      summary[cat].profit += s.profit;
      summary[cat].total += (s.qty * s.sellPrice);
    });
    return summary;
  }, [todaySales, language]);

  const productSummary = useMemo(() => {
    const summary: Record<string, { qty: number, total: number }> = {};
    todaySales.forEach(s => {
      if (!summary[s.productName]) summary[s.productName] = { qty: 0, total: 0 };
      summary[s.productName].qty += s.qty;
      summary[s.productName].total += (s.qty * s.sellPrice);
    });
    return summary;
  }, [todaySales]);

  const handleUpdateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSale || !user) return;
    const updatedSales = (user.sales || []).map(s => s.id === editingSale.id ? editingSale : s);
    await syncUserProfile({ ...user, sales: updatedSales });
    setEditingSale(null);
  };

  const handleDelete = async (id: string) => {
    if (role === 'MODERATOR') return alert('Access Denied: Moderators cannot delete records.');
    if (!user || !confirm(language === 'EN' ? 'Delete this record?' : 'ডিলিট করতে চান?')) return;
    const updatedSales = (user.sales || []).filter(s => s.id !== id);
    await syncUserProfile({ ...user, sales: updatedSales });
  };

  const currencySymbol = user?.currency || '৳';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {editingSale && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md">
           <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-[40px] shadow-2xl p-10 border-4 border-primary/20">
              <h3 className="text-xl font-black mb-6 dark:text-white uppercase tracking-tighter">Edit Sale Record</h3>
              <form onSubmit={handleUpdateSale} className="space-y-4">
                 <input type="text" value={editingSale.productName} onChange={e => setEditingSale({...editingSale, productName: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl outline-none font-bold text-xs" placeholder="Product Name" required />
                 <div className="grid grid-cols-2 gap-4">
                    <input type="number" value={editingSale.qty} onChange={e => setEditingSale({...editingSale, qty: parseInt(e.target.value) || 0})} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl outline-none font-bold text-xs" placeholder="Qty" required />
                    <input type="number" value={editingSale.sellPrice} onChange={e => setEditingSale({...editingSale, sellPrice: parseFloat(e.target.value) || 0})} className="w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 rounded-xl outline-none font-bold text-xs" placeholder="Sell Price" required />
                 </div>
                 <button type="submit" className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl uppercase tracking-widest text-[10px]">Update & Sync</button>
                 <button type="button" onClick={() => setEditingSale(null)} className="w-full py-2 text-gray-400 font-black uppercase text-[8px] tracking-widest">Cancel</button>
              </form>
           </div>
        </div>
      )}

      <div className="flex items-center justify-between no-print">
         <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">{t('todaySalesHistory')}</h2>
         <div className="flex gap-2">
            <button onClick={() => { setIsDailyPrint(true); setTimeout(() => { window.print(); setIsDailyPrint(false); }, 100); }} className="px-8 py-3 bg-primary text-white font-black rounded-2xl shadow-xl uppercase text-[10px] tracking-widest border-b-4 border-black/20">Daily Print</button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-[40px] shadow-sm border dark:border-gray-700 overflow-hidden">
              <h3 className="text-sm font-black dark:text-white uppercase tracking-[0.2em] flex items-center mb-8">
                 <span className="w-1.5 h-6 bg-primary rounded-full mr-3"></span>Today's Records
              </h3>
              <div className="overflow-x-auto">
                 <table className="w-full text-left min-w-[500px]">
                    <thead>
                       <tr className="border-b-4 border-gray-100 dark:border-gray-700">
                          <th className="py-4 px-4 text-[9px] font-black uppercase text-gray-400">Ref/Product</th>
                          <th className="py-4 px-4 text-[9px] font-black uppercase text-gray-400">Qty</th>
                          <th className="py-4 px-4 text-[9px] font-black uppercase text-gray-400">Rate</th>
                          <th className="py-4 px-4 text-[9px] font-black uppercase text-gray-400 text-right">Profit</th>
                          <th className="py-4 px-4 no-print text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                       {todaySales.map(s => (
                          <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors group">
                             <td className="py-5 px-4"><p className="text-sm font-black dark:text-white">{s.productName}</p><p className="text-[8px] font-black text-gray-400 uppercase mt-2 tracking-tighter">{s.invoiceId} • {s.category}</p></td>
                             <td className="py-5 px-4 font-black dark:text-gray-300 text-sm">{s.qty}</td>
                             <td className="py-5 px-4 font-black dark:text-gray-300 text-sm">{currencySymbol}{s.sellPrice.toLocaleString()}</td>
                             <td className="py-5 px-4 text-right font-black text-emerald-500">+{currencySymbol}{s.profit.toLocaleString()}</td>
                             <td className="py-5 px-4 text-right no-print">
                                <div className="flex justify-end gap-2">
                                   <button onClick={() => setEditingSale(s)} className="p-2 text-primary bg-primary/5 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                   {role === 'ADMIN' && <button onClick={() => handleDelete(s.id)} className="p-2 text-rose-500 bg-rose-50 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>}
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        <div className="space-y-8 no-print">
           <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-sm border dark:border-gray-700">
              <h3 className="text-sm font-black dark:text-white uppercase tracking-[0.2em] mb-8">{t('catWiseProfit')}</h3>
              {Object.entries(categorySummary).map(([cat, val]: [string, any]) => (
                 <div key={cat} className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-900 rounded-3xl mb-4 border-l-4 border-emerald-500">
                    <div><p className="text-[10px] font-black uppercase text-emerald-600 mb-1">{cat}</p><p className="text-[9px] font-bold text-gray-400 uppercase">{val.qty} Sold</p></div>
                    <div className="text-right"><p className="text-sm font-black text-emerald-500">+{currencySymbol}{val.profit.toLocaleString()}</p></div>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* Daily Branding Report for Print */}
      <div className={`hidden print:block bg-white p-12 mt-10 rounded-[30px] border-t-[12px] border-primary min-h-[900px]`}>
         <div className="flex justify-between items-start mb-12">
            <div className="flex items-center gap-6">
               <div className="w-24 h-24 rounded-[30px] bg-gray-50 border-2 border-primary/10 overflow-hidden flex items-center justify-center shadow-lg">
                  {user?.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : <span className="text-3xl font-black text-primary/20">LOGO</span>}
               </div>
               <div>
                  <h1 className="text-4xl font-black text-primary italic leading-none">{user?.name}</h1>
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 mt-2">{user?.slogan || 'Professional Business Management'}</p>
                  <p className="text-[9px] font-bold text-gray-500 mt-2">{user?.email} • {user?.mobile}</p>
               </div>
            </div>
            <div className="text-right">
               <div className="p-6 bg-gray-50 rounded-3xl border-2 border-gray-100">
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Total Daily Profit</p>
                  <p className="text-3xl font-black text-emerald-600">{currencySymbol}{todaySales.reduce((a,b) => a + b.profit, 0).toLocaleString()}</p>
               </div>
            </div>
         </div>

         <div className="border-y-2 border-gray-100 py-4 mb-8 grid grid-cols-3 gap-10">
            <div><p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Statement Date</p><p className="text-xs font-black">{new Date().toLocaleDateString('en-GB', {day: '2-digit', month: 'long', year: 'numeric'})}</p></div>
            <div><p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Report Type</p><p className="text-xs font-black uppercase">Daily Product Summary</p></div>
            <div><p className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Total Items</p><p className="text-xs font-black">{todaySales.length} Transactions</p></div>
         </div>

         <table className="w-full text-left mb-12">
            <thead>
               <tr className="border-b-4 border-gray-900">
                  <th className="py-3 text-[9px] font-black uppercase px-2">REFERENCE</th>
                  <th className="py-3 text-[9px] font-black uppercase px-2">PRODUCT NAME</th>
                  <th className="py-3 text-[9px] font-black uppercase px-2">QTY</th>
                  <th className="py-3 text-right text-[9px] font-black uppercase px-2">PROFIT</th>
               </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
               {todaySales.map(s => (
                  <tr key={s.id} className="text-[11px] font-bold">
                     <td className="py-4 font-mono text-gray-400 px-2">{s.invoiceId}</td>
                     <td className="py-4 px-2 uppercase">{s.productName}</td>
                     <td className="py-4 px-2">{s.qty} PCS</td>
                     <td className="py-4 text-right px-2 text-emerald-600">+{currencySymbol}{s.profit.toLocaleString()}</td>
                  </tr>
               ))}
            </tbody>
         </table>

         <div className="mt-20 flex justify-between items-end border-t-2 border-dashed border-gray-200 pt-16">
            <div className="text-[8px] font-black uppercase tracking-[0.5em] text-gray-300">KHURASAN PREMIUM POS • REPORT GENERATED BY GRAPHICO GLOBAL</div>
            <div className="text-center w-64">
               <div className="border-b-2 border-gray-900 mb-3"></div>
               <p className="text-[10px] font-black uppercase tracking-widest">Owner Signature</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default TodaySales;
