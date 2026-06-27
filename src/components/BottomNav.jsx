import React from 'react';
import { motion } from 'framer-motion';
import { Users, Wallet } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'guests', name: 'Гости', icon: Users },
    { id: 'budget', name: 'Бюджет', icon: Wallet },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex justify-center bg-white/80 backdrop-blur-md border-t border-wedding-champagne-dark px-4 py-2 max-w-md mx-auto shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
      <div className="flex w-full justify-around max-w-xs relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center py-2 px-6 rounded-2xl relative w-24 transition-colors duration-200 focus:outline-none"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-wedding-rose/20 rounded-2xl -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <motion.div
                animate={{ scale: isActive ? 1.15 : 1, y: isActive ? -2 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`${
                  isActive ? 'text-wedding-burgundy' : 'text-wedding-slate'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              <span
                className={`text-[10px] mt-1 font-semibold tracking-wider ${
                  isActive ? 'text-wedding-burgundy' : 'text-wedding-slate'
                }`}
              >
                {tab.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
