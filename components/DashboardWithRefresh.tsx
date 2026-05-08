"use client";

import { useState } from 'react';
import DashboardTabs from './DashboardTabs';
import RefreshButton from './RefreshButton';

interface DashboardWithRefreshProps {
  initialData: {
    top20MVP: (string | number)[][];
    teamList: (string | number)[][];
    advancedAnalytics: (string | number)[][];
    leaderboard: (string | number)[][];
    avgPts: (string | number)[][];
    orangeCap: (string | number)[][];
    purpleCap: (string | number)[][];
    valueSigings: (string | number)[][];
    captainRegrets: (string | number)[][];
    rosterDependency: (string | number)[][];
  };
}

export default function DashboardWithRefresh({ initialData }: DashboardWithRefreshProps) {
  const [data, setData] = useState(initialData);

  const handleDataRefresh = (newData: any) => {
    setData(newData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div />
        <RefreshButton onDataRefresh={handleDataRefresh} />
      </div>
      <DashboardTabs
        top20MVP={data.top20MVP}
        teamList={data.teamList}
        advancedAnalytics={data.advancedAnalytics}
        leaderboard={data.leaderboard}
        avgPts={data.avgPts}
        orangeCap={data.orangeCap}
        purpleCap={data.purpleCap}
        valueSigings={data.valueSigings}
        captainRegrets={data.captainRegrets}
        rosterDependency={data.rosterDependency}
      />
    </div>
  );
}
