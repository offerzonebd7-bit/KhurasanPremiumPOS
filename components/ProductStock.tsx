
import React, { useState } from 'react';
import { useApp } from '../App';
import { Product } from '../types';
import { CLOTHING_SIZES, DEFAULT_COLORS } from '../constants';

const ProductStock: React.FC = () => {
  const { user, setUser, role, moderatorName, t, language, syncUserProfile } = useApp();
  const [formData, setFormData] = useState({ 
    name: '', code: '', category: '', color: 'Black', customColor: '', 
    size: 'M', stockQuantity: '', buyPrice: '', sellPrice: '' 
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSyncing(true);
    const finalColor = formData.color === 'Custom' ? formData.customColor : formData.color;
    
    const newProduct: Product = {
      id: 'P-' + Date.now(),
      name: formData.name,
      code: formData.code || ('C-' + Date.now().toString().slice(-6)),
      category: formData.category || 'Clothing',
      color: finalColor,
      size: formData.size,
      stockQuantity: parseInt(formData.stockQuantity) || 0,
      buyPrice: parseFloat(formData.buyPrice) || 0,
      sellPrice: parseFloat(formData.sellPrice) || 0,
      addedAt: new Date().toISOString()
    };
    const updatedUser = { ...user, products: [...(user.products || []), newProduct] };
    setUser(updatedUser, role, moderatorName);
    await syncUserProfile(updatedUser);
    setFormData({ 
      name: '', code: '', category: '', color: 'Black', customColor: '', 
      size: 'M', stockQuantity: '', buyPrice: '', sellPrice: '' 
    });
    setIsSyncing(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingProduct) return;
    setIsSyncing(true);
    const updatedProducts = (user.products || []).map(p => p.id === editingProduct.id ? editingProduct : p);
    const updatedUser = { ...user, products: updatedProducts };
    setUser(updatedUser, role, moderatorName);
    await syncUserProfile(updatedUser);
    setEditingProduct(null);
    setIsSyncing(false);
  };

  const handleRemove = async (id: string) => {
    if (role === 'MODERATOR') return alert(t('insufficientPermissions'));
    if (!user || !confirm(language === 'EN' ? 'Delete this product?' : 'পণ্যটি ডিলিট করতে চান?')) return;
    setIsSyncing(true);
    const updatedUser = { ...user, products: (user.products || []).filter(p => p.id !== id) };
    setUser(updatedUser, role, moderatorName);
    await syncUserProfile(updatedUser);
    setIsSyncing(false);
  };

  const filtered = user?.products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.size.toString().includes(searchTerm)
  ) || [];

  const inputClass = "px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-transparent dark:border-gray-700 rounded-xl outline-none font-bold text-xs focus:border-primary transition-all";

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {editingProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md animate-in zoom-in duration-300">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-[30px] shadow-2xl overflow-hidden border-4 border-primary/10">
            <div className="p-8 bg-primary text-white flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tighter">Edit Product</h2>
              <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-8 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-2">{t('productName')}</label>
                  <input type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className={inputClass} required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Code</label>
                  <input type="text" value={editingProduct.code} onChange={e => setEditingProduct({...editingProduct, code: e.target.value})} className={inputClass} required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-2">{t('color')}</label>
                  <input type="text" value={editingProduct.color} onChange={e => setEditingProduct({...editingProduct, color: e.target.value})} className={inputClass} required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-2">{t('size')}</label>
                  <select value={editingProduct.size} onChange={e => setEditingProduct({...editingProduct, size: e.target.value})} className={inputClass}>
                    {CLOTHING_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-2">{t('stockIn')}</label>
                  <input type="number" value={editingProduct.stockQuantity} onChange={e => setEditingProduct({...editingProduct, stockQuantity: parseInt(e.target.value) || 0})} className={inputClass} required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-2">{t('buyPrice')}</label>
                  <input type="number" value={editingProduct.buyPrice} onChange={e => setEditingProduct({...editingProduct, buyPrice: parseFloat(e.target.value) || 0})} className={inputClass} required />
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-2">{t('sellPrice')}</label>
                  <input type="number" value={editingProduct.sellPrice} onChange={e => setEditingProduct({...editingProduct, sellPrice: parseFloat(e.target.value) || 0})} className={inputClass} required />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg uppercase tracking-widest text-[10px] border-b-4 border-black/20 mt-4">{t('save')}</button>
            </form>
          </div>
        </div>
      )}

      <section className="bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-sm border dark:border-gray-700">
        <h3 className="text-xl font-black mb-6 dark:text-white uppercase tracking-tighter flex items-center">
           <span className="w-2 h-6 bg-primary mr-3 rounded-full"></span>
           Add New Clothing Item
        </h3>
        <form onSubmit={handleAdd} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
             <div className="flex flex-col gap-1 lg:col-span-2">
                <input type="text" placeholder={t('productName')} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} required />
             </div>
             <input type="text" placeholder="Category (e.g. Panjabi)" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className={inputClass} />
             <input type="text" placeholder="Custom Code (Optional)" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className={inputClass} />
             
             <div className="flex flex-col gap-1">
               <select value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className={inputClass}>
                  {DEFAULT_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="Custom">Custom Color...</option>
               </select>
               {formData.color === 'Custom' && (
                 <input type="text" placeholder="Enter Color Name" value={formData.customColor} onChange={e => setFormData({...formData, customColor: e.target.value})} className={`${inputClass} mt-2 animate-in slide-in-from-top-2`} required />
               )}
             </div>

             <select value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} className={inputClass}>
                <option value="" disabled>Select Size</option>
                {CLOTHING_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
             </select>

             <input type="number" placeholder={t('stockIn')} value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} className={inputClass} required />
             <input type="number" placeholder={t('buyPrice')} value={formData.buyPrice} onChange={e => setFormData({...formData, buyPrice: e.target.value})} className={inputClass} required />
             <input type="number" placeholder={t('sellPrice')} value={formData.sellPrice} onChange={e => setFormData({...formData, sellPrice: e.target.value})} className={`${inputClass} md:col-span-2 lg:col-span-1`} required />
          </div>
          <button type="submit" disabled={isSyncing} className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl uppercase tracking-[0.2em] text-[10px] border-b-4 border-black/20 disabled:opacity-50 active:scale-95 transition-all">
            {isSyncing ? 'Processing...' : '+ Stock In (Save Product)'}
          </button>
        </form>
      </section>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-[40px] shadow-sm border dark:border-gray-700">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Inventory Status</h3>
           <div className="relative w-full md:w-80">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth={3}/></svg>
              <input type="text" placeholder="Search by name, color, size..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-5 py-3.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-2xl outline-none font-bold text-xs" />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b dark:border-gray-600">
               <tr>
                  <th className="px-6 py-4">{t('productName')}</th>
                  <th className="px-6 py-4">{t('color')} / {t('size')}</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
               {filtered.length === 0 ? (
                 <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">No items found</td></tr>
               ) : filtered.map(p => (
                 <tr key={p.id} className="text-xs font-bold dark:text-gray-200 group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-5">
                       <p className="font-black leading-none">{p.name}</p>
                       <p className="text-[8px] font-black text-gray-400 uppercase mt-1 tracking-widest">{p.code}</p>
                    </td>
                    <td className="px-6 py-5">
                       <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-[9px] uppercase font-black">{p.color}</span>
                       <span className="ml-2 px-2 py-1 bg-amber-500/10 text-amber-600 rounded-lg text-[9px] uppercase font-black">{p.size}</span>
                    </td>
                    <td className="px-6 py-5">
                       <p className={`font-black ${p.stockQuantity <= 5 ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`}>{p.stockQuantity} Pcs</p>
                       <p className="text-[7px] font-bold text-gray-400 uppercase mt-1">{p.stockQuantity > 0 ? t('inStock') : t('outOfStock')}</p>
                    </td>
                    <td className="px-6 py-5">
                       <p className="text-gray-400 text-[10px]">B: {p.buyPrice}</p>
                       <p className="text-emerald-600 font-black">S: {p.sellPrice}</p>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingProduct(p)} className="p-2.5 text-primary hover:bg-primary/10 rounded-xl transition-all shadow-sm bg-white dark:bg-gray-800 border">
                             <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button onClick={() => handleRemove(p.id)} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all shadow-sm bg-white dark:bg-gray-800 border">
                             <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                       </div>
                    </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductStock;
