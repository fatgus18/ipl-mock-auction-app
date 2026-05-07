"use client";

import { useState } from 'react';

interface Set {
  id: string;
  label: string;
  players: (string | number)[][];
}

export default function AuctionTabs({ sets }: { sets: Set[] }) {
  const [activeTab, setActiveTab] = useState(sets[0]?.id || '');

  const currentSet = sets.find(set => set.id === activeTab);

  // Helper function to safely parse player data
  const parsePlayerData = (player: (string | number)[]) => {
    if (!player || player.length < 5) return null;
    
    const name = String(player[0] || '').trim();
    const role = String(player[1] || '').trim();
    const basePrice = player[2];
    const soldPrice = player[3];
    const soldTo = String(player[4] || '').trim().toUpperCase();
    
    // Handle TRUE/FALSE values - convert to proper sold status
    let isSold = true;
    if (soldTo === 'FALSE' || soldTo === '' || !soldTo) {
      isSold = false;
    } else if (soldTo === 'TRUE') {
      isSold = true; // Mark as sold but use soldTo field
    }
    
    return {
      name,
      role,
      basePrice,
      soldPrice: soldPrice && soldPrice !== '' ? `₹${soldPrice} Cr` : '-',
      soldTo: isSold && soldTo !== 'TRUE' ? soldTo : (isSold ? 'SOLD' : 'UNSOLD'),
      isSold: isSold && soldTo !== 'TRUE'
    };
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
        {currentSet?.players && currentSet.players.length > 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentSet.players.slice(1).map((player: (string | number)[], index: number) => {
              const parsed = parsePlayerData(player);
              if (!parsed || !parsed.name) return null;

              return (
                <div 
                  key={index} 
                  className={`flex flex-col justify-between p-5 bg-gray-800/40 shadow-sm rounded-lg border-l-4 transition-all ${
                    parsed.isSold ? 'border-l-indigo-500 hover:bg-gray-800/60' : 'border-l-gray-600 opacity-75 hover:opacity-85'
                  }`}
                >
                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-white">{parsed.name}</h3>
                    <p className="text-sm text-gray-400">{parsed.role || 'Unknown Role'}</p>
                  </div>
                  
                  <div className="flex justify-between items-end border-t border-gray-700/50 pt-3 mt-auto">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Final Price</p>
                      <p className="font-black text-xl text-gray-200">
                        {parsed.soldPrice}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Sold To</p>
                      <p className={`text-sm font-bold tracking-wide uppercase ${parsed.isSold ? 'text-indigo-400' : 'text-gray-500'}`}>
                        {parsed.soldTo}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-500 italic">No players recorded in this set yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}