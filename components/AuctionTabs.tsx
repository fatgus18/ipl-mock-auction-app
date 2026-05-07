"use client";

import { useState } from 'react';

export default function AuctionTabs({ sets }: { sets: Array<{ id: string; label: string; players: (string | number)[][] }> }) {
  // Default to the first set in the array (e.g., Marquee Set)
  const [activeTab, setActiveTab] = useState(sets[0]?.id || '');

  // Find the currently active set data
  const currentSet = sets.find(set => set.id === activeTab);

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
            {currentSet?.players.slice(1).map((player: (string | number)[], index: number) => {
              // Skip empty rows
              if (!player[0]) return null;

const isUnsold = !player[4] || String(player[4]).trim() === "" || String(player[4]).toUpperCase() === "UNSOLD";

              return (
                <div 
                  key={index} 
                  className={`flex flex-col justify-between p-5 bg-gray-800/40 shadow-sm rounded-lg border-l-4 ${
                    isUnsold ? 'border-l-gray-600 opacity-60' : 'border-l-indigo-500'
                  }`}
                >
                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-white">{player[0]}</h3>
                    <p className="text-sm text-gray-400">{player[1] || 'Unknown Role'}</p>
                  </div>
                  
                  <div className="flex justify-between items-end border-t border-gray-700/50 pt-3 mt-auto">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Final Price</p>
                      <p className="font-black text-xl text-gray-200">
                        {player[3] ? `₹${player[3]} Cr` : '-'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Sold To</p>
                      <p className={`text-sm font-bold tracking-wide uppercase ${isUnsold ? 'text-gray-500' : 'text-indigo-400'}`}>
                        {isUnsold ? 'UNSOLD' : player[4]}
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