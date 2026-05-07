"use client";

import { useState } from 'react';

export default function DashboardTabs({ leaderboard, avgPts }: { leaderboard: (string | number)[][]; avgPts: (string | number)[][] }) {
  const [activeTab, setActiveTab] = useState('leaderboard');

  const tabs = [
    { id: 'leaderboard', label: 'Leaderboards' },
    { id: 'rosters', label: 'Franchise Rosters' },
    { id: 'cap-races', label: 'Cap Races' },
    { id: 'advanced', label: 'Advanced Analytics' }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto space-x-2 border-b border-gray-800 pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 rounded-t-lg font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gray-800 text-indigo-400 border-t-2 border-indigo-400'
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content: LEADERBOARDS */}
      {activeTab === 'leaderboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Overall Leaderboard</h2>
            <div className="space-y-3">
              {leaderboard.slice(1).map((row: (string | number)[], idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                  <span className="font-semibold text-gray-200 text-lg flex items-center gap-2">
                    <span className="text-gray-500 text-sm font-mono w-4">{idx + 1}.</span> 
                    {String(row[0]).split(':')[0]}
                  </span>
                  <span className="font-black text-emerald-400 text-xl">{String(row[0]).split(':')[1]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Avg Pts/Mat</h2>
            <div className="space-y-3">
              {avgPts.slice(1).map((row: (string | number)[], idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                  <span className="font-semibold text-gray-200 text-lg flex items-center gap-2">
                    <span className="text-gray-500 text-sm font-mono w-4">{idx + 1}.</span> 
                    {String(row[0]).split(':')[0]}
                  </span>
                  <span className="font-black text-cyan-400 text-xl">{String(row[0]).split(':')[1]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: ROSTERS */}
      {activeTab === 'rosters' && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-2xl overflow-x-auto">
          <h2 className="text-xl font-bold text-white mb-4">Drafted Squads</h2>
          <p className="text-gray-500 italic mb-4">Roster mapping goes here (You can build a grid mapping columns A to D over the roster data).</p>
        </div>
      )}

      {/* Tab Content: CAP RACES */}
      {activeTab === 'cap-races' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-xl border border-orange-900/30 p-6 shadow-2xl">
             <h2 className="text-xl font-bold text-orange-400 mb-4 border-b border-gray-800 pb-2">Orange Cap</h2>
             {/* Map over Orange cap data from statsF */}
             <p className="text-gray-500 italic">Orange cap top 10 maps here.</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-purple-900/30 p-6 shadow-2xl">
             <h2 className="text-xl font-bold text-purple-400 mb-4 border-b border-gray-800 pb-2">Purple Cap</h2>
             {/* Map over Purple cap data from statsI */}
             <p className="text-gray-500 italic">Purple cap top 10 maps here.</p>
          </div>
        </div>
      )}

      {/* Tab Content: ADVANCED ANALYTICS */}
      {activeTab === 'advanced' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-2xl">
             <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Value Signings</h2>
             <p className="text-gray-500 italic">Best ROI and Worst Duds map here.</p>
           </div>
           <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-2xl">
             <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Captaincy Regret</h2>
             <p className="text-gray-500 italic">Regret Index maps here.</p>
           </div>
           <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-2xl">
             <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Roster Dependency</h2>
             <p className="text-gray-500 italic">Hardest Carry & Top Order maps here.</p>
           </div>
        </div>
      )}
    </div>
  );
}