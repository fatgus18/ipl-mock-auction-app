"use client";

import { useState } from 'react';

export default function DashboardTabs({ leaderboard, avgPts, rosters, statsF, statsI }: any) {
  const [activeTab, setActiveTab] = useState('leaderboard');

  const tabs = [
    { id: 'leaderboard', label: 'Leaderboards' },
    { id: 'rosters', label: 'Franchise Rosters' },
    { id: 'cap-races', label: 'Cap Races' },
    { id: 'advanced', label: 'Advanced Analytics' }
  ];

  // --- 1. DYNAMICALLY PARSE ROSTERS INTO TEAMS ---
  const participantsList = ["PRAMODH", "VARRSAN", "SUHAAS", "JEFFRICK", "PRANAV", "SHRINIL", "GHOUSE", "SANATH"];
  const parsedRosters: any[] = [];
  let currentParticipant: string | null = null;
  let currentTeam: any[] = [];

  (rosters || []).forEach((row: any) => {
    if (!row || !row[0]) return;
    const cell0 = row[0].toString().trim();
    const cell0Clean = cell0.replace('👑', '').trim().toUpperCase();

    // Check if row is a participant name
    if (participantsList.some(p => cell0Clean.includes(p))) {
      if (currentParticipant) {
        parsedRosters.push({ name: currentParticipant, players: currentTeam });
      }
      currentParticipant = cell0;
      currentTeam = [];
    } 
    // Check if row is the "Total" row
    else if (cell0Clean.includes("TOTAL")) {
      currentTeam.push({ name: cell0, pts: row[1], dev: row[2], avg: row[3], isTotal: true });
      if (currentParticipant) {
        parsedRosters.push({ name: currentParticipant, players: currentTeam });
      }
      currentParticipant = null;
      currentTeam = [];
    } 
    // Otherwise it's a player
    else if (currentParticipant) {
      currentTeam.push({ name: cell0, pts: row[1], dev: row[2], avg: row[3], isTotal: false });
    }
  });

  // --- 2. DYNAMICALLY PARSE ADVANCED STATS ---
  const parseBlocks = (colData: any[]) => {
    const blocks: any[] = [];
    let currentBlock: any = null;
    
    (colData || []).forEach(row => {
      if (!row || !row[0]) return;
      const val = row[0].toString().trim();
      
      if (val.startsWith("---")) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { title: val.replace(/---/g, '').trim(), subtitle: null, items: [] };
      } else if (currentBlock) {
        // If it starts with parentheses, treat it as a subtitle description
        if (val.startsWith("(") && val.endsWith(")") && currentBlock.items.length === 0) {
            currentBlock.subtitle = val;
        } else {
            currentBlock.items.push(val);
        }
      }
    });
    if (currentBlock) blocks.push(currentBlock);
    return blocks;
  };

  const allStatsF = parseBlocks(statsF);
  const allStatsI = parseBlocks(statsI);
  
  // Separate Cap Races from General Advanced Stats
  const orangeCap = allStatsF.find(b => b.title.includes("ORANGE CAP"));
  const purpleCap = allStatsI.find(b => b.title.includes("PURPLE CAP"));
  const advancedStats = [...allStatsF, ...allStatsI].filter(b => 
    !b.title.includes("ORANGE CAP") && !b.title.includes("PURPLE CAP")
  );

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
              {(leaderboard || []).slice(1).map((row: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                  <span className="font-semibold text-gray-200 text-lg flex items-center gap-2">
                    <span className="text-gray-500 text-sm font-mono w-4">{idx + 1}.</span> 
                    {row[0].split(':')[0]}
                  </span>
                  <span className="font-black text-emerald-400 text-xl">{row[0].split(':')[1]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Avg Pts/Mat</h2>
            <div className="space-y-3">
              {(avgPts || []).slice(1).map((row: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                  <span className="font-semibold text-gray-200 text-lg flex items-center gap-2">
                    <span className="text-gray-500 text-sm font-mono w-4">{idx + 1}.</span> 
                    {row[0].split(':')[0]}
                  </span>
                  <span className="font-black text-cyan-400 text-xl">{row[0].split(':')[1]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: ROSTERS (4x2 Landscape Grid) */}
      {activeTab === 'rosters' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {parsedRosters.map((team, idx) => (
            <div key={idx} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
              <div className="bg-gray-800 py-3 px-4 border-b border-gray-700">
                <h3 className="font-black text-lg text-white">{team.name}</h3>
              </div>
              <div className="flex-1 p-0 overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300 whitespace-nowrap">
                  <thead className="bg-gray-900/50 text-xs uppercase text-gray-500 border-b border-gray-800">
                    <tr>
                      <th className="px-4 py-2">Player</th>
                      <th className="px-3 py-2 text-right">Pts</th>
                      <th className="px-3 py-2 text-right">Dev</th>
                      <th className="px-3 py-2 text-right">Avg</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-gray-800/50">
                    {team.players.map((p: any, i: number) => (
                      <tr key={i} className={p.isTotal ? "bg-indigo-900/20 font-bold text-white border-t-2 border-indigo-500/50" : "hover:bg-gray-800/30"}>
                        <td className="px-4 py-2 truncate max-w-[140px]">{p.name}</td>
                        <td className="px-3 py-2 text-right">{p.pts || '-'}</td>
                        <td className={`px-3 py-2 text-right ${parseFloat(p.dev) < 0 ? 'text-red-400' : 'text-emerald-400'}`}>{p.dev || '-'}</td>
                        <td className="px-3 py-2 text-right text-cyan-400">{p.avg || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: CAP RACES */}
      {activeTab === 'cap-races' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-xl border border-orange-900/30 p-6 shadow-2xl">
             <h2 className="text-xl font-bold text-orange-400 mb-4 border-b border-gray-800 pb-2">Orange Cap</h2>
             <div className="space-y-2">
                {orangeCap?.items.map((item: string, i: number) => (
                    <div key={i} className="text-sm font-semibold text-gray-200 bg-gray-800/40 p-3 rounded-lg border border-gray-800/50">{item}</div>
                ))}
             </div>
          </div>
          <div className="bg-gray-900 rounded-xl border border-purple-900/30 p-6 shadow-2xl">
             <h2 className="text-xl font-bold text-purple-400 mb-4 border-b border-gray-800 pb-2">Purple Cap</h2>
             <div className="space-y-2">
                {purpleCap?.items.map((item: string, i: number) => (
                    <div key={i} className="text-sm font-semibold text-gray-200 bg-gray-800/40 p-3 rounded-lg border border-gray-800/50">{item}</div>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* Tab Content: ADVANCED ANALYTICS (Dynamic Auto-Parser) */}
      {activeTab === 'advanced' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {advancedStats.map((block, idx) => (
             <div key={idx} className="bg-gray-900 rounded-xl border border-gray-800 p-5 shadow-2xl">
                <h2 className="text-lg font-bold text-white mb-2">{block.title}</h2>
                {block.subtitle && <p className="text-xs text-gray-500 font-semibold mb-3 uppercase tracking-wider">{block.subtitle}</p>}
                
                <div className="space-y-2 mt-4">
                   {block.items.map((item: string, i: number) => (
                      <div key={i} className="text-sm text-gray-300 bg-gray-800/40 p-2.5 rounded border border-gray-800/50 leading-relaxed">
                          {item}
                      </div>
                   ))}
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}