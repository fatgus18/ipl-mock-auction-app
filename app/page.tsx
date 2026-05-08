import { getSheetData } from '@/lib/googleSheets';
import DashboardWithRefresh from '@/components/DashboardWithRefresh';

export const revalidate = 60; 

export default async function Home() {
  // Fetch broad columns so we don't rely on hardcoded row numbers that change during the auction!
  const leaderboardData = await getSheetData('POINTS!J1:J10') || [];
  const avgPtsData = await getSheetData('POINTS!J11:J20') || [];
  const rostersData = await getSheetData('POINTS!A1:D200') || [];
  const statsFData = await getSheetData('POINTS!F1:F200') || [];
  const statsIData = await getSheetData('POINTS!I1:I200') || [];

  const initialData = {
    leaderboard: leaderboardData,
    avgPts: avgPtsData,
    rosters: rostersData,
    statsF: statsFData,
    statsI: statsIData,
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="border-b border-gray-800 pb-4 mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">
            IPL 2026 Mock Auction
          </h1>
          <p className="text-gray-400 mt-2 font-medium tracking-wide">LIVE TOURNAMENT DASHBOARD</p>
        </header>

        <DashboardWithRefresh initialData={initialData} />
      </div>
    </main>
  );
}