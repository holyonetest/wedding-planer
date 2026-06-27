import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Info } from 'lucide-react';

const CATEGORIES = [
  { id: 'banquet', name: 'Банкет', color: 'bg-rose-100 text-rose-900 border-rose-300' },
  { id: 'decor', name: 'Декор & Цветы', color: 'bg-purple-100 text-purple-900 border-purple-300' },
  { id: 'rings', name: 'Кольца', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  { id: 'attire', name: 'Образы (Платье & Костюм)', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
  { id: 'polygraphy', name: 'Полиграфия & Приглашения', color: 'bg-blue-100 text-blue-900 border-blue-300' },
  { id: 'logistics', name: 'Логистика & Отель', color: 'bg-teal-100 text-teal-900 border-teal-300' },
  { id: 'other', name: 'Разное', color: 'bg-slate-150 text-slate-900 border-slate-350' },
];

export default function BudgetTab({ expenses, setExpenses }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Format currency helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Calculate total budget
  const totalBudget = expenses.reduce((sum, item) => sum + item.amount, 0);

  // Add expense
  const handleAddExpense = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!name.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const newExpense = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      name: name.trim(),
      amount: parsedAmount,
      category,
    };

    setExpenses([newExpense, ...expenses]);
    setName('');
    setAmount('');
    setIsFormOpen(false);
  };

  // Delete expense
  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter((item) => item.id !== id));
  };

  // Group expenses by category
  const groupedExpenses = CATEGORIES.reduce((acc, cat) => {
    const catExpenses = expenses.filter((item) => item.category === cat.id);
    const catTotal = catExpenses.reduce((sum, item) => sum + item.amount, 0);
    if (catExpenses.length > 0) {
      acc.push({
        ...cat,
        items: catExpenses,
        total: catTotal,
      });
    }
    return acc;
  }, []);

  return (
    <div className="pb-24">
      {/* Total Budget Card - High Contrast Theme */}
      <div className="bg-wedding-burgundy-dark text-white rounded-3xl p-6 mb-6 text-center shadow-lg relative overflow-hidden border border-wedding-burgundy">
        {/* Decorative background overlays */}
        <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/5" />
        <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white/5" />
        
        <span className="text-[11px] uppercase font-bold tracking-widest text-wedding-rose/90 block mb-1">
          Итоговые затраты
        </span>
        <h2 className="text-3xl font-extrabold text-wedding-gold tracking-tight drop-shadow-sm">
          {formatCurrency(totalBudget)}
        </h2>
      </div>

      {/* Form Toggle Button */}
      <div className="mb-6">
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className={`w-full py-3 px-4 rounded-2xl flex items-center justify-center gap-2 border font-bold text-xs transition-all shadow-sm ${
            isFormOpen
              ? 'bg-wedding-champagne text-wedding-burgundy border-wedding-champagne-dark'
              : 'bg-wedding-burgundy text-white border-transparent hover:bg-wedding-burgundy-light'
          }`}
        >
          <Plus size={16} className={`transition-transform duration-200 ${isFormOpen ? 'rotate-45' : ''}`} />
          {isFormOpen ? 'Скрыть форму трат' : 'Добавить новый расход'}
        </button>

        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <form
                onSubmit={handleAddExpense}
                className="bg-white border-2 border-wedding-champagne-dark rounded-2xl p-4 mt-3 shadow-sm flex flex-col gap-3.5"
              >
                <div>
                  <label className="block text-[10px] font-bold text-wedding-burgundy-light uppercase tracking-wider mb-1">
                    Название траты *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Например: Обручальные кольца"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl glass-input placeholder-wedding-slate/60 focus:ring-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-wedding-burgundy-light uppercase tracking-wider mb-1">
                      Сумма (₽) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="50000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input placeholder-wedding-slate/60 focus:ring-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-wedding-burgundy-light uppercase tracking-wider mb-1">
                      Категория
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:ring-1 bg-white border border-wedding-champagne-dark"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-wedding-burgundy text-white hover:bg-wedding-burgundy-light font-bold text-xs rounded-xl transition-colors shadow-sm mt-1"
                >
                  Добавить в список
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Expenses grouped list */}
      <div className="flex flex-col gap-4">
        {groupedExpenses.length === 0 ? (
          <div className="bg-white border-2 border-wedding-champagne-dark rounded-3xl p-8 shadow-sm text-center text-wedding-slate/70 min-h-[200px] flex flex-col justify-center items-center">
            <Info size={24} className="text-wedding-champagne-dark mb-2" />
            <p className="text-sm font-semibold mb-1 text-wedding-burgundy-light">Расходов пока нет</p>
            <p className="text-[10px] leading-relaxed max-w-[200px]">
              Нажмите кнопку выше, чтобы зафиксировать первые свадебные затраты.
            </p>
          </div>
        ) : (
          groupedExpenses.map((catGroup) => (
            <div
              key={catGroup.id}
              className="bg-white border-2 border-wedding-champagne-dark rounded-3xl p-4 shadow-sm overflow-hidden"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between border-b-2 border-wedding-champagne-light pb-2.5 mb-2.5">
                <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-sm ${catGroup.color}`}>
                  {catGroup.name}
                </span>
                <span className="text-sm font-extrabold text-wedding-burgundy-dark">
                  {formatCurrency(catGroup.total)}
                </span>
              </div>

              {/* Items in category */}
              <ul className="divide-y divide-wedding-champagne-light/50">
                <AnimatePresence initial={false}>
                  {catGroup.items.map((item) => (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between py-2.5 text-xs"
                    >
                      <span className="text-slate-900 font-semibold truncate pr-4">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-extrabold text-wedding-burgundy-dark">
                          {formatCurrency(item.amount)}
                        </span>
                        <button
                          onClick={() => handleDeleteExpense(item.id)}
                          className="p-1 rounded-lg text-wedding-slate/40 hover:text-wedding-burgundy hover:bg-wedding-rose-light/50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
