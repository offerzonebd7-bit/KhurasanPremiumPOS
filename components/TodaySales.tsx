
import React, { useMemo } from 'react';
import { useApp } from '../App';
import { SaleRecord } from '../types';

const TodaySales: React.FC = () => {
  const { user, t, syncUserProfile, language } = useApp();
  const todayStr = new Date().toISOString().split('T')[0];
  
  const todaySales = useMemo(() => {
    return (user?.sales || []).filter(s => s.date === todayStr);
  }, [user?.sales, todayStr]);

  const categorySummary = useMemo(() => {
    const summary: Record<string, { qty: number, profit: number, total: number }> = {};
    todaySales.forEach(s => {
      const cat = s.category || (language === 'EN' ? 'Uncategorized' : 'অনির্ধারিত');
      if (!summary[cat]) {
        summary[cat] = { qty: 0, profit: 0, total: 0 };
      }
      summary[cat].qty += s.qty;
      summary[cat].profit += s.profit;
      summary[cat].total += (s.qty * s.sellPrice);
    });
    return summary;
  }, [todaySales, language]);

  const productSummary = useMemo(() => {
    const summary: Record<string, { qty: number, total: number }> = {};
    todaySales.forEach(s => {
      if (!summary[s.productName]) {
        summary[s.productName] = { qty: 0, total: 0 };
      }
      summary[s.productName].qty += s.qty;
      summary[s.productName].total += (s.qty * s.sellPrice);
    });
    return summary;
  }, [todaySales]);

  const handleDelete = async (id: string) => {
    if (!user || !confirm(language === 'EN' ? 'Delete this record?' : 'ডিলিট করতে চান?')) return;
    const updatedSales = (user.sales || []).filter(s => s.id !== id);
    await syncUserProfile({ ...user, sales: updatedSales });
  };

  const currencySymbol = user?.currency || '৳';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between no-print">
         <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">{t('todaySalesHistory')}</h2>
         <button onClick={() => window.print()} className="px-8 py-3 bg-primary text-white font-black rounded-2xl shadow-xl uppercase text-[10px] tracking-widest border-b-4 border-black/20 hover:scale-105 active:scale-95 transition-all">
            {t('print')}
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Professional Statement Style Table */}
           <div className="bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-[40px] shadow-sm border dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-sm font-black dark:text-white uppercase tracking-[0.2em] flex items-center">
                    <span className="w-1.5 h-6 bg-primary rounded-full mr-3"></span>
                    Transaction Ledger
                 </h3>
                 <span className="text-[10px] font-black text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full uppercase">Today</span>
              </div>
              
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                 <table className="w-full text-left min-w-[500px]">
                    <thead>
                       <tr className="border-b-4 border-gray-100 dark:border-gray-700">
                          <th className="py-4 px-4 text-[9px] font-black uppercase text-gray-400">Ref/Product</th>
                          <th className="py-4 px-4 text-[9px] font-black uppercase text-gray-400">Qty</th>
                          <th className="py-4 px-4 text-[9px] font-black uppercase text-gray-400">Rate</th>
                          <th className="py-4 px-4 text-[9px] font-black uppercase text-gray-400 text-right">Profit</th>
                          <th className="py-4 px-4 no-print"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                       {todaySales.length === 0 ? (
                          <tr><td colSpan={5} className="py-20 text-center font-bold text-gray-300 uppercase text-[12px] tracking-[0.3em]">No Transactions Yet</td></tr>
                       ) : (
                          todaySales.map(s => (
                             <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors group">
                                <td className="py-5 px-4">
                                   <p className="text-sm font-black dark:text-white leading-none">{s.productName}</p>
                                   <p className="text-[8px] font-black text-gray-400 uppercase mt-2 tracking-tighter">{s.invoiceId} • {s.category}</p>
                                </td>
                                <td className="py-5 px-4 font-black dark:text-gray-300 text-sm">{s.qty}</td>
                                <td className="py-5 px-4 font-black dark:text-gray-300 text-sm">{currencySymbol}{s.sellPrice.toLocaleString()}</td>
                                <td className="py-5 px-4 text-right">
                                   <p className="text-sm font-black text-emerald-500">+{currencySymbol}{s.profit.toLocaleString()}</p>
                                </td>
                                <td className="py-5 px-4 text-right no-print">
                                   <button onClick={() => handleDelete(s.id)} className="p-2 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                   </button>
                                </td>
                             </tr>
                          ))
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* Product Statistics Table */}
           <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-sm border dark:border-gray-700">
              <h3 className="text-sm font-black mb-8 dark:text-white uppercase tracking-[0.2em]">Inventory Movement (Units)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {Object.entries(productSummary).map(([name, val]: [string, any]) => (
                    <div key={name} className="flex justify-between items-center p-5 bg-gray-50 dark:bg-gray-900 rounded-[25px] border-2 border-transparent hover:border-primary/20 transition-all">
                       <span className="text-[12px] font-black dark:text-white truncate flex-1">{name}</span>
                       <span className="ml-4 px-4 py-1.5 bg-primary text-white rounded-xl text-[10px] font-black shadow-lg shadow-primary/20">{val.qty} Units</span>
                    </div>
                 ))}
                 {Object.keys(productSummary).length === 0 && (
                    <p className="col-span-2 text-center py-6 text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">Inventory list empty for today</p>
                 )}
              </div>
           </div>
        </div>

        <div className="space-y-8 no-print">
           {/* Category Wise Profit Table - Modern Card */}
           <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-sm border dark:border-gray-700">
              <h3 className="text-sm font-black mb-8 dark:text-white uppercase tracking-[0.2em]">{t('catWiseProfit')}</h3>
              <div className="space-y-4">
                 {Object.entries(categorySummary).map(([cat, val]: [string, any]) => (
                    <div key={cat} className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-900 rounded-3xl border-l-4 border-emerald-500 group hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all">
                       <div>
                          <p className="text-[10px] font-black uppercase text-emerald-600 mb-1">{cat}</p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{val.qty} Sold</p>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black text-emerald-500">+{currencySymbol}{val.profit.toLocaleString()}</p>
                          <p className="text-[9px] font-bold text-gray-400">Total: {currencySymbol}{val.total.toLocaleString()}</p>
                       </div>
                    </div>
                 ))}
                 {Object.keys(categorySummary).length === 0 && (
                    <div className="text-center py-10">
                       <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2.5}/></svg>
                       </div>
                       <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Wait for sales</p>
                    </div>
                 )}
              </div>
           </div>

           {/* Quick Totals Card */}
           <div className="bg-gray-900 text-white p-8 rounded-[40px] shadow-2xl border-t-8 border-primary">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">Today's Summary</p>
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400">Total Units Sold</span>
                    <span className="text-lg font-black">{todaySales.reduce((a,b) => a + b.qty, 0)}</span>
                 </div>
                 <div className="flex justify-between items-center border-t border-gray-800 pt-4">
                    <span className="text-xs font-bold text-gray-400">Total Profit</span>
                    <span className="text-2xl font-black text-emerald-400">{currencySymbol}{todaySales.reduce((a,b) => a + b.profit, 0).toLocaleString()}</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Professional Printed Statement */}
      <div className="hidden print:block bg-white p-12 mt-10 rounded-[30px] border-t-[12px] border-primary min-h-[900px]">
         <div className="flex justify-between items-start mb-12">
            <div>
               <h1 className="text-4xl font-black text-primary italic mb-2 leading-none">{user?.name}</h1>
               <p className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-400">Daily Sales Ledger Report</p>
               <div className="mt-8 space-y-1">
                  <p className="text-[10px] font-bold"><span className="text-gray-400 uppercase tracking-widest mr-2">Report Date:</span> {new Date().toLocaleDateString('en-GB', {day: '2-digit', month: 'long', year: 'numeric'})}</p>
                  <p className="text-[10px] font-bold"><span className="text-gray-400 uppercase tracking-widest mr-2">Generated At:</span> {new Date().toLocaleTimeString()}</p>
               </div>
            </div>
            <div className="text-right">
               <div className="p-5 bg-gray-50 rounded-3xl border-2 border-gray-100">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Total Daily Profit</p>
                  <p className="text-3xl font-black text-emerald-600">{currencySymbol}{todaySales.reduce((a,b) => a + b.profit, 0).toLocaleString()}</p>
               </div>
            </div>
         </div>

         <h4 className="text-[10px] font-black uppercase tracking-widest bg-gray-100 p-3 rounded-xl mb-6">1. Detailed Transaction Logs</h4>
         <table className="w-full text-left border-collapse mb-12">
            <thead>
               <tr className="border-b-4 border-gray-900">
                  <th className="py-3 text-[9px] font-black uppercase px-2">REFERENCE</th>
                  <th className="py-3 text-[9px] font-black uppercase px-2">PRODUCT NAME</th>
                  <th className="py-3 text-[9px] font-black uppercase px-2">CATEGORY</th>
                  <th className="py-3 text-[9px] font-black uppercase px-2">QTY</th>
                  <th className="py-3 text-right text-[9px] font-black uppercase px-2">PROFIT</th>
               </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
               {todaySales.map(s => (
                  <tr key={s.id} className="text-[11px] font-bold">
                     <td className="py-4 font-mono text-gray-400 px-2">{s.invoiceId}</td>
                     <td className="py-4 px-2 uppercase">{s.productName}</td>
                     <td className="py-4 px-2 uppercase text-gray-400">{s.category}</td>
                     <td className="py-4 px-2">{s.qty}</td>
                     <td className="py-4 text-right px-2 text-emerald-600">+{currencySymbol}{s.profit.toLocaleString()}</td>
                  </tr>
               ))}
            </tbody>
         </table>

         <div className="grid grid-cols-2 gap-10">
            <div>
               <h4 className="text-[10px] font-black uppercase tracking-widest bg-gray-100 p-3 rounded-xl mb-4">2. Category Summary</h4>
               <div className="space-y-2">
                  {Object.entries(categorySummary).map(([cat, val]: [string, any]) => (
                     <div key={cat} className="flex justify-between text-[11px] border-b pb-2">
                        <span className="font-bold uppercase">{cat} ({val.qty} units)</span>
                        <span className="font-black">+{currencySymbol}{val.profit.toLocaleString()}</span>
                     </div>
                  ))}
               </div>
            </div>
            <div className="flex flex-col justify-end">
               <div className="bg-gray-900 text-white p-8 rounded-[30px] space-y-4">
                  <div className="flex justify-between text-[10px] font-bold opacity-60 uppercase">
                     <span>Final Statement Total</span>
                     <span>Checked & Verified</span>
                  </div>
                  <div className="flex justify-between items-end border-t border-gray-700 pt-6">
                     <span className="text-[12px] font-black uppercase">Grand Total Profit</span>
                     <span className="text-4xl font-black text-emerald-400 leading-none">{currencySymbol}{todaySales.reduce((a,b) => a + b.profit, 0).toLocaleString()}</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="mt-20 flex justify-between items-end border-t-2 border-dashed border-gray-200 pt-12">
            <div className="text-[8px] font-black uppercase tracking-[0.5em] text-gray-300">
               KHURASAN PREMIUM POS • GENERATED BY GRAPHICO GLOBAL
            </div>
            <div className="text-center w-64">
               <div className="border-b-2 border-gray-900 mb-3"></div>
               <p className="text-[9px] font-black uppercase tracking-widest">Store Manager Signature</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default TodaySales;
