
import React, { useMemo, useState } from 'react';
import { useApp } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const Reports: React.FC = () => {
  const { transactions, t, user, language } = useApp();
  const [viewMode, setViewMode] = useState<'MONTHLY' | 'YEARLY' | 'STATEMENT'>('MONTHLY');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const chartData = useMemo(() => {
    const income = transactions.filter(tx => tx.type === 'INCOME').reduce((acc, tx) => acc + tx.amount, 0);
    const expense = transactions.filter(tx => tx.type === 'EXPENSE').reduce((acc, tx) => acc + tx.amount, 0);
    const dues = transactions.filter(tx => tx.type === 'DUE').reduce((acc, tx) => acc + tx.amount, 0);

    return [
      { name: t('income'), value: income, fill: '#10B981' },
      { name: t('expense'), value: expense, fill: '#EF4444' },
      { name: t('dues'), value: dues, fill: '#F59E0B' },
    ];
  }, [transactions, t]);

  const timeSeriesData = useMemo(() => {
    const groups: any = {};
    
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const key = viewMode === 'MONTHLY' 
        ? date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
        : date.toLocaleDateString(undefined, { month: 'long' });
      
      if (!groups[key]) groups[key] = { name: key, income: 0, expense: 0 };
      
      if (tx.type === 'INCOME') groups[key].income += tx.amount;
      if (tx.type === 'EXPENSE') groups[key].expense += tx.amount;
    });

    return Object.values(groups).reverse();
  }, [transactions, viewMode]);

  const statementData = useMemo(() => {
    if (viewMode !== 'STATEMENT') return [];
    
    const dailyMap: Record<string, { income: number, expense: number, dues: number, profit: number }> = {};
    const filteredTxs = transactions.filter(tx => tx.date.startsWith(selectedMonth));
    
    filteredTxs.forEach(tx => {
      if (!dailyMap[tx.date]) {
        dailyMap[tx.date] = { income: 0, expense: 0, dues: 0, profit: 0 };
      }
      if (tx.type === 'INCOME') dailyMap[tx.date].income += tx.amount;
      if (tx.type === 'EXPENSE') dailyMap[tx.date].expense += tx.amount;
      if (tx.type === 'DUE') dailyMap[tx.date].dues += tx.amount;
      dailyMap[tx.date].profit += (tx.profit || 0);
    });

    return Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({ date, ...vals }));
  }, [transactions, viewMode, selectedMonth]);

  const statementTotals = useMemo(() => {
    return statementData.reduce((acc, curr) => ({
      income: acc.income + curr.income,
      expense: acc.expense + curr.expense,
      dues: acc.dues + curr.dues,
      profit: acc.profit + curr.profit
    }), { income: 0, expense: 0, dues: 0, profit: 0 });
  }, [statementData]);

  const currencySymbol = user?.currency || '৳';

  if (viewMode === 'STATEMENT') {
    return (
      <div className="animate-in fade-in duration-500 pb-20">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 no-print gap-4">
           <div className="flex items-center gap-4">
              <button onClick={() => setViewMode('MONTHLY')} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">{t('monthlyStatement')}</h2>
           </div>
           <div className="flex items-center gap-2">
              <input 
                 type="month" 
                 value={selectedMonth} 
                 onChange={e => setSelectedMonth(e.target.value)} 
                 className="px-6 py-3 bg-white dark:bg-gray-800 border-2 dark:border-gray-700 rounded-2xl outline-none font-black text-xs"
              />
              <button onClick={() => window.print()} className="px-6 py-3 bg-primary text-white font-black rounded-2xl shadow-lg uppercase text-[10px] tracking-widest">
                 Print Statement
              </button>
           </div>
        </div>

        <div className="bg-white p-10 rounded-[40px] shadow-2xl border-t-[10px] border-primary print:shadow-none print:rounded-none print:p-0 min-h-[1000px]">
           <div className="flex justify-between items-start mb-10">
              <div>
                 <h1 className="text-4xl font-black text-primary italic leading-none mb-4">{user?.name}</h1>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">{t('statementLeaf')}</p>
                 <p className="text-sm font-bold text-gray-600 mt-4">Month: <span className="font-black text-black">{new Date(selectedMonth).toLocaleDateString(language === 'EN' ? 'en-US' : 'bn-BD', { month: 'long', year: 'numeric' })}</span></p>
              </div>
              <div className="text-right">
                 <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Printed On</p>
                 <p className="text-xs font-black">{new Date().toLocaleDateString()}</p>
              </div>
           </div>

           <table className="w-full text-left mb-10">
              <thead>
                 <tr className="border-b-4 border-gray-100">
                    <th className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('date')}</th>
                    <th className="py-4 text-[10px] font-black uppercase tracking-widest text-emerald-500">{t('income')}</th>
                    <th className="py-4 text-[10px] font-black uppercase tracking-widest text-rose-500">{t('expense')}</th>
                    <th className="py-4 text-[10px] font-black uppercase tracking-widest text-amber-500">{t('dues')}</th>
                    <th className="py-4 text-[10px] font-black uppercase tracking-widest text-blue-500 text-right">{t('profit')}</th>
                 </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-50">
                 {statementData.length === 0 ? (
                    <tr><td colSpan={5} className="py-20 text-center font-black uppercase text-gray-300 text-xs tracking-widest">{t('noTransactions')}</td></tr>
                 ) : (
                    statementData.map(day => (
                       <tr key={day.date} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 text-xs font-black font-mono">{day.date}</td>
                          <td className="py-4 text-xs font-black text-emerald-600">{currencySymbol}{day.income.toLocaleString()}</td>
                          <td className="py-4 text-xs font-black text-rose-600">{currencySymbol}{day.expense.toLocaleString()}</td>
                          <td className="py-4 text-xs font-black text-amber-600">{currencySymbol}{day.dues.toLocaleString()}</td>
                          <td className="py-4 text-xs font-black text-blue-600 text-right">{currencySymbol}{day.profit.toLocaleString()}</td>
                       </tr>
                    ))
                 )}
              </tbody>
           </table>

           <div className="bg-gray-50 p-8 rounded-[30px] border-t-4 border-primary mt-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                 <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">{t('grandTotal')} {t('income')}</p>
                    <p className="text-xl font-black text-emerald-600">{currencySymbol}{statementTotals.income.toLocaleString()}</p>
                 </div>
                 <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">{t('grandTotal')} {t('expense')}</p>
                    <p className="text-xl font-black text-rose-600">{currencySymbol}{statementTotals.expense.toLocaleString()}</p>
                 </div>
                 <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">{t('grandTotal')} {t('dues')}</p>
                    <p className="text-xl font-black text-amber-600">{currencySymbol}{statementTotals.dues.toLocaleString()}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">{t('grandTotal')} {t('profit')}</p>
                    <p className="text-2xl font-black text-blue-700">{currencySymbol}{statementTotals.profit.toLocaleString()}</p>
                 </div>
              </div>
           </div>

           <div className="mt-20 flex justify-between items-end border-t-2 border-dashed pt-10">
              <div className="text-[8px] font-black uppercase tracking-[0.5em] text-gray-300">
                 Khurasan - Premium POS Statement
              </div>
              <div className="text-center">
                 <div className="w-40 border-b-2 border-gray-900 mb-2"></div>
                 <p className="text-[8px] font-black uppercase tracking-widest">Authorized Signature</p>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in zoom-in duration-500 pb-20">
      <div className="flex items-center justify-between no-print">
         <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Analytics</h2>
         <div className="flex gap-2">
            <button 
              onClick={() => setViewMode('STATEMENT')}
              className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-black shadow-lg hover:opacity-90 transition-all uppercase tracking-widest"
            >
              {t('monthlyStatement')}
            </button>
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl border dark:border-gray-700">
               <button 
                 onClick={() => setViewMode('MONTHLY')}
                 className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'MONTHLY' ? 'bg-white dark:bg-gray-700 shadow-lg scale-105' : 'text-gray-500'}`}
               >
                 {t('monthly')}
               </button>
               <button 
                 onClick={() => setViewMode('YEARLY')}
                 className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'YEARLY' ? 'bg-white dark:bg-gray-700 shadow-lg scale-105' : 'text-gray-500'}`}
               >
                 {t('yearly')}
               </button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:grid-cols-1">
        {/* Main Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border dark:border-gray-700">
          <h3 className="text-lg font-black mb-8 flex items-center dark:text-white uppercase tracking-tight">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full mr-3"></span>
            Total Distribution
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 800 }}
                  formatter={(value: any) => [`৳ ${value.toLocaleString()}`, '']}
                />
                <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Series Chart */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border dark:border-gray-700">
          <h3 className="text-lg font-black mb-8 flex items-center dark:text-white uppercase tracking-tight">
            <span className="w-1.5 h-6 bg-purple-600 rounded-full mr-3"></span>
            Cash Flow Trend ({viewMode === 'MONTHLY' ? 'Days' : 'Months'})
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 800 }}
                />
                <Bar dataKey="income" fill="#10B981" radius={[8, 8, 8, 8]} barSize={20} />
                <Bar dataKey="expense" fill="#EF4444" radius={[8, 8, 8, 8]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {chartData.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border dark:border-gray-700 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.name}</p>
              <p className="text-2xl font-black dark:text-white">৳ {stat.value.toLocaleString()}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center`} style={{ backgroundColor: `${stat.fill}20`, color: stat.fill }}>
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
          </div>
        ))}
      </div>
      
      <div className="hidden print:block text-center pt-10 border-t text-[10px] font-black uppercase tracking-[1em] text-gray-300">
         GRAPHICO GLOBAL • KHURASAN POS
      </div>
    </div>
  );
};

export default Reports;
