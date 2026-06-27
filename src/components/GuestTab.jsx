import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, Trash2, Upload, X, Check, Clock } from 'lucide-react';

const TABLES_LIST = [
  { id: 'presidium', name: 'Президиум' },
  { id: 'top_left', name: 'Вверху слева' },
  { id: 'cabin_bottom_left', name: 'Кабинка внизу' },
  { id: 'table_2', name: 'Стол №2' },
  { id: 'table_4', name: 'Стол №4' },
  { id: 'table_6', name: 'Стол №6' },
  { id: 'table_1', name: 'Стол №1' },
  { id: 'table_3', name: 'Стол №3' },
  { id: 'table_5', name: 'Стол №5' },
  { id: 'cabin_top_right', name: 'Кабинка вверху' },
  { id: 'bottom_center_1', name: 'Внизу левый' },
  { id: 'bottom_center_2', name: 'Внизу правый' },
];

export default function GuestTab({ guests, setGuests }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestSide, setNewGuestSide] = useState('katya'); // 'katya' or 'sasha'
  const [newGuestRole, setNewGuestRole] = useState('');
  const [newGuestInviteType, setNewGuestInviteType] = useState('registry'); // 'registry' or 'banquet'
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [sideFilter, setSideFilter] = useState('all'); // 'all', 'katya', 'sasha'

  // Calculate statistics
  const totalGuests = guests.length;
  const attendingGuests = guests.filter((g) => g.attending).length;
  const undecidedGuests = totalGuests - attendingGuests;

  const countKatya = guests.filter(g => g.side === 'katya').length;
  const countSasha = guests.filter(g => g.side === 'sasha').length;

  // Venue-specific counts (only count attending guests)
  const attendingRegistry = guests.filter(g => g.attending && g.inviteType === 'registry').length;
  const attendingBanquetOnly = guests.filter(g => g.attending && g.inviteType === 'banquet').length;
  const totalBanquet = attendingGuests; // everyone who is attending goes to the banquet

  // Add guest explicitly
  const handleAddGuest = (e) => {
    if (e) e.preventDefault();
    if (!newGuestName.trim()) return;

    const newGuest = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      name: newGuestName.trim(),
      side: newGuestSide,
      role: newGuestRole.trim(),
      inviteType: newGuestInviteType,
      attending: false,
      tableId: null,
    };

    setGuests([newGuest, ...guests]);
    setNewGuestName('');
    setNewGuestRole('');
    setNewGuestInviteType('registry');
    setIsFormOpen(false);
  };

  // Toggle attending status
  const handleToggleGuest = (id) => {
    setGuests(
      guests.map((g) => (g.id === id ? { ...g, attending: !g.attending } : g))
    );
  };

  // Toggle invite type (ЗАГС <-> Банкет)
  const handleToggleInviteType = (e, id) => {
    e.stopPropagation();
    setGuests(
      guests.map((g) => (g.id === id ? { ...g, inviteType: g.inviteType === 'registry' ? 'banquet' : 'registry' } : g))
    );
  };

  // Toggle guest side (Катя <-> Саша)
  const handleToggleSide = (e, id) => {
    e.stopPropagation();
    setGuests(
      guests.map((g) => (g.id === id ? { ...g, side: g.side === 'katya' ? 'sasha' : 'katya' } : g))
    );
  };

  // Delete guest
  const handleDeleteGuest = (id) => {
    setGuests(guests.filter((g) => g.id !== id));
  };

  // Get table name helper
  const getTableLabel = (tableId) => {
    if (!tableId) return null;
    const table = TABLES_LIST.find((t) => t.id === tableId);
    return table ? table.name : null;
  };

  // Parse bulk text import
  const handleBulkImport = () => {
    if (!importText.trim()) return;
    
    const rawLines = importText.split('\n');
    const newGuestsList = [];

    rawLines.forEach((line) => {
      let cleanedLine = line.trim();
      if (!cleanedLine) return;
      
      // Clean prefixes like numbers (e.g. "1. ", "1)", "- ")
      cleanedLine = cleanedLine.replace(/^[\d+\.\-\*\)\s]+/g, '').trim();

      if (cleanedLine.length > 0) {
        let name = cleanedLine;
        let side = 'katya';
        let role = '';
        let inviteType = 'registry';

        if (cleanedLine.includes('-') || cleanedLine.includes('|') || cleanedLine.includes(';')) {
          const parts = cleanedLine.split(/[\-\|;]+/).map(p => p.trim());
          name = parts[0];
          
          if (parts[1]) {
            const sideWord = parts[1].toLowerCase();
            if (sideWord.includes('саш') || sideWord.includes('алекс') || sideWord.includes('sasha')) {
              side = 'sasha';
            } else {
              side = 'katya';
            }
          }
          
          if (parts[2]) {
            role = parts[2];
            
            // Auto-detect invitation type from role text
            const roleLower = role.toLowerCase();
            if (roleLower.includes('банкет') || roleLower.includes('15:00') || roleLower.includes('15 ')) {
              inviteType = 'banquet';
            }
          }
        }

        newGuestsList.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5) + newGuestsList.length,
          name,
          side,
          role,
          inviteType,
          attending: false,
          tableId: null,
        });
      }
    });

    if (newGuestsList.length > 0) {
      setGuests([...guests, ...newGuestsList]);
    }
    
    setImportText('');
    setShowImportModal(false);
  };

  // Filter guests
  const filteredGuests = guests.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (g.role && g.role.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSide = sideFilter === 'all' || g.side === sideFilter;

    return matchesSearch && matchesSide;
  });

  return (
    <div className="pb-24">
      {/* Top Statistics Panel */}
      <div className="bg-white border-2 border-wedding-champagne-dark rounded-3xl p-4 shadow-sm mb-6 flex flex-col gap-3">
        {/* Main counts */}
        <div className="grid grid-cols-3 gap-2 border-b border-wedding-champagne-light pb-3">
          <div className="text-center">
            <div className="text-[9px] uppercase font-bold text-wedding-slate tracking-wider">Всего</div>
            <div className="text-xl font-extrabold text-wedding-burgundy mt-0.5">{totalGuests}</div>
          </div>
          <div className="text-center border-x border-wedding-champagne-light">
            <div className="text-[9px] uppercase font-bold text-wedding-rose-dark tracking-wider">Придут</div>
            <div className="text-xl font-extrabold text-wedding-burgundy mt-0.5">{attendingGuests}</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] uppercase font-bold text-wedding-gold-dark tracking-wider">Думают</div>
            <div className="text-xl font-extrabold text-wedding-burgundy mt-0.5">{undecidedGuests}</div>
          </div>
        </div>

        {/* Venue/Timeline Details breakdown */}
        <div className="grid grid-cols-2 gap-2 text-[10px] text-wedding-slate-dark font-medium">
          <div className="flex items-center gap-1.5 bg-purple-50/50 border border-purple-100 rounded-xl px-2.5 py-1.5">
            <span className="text-purple-600 font-bold">🏛️ ЗАГС (13:00):</span>
            <span className="font-extrabold text-wedding-burgundy">{attendingRegistry} чел.</span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-50/50 border border-blue-100 rounded-xl px-2.5 py-1.5">
            <span className="text-blue-600 font-bold">🍽️ Банкет (15:00):</span>
            <span className="font-extrabold text-wedding-burgundy">{totalBanquet} чел.</span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Add Guest & Bulk Import */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setIsFormOpen(!isFormOpen)}
          className={`flex-grow py-3 px-4 rounded-2xl flex items-center justify-center gap-2 border font-bold text-xs transition-all shadow-sm ${
            isFormOpen
              ? 'bg-wedding-champagne text-wedding-burgundy border-wedding-champagne-dark'
              : 'bg-wedding-burgundy text-white border-transparent hover:bg-wedding-burgundy-light'
          }`}
        >
          <UserPlus size={16} />
          {isFormOpen ? 'Скрыть форму' : 'Добавить гостя'}
        </button>
        <button
          type="button"
          onClick={() => setShowImportModal(true)}
          className="flex items-center justify-center px-4 rounded-2xl border-2 border-wedding-champagne bg-white text-wedding-burgundy font-bold text-xs hover:bg-wedding-rose-light/50 transition-colors shadow-sm"
          title="Быстрый импорт"
        >
          <Upload size={16} className="mr-1.5" />
          Импорт
        </button>
      </div>

      {/* Expandable Manual Form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden mb-6"
          >
            <form
              onSubmit={handleAddGuest}
              className="bg-white border-2 border-wedding-champagne-dark rounded-2xl p-4 shadow-sm flex flex-col gap-3.5"
            >
              <div>
                <label className="block text-[10px] font-bold text-wedding-burgundy-light uppercase tracking-wider mb-1">
                  ФИО Гостя *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Дмитрий Иванов"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input placeholder-wedding-slate/60 focus:ring-1"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-wedding-burgundy-light uppercase tracking-wider mb-1">
                  Сторона приглашения
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewGuestSide('katya')}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      newGuestSide === 'katya'
                        ? 'bg-wedding-rose text-wedding-burgundy border-wedding-rose-dark'
                        : 'bg-white text-wedding-slate border-wedding-champagne-dark hover:bg-wedding-champagne-light'
                    }`}
                  >
                    Екатерина
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewGuestSide('sasha')}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      newGuestSide === 'sasha'
                        ? 'bg-wedding-gold-light border-wedding-gold/60 text-wedding-burgundy-dark'
                        : 'bg-white text-wedding-slate border-wedding-champagne-dark hover:bg-wedding-champagne-light'
                    }`}
                  >
                    Александр
                  </button>
                </div>
              </div>

              {/* Invite Venue Type */}
              <div>
                <label className="block text-[10px] font-bold text-wedding-burgundy-light uppercase tracking-wider mb-1">
                  Куда приглашен (Время)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewGuestInviteType('registry')}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      newGuestInviteType === 'registry'
                        ? 'bg-wedding-rose text-wedding-burgundy border-wedding-rose-dark'
                        : 'bg-white text-wedding-slate border-wedding-champagne-dark hover:bg-wedding-champagne-light'
                    }`}
                  >
                    ЗАГС (13:00)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewGuestInviteType('banquet')}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      newGuestInviteType === 'banquet'
                        ? 'bg-wedding-gold-light border-wedding-gold/60 text-wedding-burgundy-dark'
                        : 'bg-white text-wedding-slate border-wedding-champagne-dark hover:bg-wedding-champagne-light'
                    }`}
                  >
                    Только Банкет (15:00)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-wedding-burgundy-light uppercase tracking-wider mb-1">
                  Кем является (Роль / Описание)
                </label>
                <input
                  type="text"
                  placeholder="Например: Брат жениха, подруга невесты"
                  value={newGuestRole}
                  onChange={(e) => setNewGuestRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input placeholder-wedding-slate/60 focus:ring-1"
                />
              </div>

              <button
                type="button"
                onClick={handleAddGuest}
                className="w-full py-2.5 bg-wedding-burgundy text-white hover:bg-wedding-burgundy-light font-bold text-xs rounded-xl transition-colors shadow-sm mt-1"
              >
                Сохранить гостя
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Tabs Filters */}
      <div className="flex bg-white/80 backdrop-blur-sm border-2 border-wedding-champagne-dark/60 rounded-2xl p-1 mb-4 shadow-sm">
        <button
          onClick={() => setSideFilter('all')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            sideFilter === 'all'
              ? 'bg-wedding-burgundy text-white shadow-sm'
              : 'text-wedding-slate hover:bg-wedding-champagne-light/50'
          }`}
        >
          Все ({totalGuests})
        </button>
        <button
          onClick={() => setSideFilter('katya')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            sideFilter === 'katya'
              ? 'bg-wedding-rose text-wedding-burgundy shadow-sm border border-wedding-rose-dark/30'
              : 'text-wedding-slate hover:bg-wedding-champagne-light/50'
          }`}
        >
          Катя ({countKatya})
        </button>
        <button
          onClick={() => setSideFilter('sasha')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            sideFilter === 'sasha'
              ? 'bg-wedding-gold-light text-wedding-burgundy shadow-sm border border-wedding-gold/40'
              : 'text-wedding-slate hover:bg-wedding-champagne-light/50'
          }`}
        >
          Саша ({countSasha})
        </button>
      </div>

      {/* Search Input */}
      {guests.length > 0 && (
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Поиск по имени или роли..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input placeholder-wedding-slate/60 focus:ring-1"
          />
          <Search size={14} className="absolute left-3.5 top-3.5 text-wedding-slate/70" />
        </div>
      )}

      {/* Guest List Grid/Table Layout */}
      <div className="bg-white border-2 border-wedding-champagne-dark rounded-3xl shadow-sm p-4 min-h-[300px] z-10 relative">
        {filteredGuests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-wedding-slate/70">
            <p className="text-sm font-semibold mb-1 text-wedding-burgundy-light">Гостей не найдено</p>
            <p className="text-[10px] text-center max-w-[200px] leading-relaxed">
              {searchQuery || sideFilter !== 'all' 
                ? 'Попробуйте изменить параметры поиска или фильтры.' 
                : 'Список пуст. Нажмите кнопку "Добавить гостя", чтобы начать.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-wedding-champagne pb-2">
                  <th className="py-2 text-[10px] uppercase font-bold text-wedding-slate tracking-wider w-8"></th>
                  <th className="py-2 text-[10px] uppercase font-bold text-wedding-slate tracking-wider">Гость</th>
                  <th className="py-2 text-[10px] uppercase font-bold text-wedding-slate tracking-wider text-right">Сторона</th>
                  <th className="py-2 text-[10px] uppercase font-bold text-wedding-slate tracking-wider w-8 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wedding-champagne-light">
                <AnimatePresence initial={false}>
                  {filteredGuests.map((guest) => (
                    <motion.tr
                      key={guest.id}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-slate-50/50"
                    >
                      {/* Checkbox column */}
                      <td className="py-3">
                        <div
                          onClick={() => handleToggleGuest(guest.id)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all ${
                            guest.attending
                              ? 'bg-wedding-rose border-wedding-rose-dark text-wedding-burgundy'
                              : 'border-wedding-champagne-dark bg-white'
                          }`}
                        >
                          {guest.attending && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                            >
                              <Check size={14} strokeWidth={3} />
                            </motion.div>
                          )}
                        </div>
                      </td>

                      {/* Name & Role & Seating details */}
                      <td className="py-3 pr-2 cursor-pointer" onClick={() => handleToggleGuest(guest.id)}>
                        <div className="flex flex-col items-start">
                          <span
                            className={`text-sm font-semibold transition-all leading-tight ${
                              guest.attending
                                ? 'text-wedding-slate line-through opacity-50'
                                : 'text-wedding-burgundy-dark'
                            }`}
                          >
                            {guest.name}
                          </span>
                          
                          {/* Role tag */}
                          {guest.role && (
                            <span className="text-[10px] text-wedding-slate mt-0.5 leading-tight italic">
                              {guest.role}
                            </span>
                          )}

                          {/* Seating Table and Invite Type tags */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {guest.tableId && (
                              <span className="inline-block text-[8px] font-extrabold px-1.5 py-0.5 bg-wedding-champagne border border-wedding-champagne-dark/40 text-wedding-burgundy rounded shadow-xs leading-none">
                                📍 {getTableLabel(guest.tableId)}
                              </span>
                            )}
                            <span 
                              onClick={(e) => handleToggleInviteType(e, guest.id)}
                              className={`inline-block text-[8px] font-extrabold px-1.5 py-0.5 rounded border leading-none cursor-pointer hover:scale-102 active:scale-98 transition-transform select-none ${
                                guest.inviteType === 'registry'
                                  ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                                  : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                              }`}
                              title="Нажмите, чтобы изменить место"
                            >
                              {guest.inviteType === 'registry' ? '🏛️ 13:00 ЗАГС' : '🍽️ 15:00 Банкет'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Side column */}
                      <td className="py-3 text-right">
                        <span
                          onClick={(e) => handleToggleSide(e, guest.id)}
                          className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border cursor-pointer hover:scale-102 active:scale-98 transition-transform select-none ${
                            guest.side === 'katya'
                              ? 'bg-wedding-rose/70 border-wedding-rose-dark/30 text-wedding-burgundy-light hover:bg-wedding-rose'
                              : 'bg-wedding-gold-light/60 border-wedding-gold/30 text-wedding-burgundy-dark hover:bg-wedding-gold-light'
                          }`}
                          title="Нажмите, чтобы изменить сторону"
                        >
                          {guest.side === 'katya' ? 'Катя' : 'Саша'}
                        </span>
                      </td>

                      {/* Delete column */}
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteGuest(guest.id)}
                          className="p-1 rounded-lg text-wedding-slate/40 hover:text-wedding-burgundy hover:bg-wedding-rose-light/50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bulk Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-wedding-slate-dark/40 backdrop-blur-sm"
              onClick={() => setShowImportModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-5 w-full max-w-sm border border-wedding-champagne shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-serif text-lg font-bold text-wedding-burgundy">Импорт гостей</h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-1 rounded-full hover:bg-wedding-champagne-light text-wedding-slate/60"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="text-[10px] text-wedding-slate mb-3 leading-relaxed">
                <p className="font-bold mb-1">Вы можете вставить список в двух форматах:</p>
                <ul className="list-disc pl-3.5 space-y-1">
                  <li>Просто имена гостей (по одному на строку).</li>
                  <li>Формат: <code className="bg-slate-100 p-0.5 rounded">Имя - Сторона - Роль</code></li>
                </ul>
                <p className="mt-2 italic text-wedding-burgundy-light">Например: Дмитрий Иванов - Саша - Брат Саши (будет приглашен в ЗАГС по умолчанию, если в роли указать "банкет" - запишется на банкет)</p>
              </div>

              <textarea
                rows={6}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Иван Смирнов - Катя - Друг невесты&#10;Дмитрий Петров - Саша - Брат Саши (банкет)&#10;Елена Сидорова"
                className="w-full p-3 rounded-2xl border border-wedding-champagne-dark focus:ring-1 focus:ring-wedding-rose-dark outline-none text-xs placeholder-wedding-slate/50 resize-none mb-4"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-wedding-champagne-dark text-wedding-slate font-semibold text-xs hover:bg-wedding-champagne-light transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleBulkImport}
                  className="flex-grow py-2.5 rounded-xl bg-wedding-burgundy text-white font-semibold text-xs hover:bg-wedding-burgundy-light transition-colors shadow-sm"
                >
                  Импортировать
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
