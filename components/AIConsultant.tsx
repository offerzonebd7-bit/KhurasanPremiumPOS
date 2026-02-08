
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useApp } from '../App';

const AIConsultant: React.FC = () => {
  const { user, t, language, addTransaction } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string, data?: any }[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const processAIRequest = async () => {
    if (!input && !imagePreview) return;
    
    // Safety check for API Key environment variable
    const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : '';
    if (!apiKey) {
      setMessages(prev => [...prev, { role: 'ai', text: "API Key not found. Please ensure it is configured." }]);
      return;
    }

    setLoading(true);
    const userMsg = input || (language === 'EN' ? "Analyzing image..." : "ছবি বিশ্লেষণ করা হচ্ছে...");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    
    try {
      const ai = new GoogleGenAI({ apiKey });
      const model = 'gemini-3-flash-preview';
      let contents: any[] = [];
      
      if (imagePreview) {
        contents.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: imagePreview.split(',')[1],
          },
        });
      }
      
      const systemPrompt = `You are the Khurasan POS AI Business Advisor.
      Role: Analyze business text/images, extract transactions, and provide growth advice.
      Output: Concise advice in ${language === 'EN' ? 'English' : 'Bengali'}.
      If adding data, append a JSON block: { "transactions": [{"amount": 100, "description": "text", "type": "INCOME/EXPENSE/DUE", "category": "cat"}] }`;

      contents.push({ text: input || "Analyze this business document." });

      const result = await ai.models.generateContent({
        model,
        contents: { parts: contents },
        config: { systemInstruction: systemPrompt }
      });

      const aiText = result.text || "";
      let extractedData = null;
      try {
        const jsonMatch = aiText.match(/\{.*\}/s);
        if (jsonMatch) extractedData = JSON.parse(jsonMatch[0]);
      } catch (e) {}

      setMessages(prev => [...prev, { role: 'ai', text: aiText.replace(/\{.*\}/s, ''), data: extractedData }]);
      setInput('');
      setImagePreview(null);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', text: language === 'EN' ? "AI Connection Error." : "এআই সংযোগে ত্রুটি হয়েছে।" }]);
    } finally {
      setLoading(false);
    }
  };

  const confirmEntry = (tx: any) => {
    addTransaction({
      amount: Number(tx.amount),
      description: tx.description,
      type: tx.type,
      category: tx.category,
      date: new Date().toISOString().split('T')[0]
    });
    alert(language === 'EN' ? 'Record Added!' : 'হিসাব যুক্ত হয়েছে!');
  };

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className="fixed bottom-32 right-6 z-[100] w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:rotate-12 transition-all group"
    >
      <div className="absolute inset-0 bg-indigo-400 rounded-full animate-ping opacity-20"></div>
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
       <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-[35px] shadow-2xl flex flex-col h-[75vh] border-2 dark:border-gray-700 overflow-hidden">
          <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </div>
                <div>
                   <h3 className="font-black text-xs uppercase tracking-widest leading-none">AI Advisor</h3>
                   <p className="text-[8px] font-bold opacity-60 uppercase mt-1">Graphico Global</p>
                </div>
             </div>
             <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6" /></svg>
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-gray-50/30 dark:bg-gray-900/30">
             {messages.length === 0 && (
                <div className="text-center py-20 opacity-30">
                   <p className="text-[10px] font-black uppercase tracking-widest">{language === 'EN' ? 'Type or Upload Memo' : 'টাইপ করুন বা মেমো আপলোড দিন'}</p>
                </div>
             )}
             {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] p-4 rounded-3xl text-[11px] font-bold leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 dark:text-gray-100 shadow-sm border dark:border-gray-600'}`}>
                      {m.text}
                      {m.data?.transactions?.map((tx: any, idx: number) => (
                         <div key={idx} className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-indigo-500/10">
                            <p className="text-[10px] font-black text-indigo-500">{tx.description}</p>
                            <p className="text-md font-black text-emerald-500">{user?.currency}{tx.amount}</p>
                            <button onClick={() => confirmEntry(tx)} className="w-full mt-2 py-2 bg-indigo-500 text-white rounded-lg text-[8px] font-black uppercase">Add Entry</button>
                         </div>
                      ))}
                   </div>
                </div>
             ))}
             {loading && <div className="text-[9px] font-black text-gray-400 uppercase animate-pulse">Thinking...</div>}
          </div>

          {imagePreview && (
             <div className="px-6 py-2 border-t dark:border-gray-700 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-indigo-500 shrink-0">
                   <img src={imagePreview} className="w-full h-full object-cover" />
                </div>
                <button onClick={() => setImagePreview(null)} className="text-[8px] font-black text-rose-500 uppercase">Remove</button>
             </div>
          )}

          <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex gap-2 items-center">
             <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-400 hover:text-indigo-500 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
             </button>
             <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
             <input 
               type="text" 
               value={input}
               onChange={e => setInput(e.target.value)}
               onKeyPress={e => e.key === 'Enter' && processAIRequest()}
               placeholder={language === 'EN' ? 'Ask or Type Memo...' : 'হিসাব লিখুন বা পরামর্শ চান...'} 
               className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 dark:border-gray-700 rounded-2xl outline-none font-bold text-xs focus:border-indigo-500 transition-all"
             />
             <button onClick={processAIRequest} disabled={loading} className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg active:scale-95 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
             </button>
          </div>
       </div>
    </div>
  );
};

export default AIConsultant;
