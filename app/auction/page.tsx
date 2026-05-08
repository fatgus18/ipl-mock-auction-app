import { getSheetData } from '@/lib/googleSheets';
import AuctionTabs from '@/components/AuctionTabs';

export const revalidate = 60;

// EXACT names of your sheets
const AUCTION_SETS = [
  "MARQUEE SET",
  "BATTERS SET 1",
  "BOWLERS SET 1",
  "ALL ROUNDERS SET 1",
  "WICKET KEEPERS SET 1",
  "BATTERS SET 2",
  "BOWLERS SET 2",
  "ALL ROUNDERS SET 2"
];

export default async function AuctionPage() {
  // Fetch all sheets in parallel
  const fetchedSets = await Promise.all(
    AUCTION_SETS.map(async (setName) => {
      const data = await getSheetData(`${setName}!A1:E100`);
      return {
        id: setName.toLowerCase().replace(/\s+/g, '-'),
        label: setName,
        players: data || []
      };
    })
  );

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="border-b border-gray-800 pb-4 mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">
            Auction Results
          </h1>
          <p className="text-gray-400 mt-2 font-medium tracking-wide">SOLD PLAYERS BY CATEGORY</p>
        </header>

        <AuctionTabs sets={fetchedSets} />
      </div>
    </main>
  );
}