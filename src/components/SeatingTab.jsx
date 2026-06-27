import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Armchair, UserPlus, X, Search, Info, HelpCircle } from 'lucide-react';

const TABLES = [
  { id: 'presidium', name: 'Президиум', max: 2, type: 'rect', label: 'Президиум (Катя & Саша)', top: '38%', left: '4%', w: '14%', h: '12%', shape: 'rounded-lg' },
  { id: 'top_left', name: 'Вверху слева', max: 8, type: 'rect', label: 'Верхний левый стол', top: '14%', left: '4%', w: '14%', h: '18%', shape: 'rounded-xl' },
  { id: 'cabin_bottom_left', name: 'Кабинка внизу', max: 8, type: 'rect', label: 'Кабинка внизу слева', top: '56%', left: '4%', w: '18%', h: '18%', shape: 'rounded-xl' },
  
  { id: 'table_2', name: 'Стол №2', max: 9, type: 'round', label: 'Круглый стол №2', top: '30%', left: '26%', w: '16%', h: '13%', shape: 'rounded-full' },
  { id: 'table_4', name: 'Стол №4', max: 9, type: 'round', label: 'Круглый стол №4', top: '30%', left: '44%', w: '16%', h: '13%', shape: 'rounded-full' },
  { id: 'table_6', name: 'Стол №6', max: 9, type: 'round', label: 'Круглый стол №6', top: '30%', left: '62%', w: '16%', h: '13%', shape: 'rounded-full' },
  
  { id: 'table_1', name: 'Стол №1', max: 9, type: 'round', label: 'Круглый стол №1', top: '48%', left: '27%', w: '16%', h: '13%', shape: 'rounded-full' },
  { id: 'table_3', name: 'Стол №3', max: 9, type: 'round', label: 'Круглый стол №3', top: '48%', left: '45%', w: '16%', h: '13%', shape: 'rounded-full' },
  { id: 'table_5', name: 'Стол №5', max: 9, type: 'round', label: 'Круглый стол №5', top: '48%', left: '63%', w: '16%', h: '13%', shape: 'rounded-full' },
  
  { id: 'cabin_top_right', name: 'Кабинка вверху', max: 6, type: 'rect', label: 'Кабинка вверху справа', top: '10%', right: '4%', w: '14%', h: '18%', shape: 'rounded-xl' },
  
  { id: 'bottom_center_1', name: 'Внизу левый', max: 9, type: 'rect', label: 'Нижний стол левый', bottom: '12%', left: '28%', w: '20%', h: '8%', shape: 'rounded-lg' },
  { id: 'bottom_center_2', name: 'Внизу правый', max: 9, type: 'rect', label: 'Нижний стол правый', bottom: '12%', left: '52%', w: '20%', h: '8%', shape: 'rounded-lg' },
];

