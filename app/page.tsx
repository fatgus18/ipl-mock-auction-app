import { getSheetData } from '@/lib/googleSheets';

// This tells Vercel to fetch fresh data from your sheet every 60 seconds
export const revalidate = 60; 

export default async function Home() {
  // Fetch Leaderboard from Column J
  const leaderboardData = await getSheetData('POINTS!J1:J10');
  
  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Leaderboard Section */}
        <section className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
          <h1 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-2">
            Overall Leaderboard
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {leaderboardData?.slice(1).map((row, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg border flex justify-between items-center">
                <span className="font-semibold text-slate-700">{row[0].split(':')[0]}</span>
                <span className="text-lg font-bold text-emerald-600">{row[0].split(':')[1]}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}