
import React, { useMemo, useState } from 'react';
import { useApp } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const Reports: React.FC = () => {
  const { transactions, t } = useApp();
  const [viewMode, setViewMode] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

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

  return (
    <div className="space-y-8 animate-in zoom-in duration-500 pb-20">
      <div className="flex items-center justify-between no-print">
         <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Analytics</h2>
         <div className="flex gap-2">
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
            <button onClick={() => window.print()} className="p-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 transition-all">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            </button>
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
         GRAPHICO GLOBAL • MANAGEMONEY PRO
      </div>
    </div>
  );
};

export default Reports;