export default function SeatingTab({ guests, setGuests }) {
  const [selectedTableId, setSelectedTableId] = useState(TABLES[0].id);
  const [unseatedSearch, setUnseatedSearch] = useState('');
  const [filterAttendingOnly, setFilterAttendingOnly] = useState(true);
  const [filterSide, setFilterSide] = useState('all'); // 'all', 'katya', 'sasha'

  // Get table properties
  const selectedTable = TABLES.find((t) => t.id === selectedTableId);

  // Filter guests seated at the selected table
  const seatedGuests = guests.filter((g) => g.tableId === selectedTableId);
  const seatedCount = seatedGuests.length;

  // Filter unseated guests
  const unseatedGuests = guests.filter((g) => {
    const isUnseated = !g.tableId;
    const matchesSearch = g.name.toLowerCase().includes(unseatedSearch.toLowerCase()) || 
                          (g.role && g.role.toLowerCase().includes(unseatedSearch.toLowerCase()));
    const matchesAttending = !filterAttendingOnly || g.attending;
    const matchesSide = filterSide === 'all' || g.side === filterSide;

    return isUnseated && matchesSearch && matchesAttending && matchesSide;
  });

  // Seat a guest at the selected table
  const handleSeatGuest = (guestId) => {
    if (!selectedTableId || seatedCount >= selectedTable.max) return;
    setGuests(
      guests.map((g) => (g.id === guestId ? { ...g, tableId: selectedTableId } : g))
    );
  };

  // Remove a guest from their table
  const handleUnseatGuest = (guestId) => {
    setGuests(
      guests.map((g) => (g.id === guestId ? { ...g, tableId: null } : g))
    );
  };

  // Get occupancy count for a table
  const getTableOccupancy = (tableId) => {
    return guests.filter((g) => g.tableId === tableId).length;
  };

  return (
    <div className="pb-24">
      {/* 2D Interactive Seating Map */}
      <div className="bg-white border-2 border-wedding-champagne-dark rounded-3xl p-4 shadow-sm mb-6 relative">
        <h3 className="font-serif text-sm font-bold text-wedding-burgundy text-center mb-3">
          Схема Зала
        </h3>

        {/* Map Container styled to match layout */}
        <div className="w-full relative aspect-[4/5] bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-inner">
          
          {/* Сцена (Stage) */}
          <div className="absolute top-[3%] left-[28%] w-[44%] h-[8%] bg-wedding-burgundy/10 border border-wedding-burgundy-light/30 rounded-full flex items-center justify-center text-[9px] font-bold text-wedding-burgundy tracking-widest z-10 shadow-sm">
            СЦЕНА
          </div>

          {/* Бар (Bar) */}
          <div className="absolute top-[32%] right-[2%] w-[10%] h-[20%] bg-wedding-champagne-light border border-wedding-champagne-dark/50 rounded-lg flex flex-col items-center justify-center text-[9px] font-extrabold text-wedding-burgundy-light leading-tight tracking-wider shadow-sm">
            <span>Б</span>
            <span>А</span>
            <span>Р</span>
          </div>

          {/* Render Tables */}
          {TABLES.map((table) => {
            const count = getTableOccupancy(table.id);
            const isSelected = selectedTableId === table.id;
            const isFull = count >= table.max;
            const isEmpty = count === 0;

            let statusColor = 'border-wedding-rose bg-wedding-rose-light/50 text-wedding-burgundy-dark';
            if (isFull) statusColor = 'border-rose-500 bg-rose-50 text-rose-800';
            if (isEmpty) statusColor = 'border-wedding-champagne-dark bg-white text-wedding-slate';

            return (
              <button
                key={table.id}
                type="button"
                onClick={() => setSelectedTableId(table.id)}
                className={`absolute flex flex-col items-center justify-center p-0.5 border-2 text-[9px] font-bold transition-all shadow-sm cursor-pointer z-10 ${table.shape} ${statusColor} ${
                  isSelected ? 'ring-[3px] ring-wedding-gold ring-offset-1 z-20 shadow-md scale-105' : 'hover:scale-102'
                }`}
                style={{
                  top: table.top || 'auto',
                  bottom: table.bottom || 'auto',
                  left: table.left || 'auto',
                  right: table.right || 'auto',
                  width: table.w,
                  height: table.h,
                }}
              >
                <span className={`truncate max-w-full px-0.5 leading-none ${table.id.startsWith('table_') ? 'text-xs font-black' : ''}`}>
                  {table.id.startsWith('table_') 
                    ? table.id.replace('table_', '') 
                    : table.id === 'presidium' 
                      ? 'През.' 
                      : table.id === 'top_left' 
                        ? 'Верх.Л.' 
                        : table.id === 'cabin_bottom_left' 
                          ? 'Каб.Л.' 
                          : table.id === 'cabin_top_right' 
                            ? 'Каб.П.' 
                            : table.id === 'bottom_center_1' 
                              ? 'Низ.Л.' 
                              : table.id === 'bottom_center_2' 
                                ? 'Низ.П.' 
                                : table.name}
                </span>
                <span className="text-[8px] font-extrabold mt-0.5 opacity-80">
                  {count}/{table.max}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Table Seating Panel */}
      {selectedTable && (
        <div className="bg-white border-2 border-wedding-champagne-dark rounded-3xl p-4 shadow-sm mb-6">
          
          {/* Table Header Details */}
          <div className="border-b-2 border-wedding-champagne-light pb-3 mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <h4 className="font-serif text-base font-bold text-wedding-burgundy">
                {selectedTable.label}
              </h4>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-sm ${
                seatedCount >= selectedTable.max 
                  ? 'bg-rose-100 text-rose-900 border-rose-300' 
                  : 'bg-emerald-100 text-emerald-950 border-emerald-300'
              }`}>
                Занято: {seatedCount} из {selectedTable.max}
              </span>
            </div>

            {/* Progress Bar for seats */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  seatedCount >= selectedTable.max ? 'bg-rose-500' : 'bg-wedding-rose-dark'
                }`}
                style={{ width: `${(seatedCount / selectedTable.max) * 100}%` }}
              />
            </div>
          </div>

          {/* Seated Guests List */}
          <div className="mb-6">
            <h5 className="text-[10px] font-bold text-wedding-slate-dark uppercase tracking-wider mb-2">
              Сидят за столом ({seatedCount})
            </h5>
            
            {seatedCount === 0 ? (
              <p className="text-xs text-wedding-slate italic bg-slate-50 border border-slate-200/50 rounded-xl p-3 text-center">
                За этим столом пока никого нет. Выберите гостей из списка ниже, чтобы посадить их.
              </p>
            ) : (
              <ul className="divide-y divide-wedding-champagne-light border border-wedding-champagne-light rounded-2xl overflow-hidden bg-slate-50/50">
                <AnimatePresence initial={false}>
                  {seatedGuests.map((guest) => (
                    <motion.li
                      key={guest.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center justify-between px-3 py-2 text-xs"
                    >
                      <div className="flex flex-col truncate pr-2">
                        <span className="font-semibold text-wedding-burgundy-dark truncate">
                          {guest.name}
                        </span>
                        {guest.role && (
                          <span className="text-[9px] text-wedding-slate truncate">
                            {guest.role}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${
                          guest.side === 'katya' 
                            ? 'bg-wedding-rose/50 border-wedding-rose-dark/20 text-wedding-burgundy' 
                            : 'bg-wedding-gold-light border-wedding-gold/30 text-wedding-burgundy-dark'
                        }`}>
                          {guest.side === 'katya' ? 'Катя' : 'Саша'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUnseatGuest(guest.id)}
                          className="p-1 rounded-full text-wedding-slate/50 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Убрать из-за стола"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>

          {/* Seat Guests Action section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h5 className="text-[10px] font-bold text-wedding-slate-dark uppercase tracking-wider">
                Посадить гостя
              </h5>
              <div className="flex items-center gap-1.5">
                {/* Filter attending checkbox */}
                <label className="text-[9px] font-semibold text-wedding-slate flex items-center gap-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filterAttendingOnly}
                    onChange={() => setFilterAttendingOnly(!filterAttendingOnly)}
                    className="rounded text-wedding-rose-dark focus:ring-wedding-rose-dark w-3 h-3 cursor-pointer"
                  />
                  Только придут
                </label>
              </div>
            </div>

            {/* Mini Search & Side filter */}
            <div className="flex gap-2 mb-3">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Поиск гостя..."
                  value={unseatedSearch}
                  onChange={(e) => setUnseatedSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl glass-input placeholder-wedding-slate/60 focus:ring-1"
                />
                <Search size={12} className="absolute left-2.5 top-2.5 text-wedding-slate/75" />
              </div>

              {/* Side Filter Dropdown */}
              <select
                value={filterSide}
                onChange={(e) => setFilterSide(e.target.value)}
                className="px-2 py-1 text-xs rounded-xl glass-input bg-white text-wedding-slate-dark border border-wedding-champagne-dark"
              >
                <option value="all">Все стороны</option>
                <option value="katya">От Кати</option>
                <option value="sasha">От Саши</option>
              </select>
            </div>

            {/* List of Unseated Guests to Select */}
            {seatedCount >= selectedTable.max ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs font-semibold text-center flex items-center justify-center gap-2">
                <Info size={16} />
                Все места за этим столом заняты! Высадите кого-то, чтобы посадить нового гостя.
              </div>
            ) : unseatedGuests.length === 0 ? (
              <p className="text-xs text-wedding-slate italic text-center py-4 bg-slate-50 border border-slate-150 rounded-2xl">
                {unseatedSearch || filterSide !== 'all' || filterAttendingOnly
                  ? 'Нет подходящих свободных гостей по фильтрам'
                  : 'Все гости уже успешно рассажены! 🎉'}
              </p>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-wedding-champagne-light rounded-2xl divide-y divide-wedding-champagne-light">
                {unseatedGuests.map((guest) => (
                  <button
                    key={guest.id}
                    type="button"
                    onClick={() => handleSeatGuest(guest.id)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs hover:bg-wedding-rose-light/40 transition-colors cursor-pointer group border-none bg-white"
                  >
                    <div className="flex flex-col truncate pr-2">
                      <span className="font-semibold text-slate-800 group-hover:text-wedding-burgundy truncate">
                        {guest.name}
                      </span>
                      <span className="text-[9px] text-wedding-slate truncate">
                        {guest.role || 'Гость'} • {guest.side === 'katya' ? 'Катя' : 'Саша'} • {guest.inviteType === 'registry' ? '13:00' : '15:00'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Attendance badge */}
                      {!guest.attending && (
                        <span className="text-[8px] bg-slate-100 border border-slate-200 text-slate-500 font-bold px-1.5 py-0.5 rounded">
                          Думает
                        </span>
                      )}
                      <div className="p-1 rounded bg-wedding-rose/20 text-wedding-burgundy group-hover:bg-wedding-burgundy group-hover:text-white transition-colors">
                        <UserPlus size={12} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
