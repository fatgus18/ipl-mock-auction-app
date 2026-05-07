"use client";

import { useState } from 'react';

interface DashboardProps {
  top20MVP: (string | number)[][];
  leaderboard: (string | number)[][];
  avgPts: (string | number)[][];
  orangeCap: (string | number)[][];
  purpleCap: (string | number)[][];
  valueSigings: (string | number)[][];
  captainRegrets: (string | number)[][];
  rosterDependency: (string | number)[][];
}

export default function DashboardTabs({ 
  top20MVP,
  leaderboard, 
  avgPts, 
  orangeCap, 
  purpleCap, 
  valueSigings, 
  captainRegrets, 
  rosterDependency 
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState('leaderboard');

  const tabs = [
    { id: 'leaderboard', label: 'Leaderboards' },
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* TOP 20 MVP */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">🌟 Top 20 MVP</h2>
            <div className="space-y-2">
              {top20MVP.slice(1).map((row: (string | number)[], idx: number) => {
                if (!row[0] || String(row[0]).toLowerCase() === '---') return null;
                return (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-gray-800/40 rounded-lg hover:bg-gray-800/60 transition text-sm">
                    <span className="font-bold text-cyan-400 min-w-[20px]">{idx}.</span>
                    <span className="text-gray-300">{String(row[0])}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overall Leaderboard + Avg Pts/Mat */}
          <div className="lg:col-span-2 space-y-6">
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
        </div>
      )}

      {/* Tab Content: CAP RACES */}
      {activeTab === 'cap-races' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-xl border border-orange-900/30 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-orange-400 mb-4 border-b border-gray-800 pb-2">🏏 Orange Cap (Most Runs)</h2>
            <div className="space-y-2">
              {orangeCap.slice(1).map((row: (string | number)[], idx: number) => {
                if (!row[0] || String(row[0]).toLowerCase() === 'none') return null;
                const display = String(row[0]);
                return (
                  <div key={idx} className="flex items-center justify-between p-3 bg-orange-900/20 rounded-lg border border-orange-900/20 hover:border-orange-700/50 transition">
                    <span className="text-sm text-gray-300 font-semibold">{display}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-purple-900/30 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-purple-400 mb-4 border-b border-gray-800 pb-2">🎯 Purple Cap (Most Wickets)</h2>
            <div className="space-y-2">
              {purpleCap.slice(1).map((row: (string | number)[], idx: number) => {
                if (!row[0] || String(row[0]).toLowerCase() === 'none') return null;
                const display = String(row[0]);
                return (
                  <div key={idx} className="flex items-center justify-between p-3 bg-purple-900/20 rounded-lg border border-purple-900/20 hover:border-purple-700/50 transition">
                    <span className="text-sm text-gray-300 font-semibold">{display}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: ADVANCED ANALYTICS */}
      {activeTab === 'advanced' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">💰 Value Signings</h2>
            <div className="space-y-2 text-sm">
              {valueSigings.slice(1).map((row: (string | number)[], idx: number) => {
                if (!row[0] || idx > 9) return null;
                const display = String(row[0]);
                return (
                  <div key={idx} className="p-2 bg-green-900/20 rounded border border-green-900/30 text-green-300">
                    {display}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">😰 Captaincy Regret</h2>
            <div className="space-y-2 text-sm">
              {captainRegrets.slice(1).map((row: (string | number)[], idx: number) => {
                if (!row[0] || idx > 9) return null;
                const display = String(row[0]);
                return (
                  <div key={idx} className="p-2 bg-red-900/20 rounded border border-red-900/30 text-red-300">
                    {display}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">🏗️ Roster Dependency</h2>
            <div className="space-y-2 text-sm">
              {rosterDependency.slice(1).map((row: (string | number)[], idx: number) => {
                if (!row[0] || idx > 9) return null;
                const display = String(row[0]);
                return (
                  <div key={idx} className="p-2 bg-blue-900/20 rounded border border-blue-900/30 text-blue-300">
                    {display}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}