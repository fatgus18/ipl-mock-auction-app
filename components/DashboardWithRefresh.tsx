"use client";

import { useState } from 'react';
import DashboardTabs from './DashboardTabs';
import RefreshButton from './RefreshButton';

// Flexible types to stop Vercel from complaining about Google Sheets mixed data
export type SheetCell = string | number | null | undefined;
export type SheetData = SheetCell[][];

interface DashboardWithRefreshProps {
  initialData: {
    leaderboard: SheetData;
    avgPts: SheetData;
    rosters: SheetData;
    statsF: SheetData;
    statsI: SheetData;
  };
}

export default function DashboardWithRefresh({ initialData }: DashboardWithRefreshProps) {
  const [data, setData] = useState(initialData);

  const handleDataRefresh = (newData: any) => {
    setData({
      leaderboard: newData.leaderboard || [],
      avgPts: newData.avgPts || [],
      rosters: newData.rosters || [],
      statsF: newData.statsF || [],
      statsI: newData.statsI || [],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div />
        <RefreshButton onDataRefresh={handleDataRefresh} />
      </div>
      <DashboardTabs
        leaderboard={data.leaderboard}
        avgPts={data.avgPts}
        rosters={data.rosters}
        statsF={data.statsF}
        statsI={data.statsI}
      />
    </div>
  );
}