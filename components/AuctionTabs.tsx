"use client";

import { useState } from 'react';

// --- STRICT TYPESCRIPT INTERFACES ---
export interface AuctionSet {
  id: string;
  label: string;
  players: string[][];
}

interface AuctionTabsProps {
  sets: AuctionSet[];
}

export default function AuctionTabs({ sets }: AuctionTabsProps) {
  const [activeTab, setActiveTab] = useState(sets[0]?.id || '');
  const currentSet = sets.find(set => set.id === activeTab);

  const renderGrid = () => {
    if (!currentSet?.players || currentSet.players.length <= 1) {
      return (
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-500 italic">No players recorded in this set yet.</p>
        </div>
      );
    }

    // DYNAMICALLY FIND COLUMN INDICES BASED ON EXACT SHEET HEADERS
    const headers = currentSet.players[0].map((h: string) => h ? h.toString().toUpperCase().trim() : '');
    
    // We assume Player Name is always Column 0
    const nameIdx = 0; 
    const roleIdx = headers.indexOf('ROLE');
    const soldPriceIdx = headers.findIndex((h: string) => h.includes('SOLD PRICE'));
    const soldToIdx = headers.findIndex((h: string) => h.includes('SOLD TO'));

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentSet.players.slice(1).map((player: string[], index: number) => {
          // Skip entirely empty rows
          if (!player || !player[nameIdx]) return null;

          const rawSoldTo = soldToIdx !== -1 ? player[soldToIdx] : null;
          const isUnsold = !rawSoldTo || rawSoldTo.toString().trim() === "" || rawSoldTo.toString().toUpperCase().includes("UNSOLD");
          
          // If the sheet doesn't have a ROLE column (like BATTERS SET 1), use the sheet's name as the role fallback
          const role = roleIdx !== -1 && player[roleIdx] 
            ? player[roleIdx] 
            : currentSet.label.replace(/SET \d+/i, '').trim();

          return (
            <div 
              key={index} 
              className={`flex flex-col justify-between p-5 bg-gray-800/40 shadow-sm rounded-lg border-l-4 ${
                isUnsold ? 'border-l-gray-600 opacity-60' : 'border-l-indigo-500'
              }`}
            >
              <div className="mb-4">
                <h3 className="font-bold text-lg text-white">{player[nameIdx]}</h3>
                <p className="text-sm text-gray-400">{role}</p>
              </div>
              
              <div className="flex justify-between items-end border-t border-gray-700/50 pt-3 mt-auto">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Final Price</p>
                  <p className="font-black text-xl text-gray-200">
                    {soldPriceIdx !== -1 && player[soldPriceIdx] ? `₹${player[soldPriceIdx]} Cr` : '-'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Sold To</p>
                  <p className={`text-sm font-bold tracking-wide uppercase ${isUnsold ? 'text-gray-500' : 'text-indigo-400'}`}>
                    {isUnsold ? 'UNSOLD' : rawSoldTo}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Scrollable Tab Navigation */}
      <div className="flex overflow-x-auto space-x-2 border-b border-gray-800 pb-2 scrollbar-hide">
        {sets.map((set) => (
          <button
            key={set.id}
            onClick={() => setActiveTab(set.id)}
            className={`px-5 py-2.5 rounded-t-lg font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === set.id
                ? 'bg-gray-800 text-cyan-400 border-t-2 border-cyan-400'
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
            }`}
          >
            {set.label}
          </button>
        ))}
      </div>

      {/* Roster Grid for Selected Tab */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 md:p-6 shadow-2xl min-h-[50vh]">
        {renderGrid()}
      </div>
    </div>
  );
}