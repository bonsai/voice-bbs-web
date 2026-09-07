"use client";
import { useEffect, useState } from "react";
import { api, type Category, type Thread } from "@/lib/api";
import CategoryTabs from "@/components/CategoryTabs";
import BubbleField from "@/components/BubbleField";
import ThreadModal from "@/components/ThreadModal";
import ApiStatus from "@/components/ApiStatus";

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      const [catRes, threadRes] = await Promise.all([api.categories(), api.threads({ category: activeCategory || undefined, limit: 50 })]);
      setCategories(catRes.categories); setThreads(threadRes.threads);
      if (!newCategory && catRes.categories.length) setNewCategory(catRes.categories[0].id);
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  };
  useEffect(() => { void load(); }, [activeCategory]);

  const createThread = async () => {
    if (!newCategory) return;
    try {
      const res = await api.createThread({ category_id: newCategory, title: newTitle || undefined });
      setShowNew(false); setNewTitle(""); await load();
      setSelectedThread(threads.find((x) => x.id === res.id) ?? { id: res.id, category_id: newCategory, title: newTitle || null, created_at: Math.floor(Date.now() / 1000) });
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  };

  return <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
    <header className="flex items-start justify-between px-4 pt-6 pb-2"><div><h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">Voice BBS</h1><p className="text-white/50 text-sm mt-1">シャボン玉に声をのせて</p></div><ApiStatus /></header>
    <CategoryTabs categories={categories} active={activeCategory} onChange={setActiveCategory} />
    {error && <p role="alert" className="mx-4 mt-3 rounded-lg bg-red-950/40 px-3 py-2 text-sm text-red-300">APIエラー: {error}</p>}
    <BubbleField threads={threads} onSelect={setSelectedThread} />
    <div className="fixed bottom-6 right-6 z-40"><button onClick={() => setShowNew(true)} className="w-14 h-14 rounded-full bg-pink-500 hover:bg-pink-400 text-white text-2xl shadow-lg flex items-center justify-center transition">＋</button></div>
    {selectedThread && <ThreadModal thread={selectedThread} onClose={() => setSelectedThread(null)} onUpdate={load} />}
    {showNew && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"><div className="w-full max-w-sm bg-slate-900 rounded-2xl border border-white/10 p-6 space-y-4"><h3 className="text-white font-semibold">新規スレッド</h3><div className="flex flex-wrap gap-2">{categories.map((c) => <button key={c.id} onClick={() => setNewCategory(c.id)} className="px-3 py-1 rounded-full text-sm" style={{ background: newCategory === c.id ? c.color : `${c.color}33`, color: newCategory === c.id ? "#fff" : c.color }}>{c.name}</button>)}</div><input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="タイトル（任意）" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none" /><div className="flex justify-end gap-2"><button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-white/60">キャンセル</button><button onClick={createThread} className="px-4 py-2 rounded-lg bg-pink-500 text-white text-sm font-medium">開始</button></div></div></div>}
  </main>;
}
