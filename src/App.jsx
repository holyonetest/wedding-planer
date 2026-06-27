import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Cloud, CloudOff, RefreshCw, AlertCircle, X } from 'lucide-react';
import { loadState, saveState } from './utils/localStorage';
import { supabase, isSupabaseConfigured } from './utils/supabaseClient';
import BottomNav from './components/BottomNav';
import GuestTab from './components/GuestTab';
import BudgetTab from './components/BudgetTab';

export default function App() {
  // Load initial cache from LocalStorage
  const [guests, setGuests] = useState(() => loadState('wedding_guests', []));
  const [expenses, setExpenses] = useState(() => loadState('wedding_expenses', []));
  const [activeTab, setActiveTab] = useState('guests');
  const [hearts, setHearts] = useState([]);
  
  // Sync status: 'offline', 'loading', 'online', 'error'
  const [syncStatus, setSyncStatus] = useState(() => isSupabaseConfigured() ? 'loading' : 'offline');
  const [dbErrorMessage, setDbErrorMessage] = useState(null);

  // Keep references to prevent sync cycles
  const isSyncingFromDb = useRef(false);

  // Generate floating background hearts on mount
  useEffect(() => {
    const generatedHearts = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 90 + 5}%`,
      delay: `${Math.random() * 10}s`,
      size: `${Math.random() * 12 + 8}px`,
      xOffset: `${Math.random() * 60 - 30}px`,
      rot: `${Math.random() * 90 - 45}deg`,
      duration: `${Math.random() * 6 + 9}s`,
    }));
    setHearts(generatedHearts);
  }, []);

  // Fetch all data from Supabase
  const fetchData = async () => {
    if (!isSupabaseConfigured()) {
      setSyncStatus('offline');
      return;
    }

    try {
      setSyncStatus('loading');
      isSyncingFromDb.current = true;
      setDbErrorMessage(null);

      // Fetch guests
      const { data: dbGuests, error: guestsError } = await supabase
        .from('wedding_guests')
        .select('*')
        .order('created_at', { ascending: false });

      if (guestsError) throw guestsError;

      // Fetch expenses
      const { data: dbExpenses, error: expensesError } = await supabase
        .from('wedding_expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (expensesError) throw expensesError;

      // Map DB formats to React state format
      const formattedGuests = dbGuests.map(g => ({
        id: g.id,
        name: g.name,
        side: g.side,
        role: g.role || '',
        attending: g.attending,
      }));

      const formattedExpenses = dbExpenses.map(e => ({
        id: e.id,
        name: e.name,
        amount: Number(e.amount),
        category: e.category,
      }));

      setGuests(formattedGuests);
      setExpenses(formattedExpenses);
      saveState('wedding_guests', formattedGuests);
      saveState('wedding_expenses', formattedExpenses);
      
      setSyncStatus('online');
    } catch (err) {
      console.error('Error fetching data from Supabase:', err);
      setSyncStatus('error');
      setDbErrorMessage(err.message || 'Не удалось загрузить данные из базы');
    } finally {
      isSyncingFromDb.current = false;
    }
  };

  // Initial load and Realtime setup
  useEffect(() => {
    fetchData();

    if (!isSupabaseConfigured()) return;

    // Listen to real-time changes in guests
    const guestsSubscription = supabase
      .channel('public:wedding_guests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wedding_guests' }, () => {
        if (!isSyncingFromDb.current) {
          fetchData();
        }
      })
      .subscribe();

    // Listen to real-time changes in expenses
    const expensesSubscription = supabase
      .channel('public:wedding_expenses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wedding_expenses' }, () => {
        if (!isSyncingFromDb.current) {
          fetchData();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(guestsSubscription);
      supabase.removeChannel(expensesSubscription);
    };
  }, []);

  // Sync state changes to Supabase (Wrapper State Setters)
  const handleSetGuests = async (newGuests) => {
    const oldGuests = [...guests];
    setGuests(newGuests);
    saveState('wedding_guests', newGuests);

    if (!isSupabaseConfigured()) return;

    try {
      setDbErrorMessage(null);
      // 1. Find deleted guests
      const deletedIds = oldGuests
        .filter(og => !newGuests.some(ng => ng.id === og.id))
        .map(og => og.id);
      
      if (deletedIds.length > 0) {
        const { error: delError } = await supabase.from('wedding_guests').delete().in('id', deletedIds);
        if (delError) throw delError;
      }

      // 2. Upsert added/updated guests
      const upsertData = newGuests.map(g => ({
        id: g.id,
        name: g.name,
        side: g.side,
        role: g.role || '',
        attending: g.attending,
      }));

      if (upsertData.length > 0) {
        const { error } = await supabase.from('wedding_guests').upsert(upsertData);
        if (error) throw error;
      }
      setSyncStatus('online');
    } catch (err) {
      console.error('Error syncing guests to database:', err);
      setSyncStatus('error');
      setDbErrorMessage(err.message || 'Ошибка сохранения гостей в БД');
    }
  };

  const handleSetExpenses = async (newExpenses) => {
    const oldExpenses = [...expenses];
    setExpenses(newExpenses);
    saveState('wedding_expenses', newExpenses);

    if (!isSupabaseConfigured()) return;

    try {
      setDbErrorMessage(null);
      // 1. Find deleted expenses
      const deletedIds = oldExpenses
        .filter(oe => !newExpenses.some(ne => ne.id === oe.id))
        .map(oe => oe.id);
      
      if (deletedIds.length > 0) {
        const { error: delError } = await supabase.from('wedding_expenses').delete().in('id', deletedIds);
        if (delError) throw delError;
      }

      // 2. Upsert added/updated expenses
      const upsertData = newExpenses.map(e => ({
        id: e.id,
        name: e.name,
        amount: e.amount,
        category: e.category,
      }));

      if (upsertData.length > 0) {
        const { error } = await supabase.from('wedding_expenses').upsert(upsertData);
        if (error) throw error;
      }
      setSyncStatus('online');
    } catch (err) {
      console.error('Error syncing expenses to database:', err);
      setSyncStatus('error');
      setDbErrorMessage(err.message || 'Ошибка сохранения расходов в БД');
    }
  };

  // Pluralization for countdown
  const getCountdown = () => {
    const weddingDate = new Date('2026-08-07T00:00:00');
    const today = new Date();
    
    const d1 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const d2 = Date.UTC(weddingDate.getFullYear(), weddingDate.getMonth(), weddingDate.getDate());
    
    const diffTime = d2 - d1;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Свадьба состоялась! 🎉';
    } else if (diffDays === 0) {
      return 'Сегодня день свадьбы! 💕💍';
    } else {
      const getDaysPlural = (n) => {
        const lastDigit = n % 10;
        const lastTwo = n % 100;
        if (lastTwo >= 11 && lastTwo <= 19) return 'дней';
        if (lastDigit === 1) return 'день';
        if (lastDigit >= 2 && lastDigit <= 4) return 'дня';
        return 'дней';
      };
      return `Остался ${diffDays} ${getDaysPlural(diffDays)} ✨`;
    }
  };

  // Render cloud sync icon based on current sync state
  const renderSyncStatus = () => {
    switch (syncStatus) {
      case 'online':
        return (
          <div className="flex items-center text-emerald-600 gap-1 text-[9px] font-bold" title="Синхронизировано с базой данных">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping absolute" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 relative" />
            <Cloud size={14} className="stroke-[2.5]" />
          </div>
        );
      case 'loading':
        return (
          <div className="text-amber-500 flex items-center gap-1 text-[9px] font-bold" title="Синхронизация...">
            <RefreshCw size={12} className="animate-spin stroke-[2.5]" />
          </div>
        );
      case 'error':
        return (
          <button onClick={fetchData} className="text-rose-500 flex items-center gap-1 text-[9px] font-bold" title="Ошибка подключения. Нажмите для повтора">
            <AlertCircle size={14} className="stroke-[2.5] animate-bounce" />
          </button>
        );
      case 'offline':
      default:
        return (
          <div className="text-slate-400 flex items-center gap-1 text-[9px] font-bold" title="Локальный режим (Supabase не настроен)">
            <CloudOff size={14} className="stroke-[2.5]" />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-slate-50/70 shadow-2xl relative flex flex-col font-sans wedding-gradient border-x border-wedding-champagne-dark/40 overflow-hidden">
      
      {/* Animated Floating Hearts Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {hearts.map((heart) => (
          <div
            key={heart.id}
            className="floating-heart"
            style={{
              left: heart.left,
              animationDelay: heart.delay,
              animationDuration: heart.duration,
              '--x-offset': heart.xOffset,
              '--rot': heart.rot,
            }}
          >
            <Heart style={{ width: heart.size, height: heart.size }} className="fill-wedding-rose/30 stroke-wedding-rose-dark/40" />
          </div>
        ))}
      </div>

      {/* Premium Wedding Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-wedding-champagne py-4 px-6 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col items-center">
        {/* Top bar with sync icon */}
        <div className="w-full flex justify-between items-center relative mb-0.5">
          <div className="w-5" /> {/* spacer */}
          <div className="flex items-center gap-2">
            <Heart size={14} className="text-wedding-burgundy fill-wedding-rose-dark/30 animate-pulse" />
          </div>
          <div className="w-5 flex justify-end">
            {renderSyncStatus()}
          </div>
        </div>

        <h1 className="font-serif text-2xl font-bold tracking-wide text-wedding-burgundy">
          Екатерина & Александр
        </h1>
        <p className="text-[10px] uppercase font-bold tracking-widest text-wedding-gold-dark mt-0.5">
          Свадьба • 7 августа 2026
        </p>
        
        {/* Countdown Badge */}
        <div className="inline-block mt-2 bg-wedding-champagne-light border border-wedding-champagne px-3.5 py-1 rounded-full shadow-sm">
          <span className="text-xs font-semibold text-wedding-burgundy-light">
            {getCountdown()}
          </span>
        </div>
      </header>

      {/* Database Error Banner */}
      <AnimatePresence>
        {dbErrorMessage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-rose-50 border-b border-rose-200 px-4 py-2 flex items-center justify-between text-xs text-rose-700 font-medium z-20 relative"
          >
            <div className="flex items-center gap-2 pr-4">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{dbErrorMessage}</span>
            </div>
            <button onClick={() => setDbErrorMessage(null)} className="p-0.5 hover:bg-rose-100 rounded text-rose-500">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Tab Panel Content */}
      <main className="flex-grow px-4 pt-6 pb-24 overflow-y-auto relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'guests' ? (
              <GuestTab guests={guests} setGuests={handleSetGuests} />
            ) : (
              <BudgetTab expenses={expenses} setExpenses={handleSetExpenses} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
