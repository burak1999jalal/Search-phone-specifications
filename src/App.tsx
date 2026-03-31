/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Smartphone, Cpu, Battery, Camera, Monitor, 
  Calendar, Tag, CheckCircle2, XCircle, Loader2, 
  ExternalLink, Globe, Moon, Sun, ShieldCheck, Sparkles 
} from "lucide-react";
import React, { useState, useEffect } from "react";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface PhoneSpecs {
  name: string;
  brand: string;
  releaseDate: string;
  display: string;
  processor: string;
  ram: string;
  storage: string;
  mainCamera: string;
  selfieCamera: string;
  battery: string;
  os: string;
  price: string;
  pros: string[];
  cons: string[];
  summary: string;
}

interface GroundingSource {
  title: string;
  uri: string;
}

export default function App() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [specs, setSpecs] = useState<PhoneSpecs | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const searchPhone = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSpecs(null);
    setSources([]);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `ابحث عن مواصفات الهاتف التالي بدقة: ${query}. يرجى تقديم المعلومات باللغة العربية بشكل مفصل ومنظم.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              brand: { type: Type.STRING },
              releaseDate: { type: Type.STRING },
              display: { type: Type.STRING },
              processor: { type: Type.STRING },
              ram: { type: Type.STRING },
              storage: { type: Type.STRING },
              mainCamera: { type: Type.STRING },
              selfieCamera: { type: Type.STRING },
              battery: { type: Type.STRING },
              os: { type: Type.STRING },
              price: { type: Type.STRING },
              pros: { type: Type.ARRAY, items: { type: Type.STRING } },
              cons: { type: Type.ARRAY, items: { type: Type.STRING } },
              summary: { type: Type.STRING },
            },
            required: ["name", "brand", "summary"],
          },
        },
      });

      const text = response.text;
      if (text) {
        const parsedSpecs = JSON.parse(text) as PhoneSpecs;
        setSpecs(parsedSpecs);
      }

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const extractedSources = chunks
          .filter((chunk: any) => chunk.web)
          .map((chunk: any) => ({
            title: chunk.web.title,
            uri: chunk.web.uri,
          }));
        setSources(extractedSources);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("عذراً، حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#0F172A] text-slate-200' : 'bg-[#F8FAFC] text-slate-900'}`} dir="rtl">
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 10 }}
              className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20"
            >
              <Smartphone className="text-white w-7 h-7" />
            </motion.div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">باحث المواصفات</h1>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 opacity-80">بواسطة المبرمج بُراق</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl transition-all active:scale-90 ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
              <Sparkles className="w-3 h-3 text-blue-500" />
              ذكاء اصطناعي فائق
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 md:py-16">
        {/* Search Section */}
        <section className="mb-16 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-500 text-sm font-bold mb-6 border border-blue-500/20">
              <ShieldCheck className="w-4 h-4" />
              بيانات دقيقة ومحدثة
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
              اكتشف عالم <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">الهواتف الذكية</span>
            </h2>
            <p className={`mb-10 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              أدخل اسم أي هاتف وسنقوم بتحليل الويب لتقديم أدق المواصفات التقنية والمراجعات لك في ثوانٍ.
            </p>

            <form onSubmit={searchPhone} className="relative max-w-3xl mx-auto group">
              <div className={`absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-focus-within:duration-200`}></div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="مثال: iPhone 15 Pro Max أو Galaxy S24 Ultra"
                  className={`w-full h-16 pr-16 pl-40 rounded-[1.75rem] border-2 transition-all text-xl outline-none shadow-xl ${
                    darkMode 
                    ? 'bg-slate-900 border-slate-800 focus:border-blue-500 text-white placeholder:text-slate-600' 
                    : 'bg-white border-slate-100 focus:border-blue-500 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
                <Search className={`absolute right-6 text-slate-400 w-7 h-7 transition-colors group-focus-within:text-blue-500`} />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="absolute left-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white px-8 h-11 rounded-2xl font-black transition-all flex items-center gap-2 shadow-lg active:scale-95"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "حلل الآن"}
                </button>
              </div>
            </form>
          </motion.div>
        </section>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-24 gap-6"
            >
              <div className="relative">
                <div className="w-24 h-24 border-4 border-blue-500/10 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Smartphone className="text-blue-600 w-8 h-8 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-xl font-black mb-2">جاري استخراج البيانات...</p>
                <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>نقوم الآن بمسح قواعد البيانات العالمية وجوجل</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-2xl mx-auto p-5 rounded-3xl flex items-center gap-4 mb-10 border ${
              darkMode ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-100 text-red-600'
            }`}
          >
            <div className={`p-2 rounded-xl ${darkMode ? 'bg-red-500/20' : 'bg-red-100'}`}>
              <XCircle className="w-6 h-6" />
            </div>
            <p className="font-bold text-lg">{error}</p>
          </motion.div>
        )}

        {/* Results Section */}
        <AnimatePresence>
          {specs && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              {/* Hero Result Card */}
              <div className={`rounded-[2.5rem] overflow-hidden shadow-2xl border transition-colors duration-300 ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
              }`}>
                <div className="p-8 md:p-12">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-blue-500 font-black text-sm uppercase tracking-[0.2em]">
                        <Sparkles className="w-4 h-4" />
                        {specs.brand}
                      </div>
                      <h3 className="text-4xl md:text-6xl font-black tracking-tight">{specs.name}</h3>
                    </div>
                    <div className={`px-8 py-4 rounded-3xl font-black text-2xl border-2 shadow-inner ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-green-400' : 'bg-green-50 border-green-100 text-green-700'
                    }`}>
                      {specs.price || "السعر غير محدد"}
                    </div>
                  </div>

                  <div className={`relative p-8 rounded-[2rem] mb-12 border-r-8 border-blue-600 transition-colors duration-300 ${
                    darkMode ? 'bg-slate-800/50' : 'bg-slate-50'
                  }`}>
                    <p className="text-xl md:text-2xl leading-relaxed italic font-medium opacity-90">
                      "{specs.summary}"
                    </p>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <SpecCard icon={<Monitor />} label="الشاشة" value={specs.display} darkMode={darkMode} />
                    <SpecCard icon={<Cpu />} label="المعالج" value={specs.processor} darkMode={darkMode} />
                    <SpecCard icon={<Battery />} label="البطارية" value={specs.battery} darkMode={darkMode} />
                    <SpecCard icon={<Camera />} label="الكاميرا" value={specs.mainCamera} darkMode={darkMode} />
                    <SpecCard icon={<Smartphone />} label="الرام" value={specs.ram} darkMode={darkMode} />
                    <SpecCard icon={<Tag />} label="التخزين" value={specs.storage} darkMode={darkMode} />
                    <SpecCard icon={<Calendar />} label="الإصدار" value={specs.releaseDate} darkMode={darkMode} />
                    <SpecCard icon={<Globe />} label="النظام" value={specs.os} darkMode={darkMode} />
                  </div>
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className={`rounded-[2rem] p-8 shadow-xl border transition-colors duration-300 ${
                    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                  }`}
                >
                  <h4 className="text-2xl font-black mb-6 flex items-center gap-3 text-green-500">
                    <div className="p-2 bg-green-500/10 rounded-xl"><CheckCircle2 className="w-7 h-7" /></div>
                    لماذا تشتريه؟
                  </h4>
                  <ul className="space-y-4">
                    {specs.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-4 text-lg font-medium opacity-80">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-3 shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className={`rounded-[2rem] p-8 shadow-xl border transition-colors duration-300 ${
                    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                  }`}
                >
                  <h4 className="text-2xl font-black mb-6 flex items-center gap-3 text-red-500">
                    <div className="p-2 bg-red-500/10 rounded-xl"><XCircle className="w-7 h-7" /></div>
                    نقاط الضعف
                  </h4>
                  <ul className="space-y-4">
                    {specs.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-4 text-lg font-medium opacity-80">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-3 shrink-0 shadow-[0_0_8px_rgba(239,44,44,0.5)]" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>

              {/* Sources */}
              {sources.length > 0 && (
                <div className={`rounded-[2rem] p-8 shadow-xl border transition-colors duration-300 ${
                  darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
                }`}>
                  <h4 className="text-xl font-black mb-6 flex items-center gap-3">
                    <Globe className="w-6 h-6 text-blue-500" />
                    المصادر الموثوقة
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {sources.map((source, i) => (
                      <a
                        key={i}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group px-6 py-3 rounded-2xl text-sm font-bold border transition-all flex items-center gap-3 ${
                          darkMode 
                          ? 'bg-slate-800 border-slate-700 hover:border-blue-500 text-slate-300' 
                          : 'bg-slate-50 border-slate-200 hover:border-blue-500 text-slate-600'
                        }`}
                      >
                        <span className="truncate max-w-[200px]">{source.title}</span>
                        <ExternalLink className="w-4 h-4 group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-transform" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!specs && !loading && !error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="relative mb-8">
              <Smartphone className="w-32 h-32 stroke-[0.5]" />
              <Search className="absolute -bottom-2 -right-2 w-12 h-12 text-blue-500 stroke-[1.5]" />
            </div>
            <p className="text-2xl font-black tracking-tight">في انتظار اسم الهاتف...</p>
            <p className="mt-2 font-medium">أدخل اسم أي هاتف ذكي للبدء في التحليل</p>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className={`mt-20 border-t transition-colors duration-300 ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <Smartphone className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-black tracking-tight">باحث المواصفات</span>
              </div>
              <p className={`text-sm font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                أداة ذكية لتحليل مواصفات الهواتف باستخدام الذكاء الاصطناعي.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className={`px-6 py-3 rounded-2xl border-2 flex flex-col items-center transition-colors duration-300 ${
                darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>حقوق البرمجة</span>
                <span className="text-lg font-black text-blue-500">المبرمج بُراق</span>
                <span className="text-[10px] font-bold opacity-50">Programmer Buraq</span>
              </div>
              <div className="flex gap-4">
                {/* Social placeholders if needed */}
              </div>
            </div>
          </div>
          
          <div className={`mt-12 pt-8 border-t text-center text-xs font-bold uppercase tracking-widest ${darkMode ? 'border-slate-800 text-slate-600' : 'border-slate-100 text-slate-400'}`}>
            © {new Date().getFullYear()} جميع الحقوق محفوظة | تم التطوير بواسطة بُراق
          </div>
        </div>
      </footer>
    </div>
  );
}

function SpecCard({ icon, label, value, darkMode }: { icon: React.ReactNode; label: string; value: string; darkMode: boolean }) {
  return (
    <div className={`p-5 rounded-[1.75rem] border-2 transition-all group hover:scale-[1.02] ${
      darkMode 
      ? 'bg-slate-800/50 border-slate-800 hover:border-blue-500/50' 
      : 'bg-white border-slate-50 hover:border-blue-500/30 shadow-sm'
    }`}>
      <div className="text-blue-500 mb-3 group-hover:scale-110 transition-transform w-fit p-2 bg-blue-500/5 rounded-xl">
        {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
      </div>
      <div className={`text-[10px] font-black uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{label}</div>
      <div className="font-bold text-sm leading-tight line-clamp-2">{value || "غير متوفر"}</div>
    </div>
  );
}
