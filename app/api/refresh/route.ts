import { getSheetData } from '@/lib/googleSheets';

export async function GET() {
  try {
    const [
      leaderboardData,
      avgPtsData,
      rostersData,
      statsFData,
      statsIData,
    ] = await Promise.all([
      getSheetData('POINTS!J1:J10'),
      getSheetData('POINTS!J11:J20'),
      getSheetData('POINTS!A1:D200'),
      getSheetData('POINTS!F1:F200'),
      getSheetData('POINTS!I1:I200'),
    ]);

    return Response.json({
      success: true,
      data: {
        leaderboard: leaderboardData || [],
        avgPts: avgPtsData || [],
        rosters: rostersData || [],
        statsF: statsFData || [],
        statsI: statsIData || [],
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error refreshing data:', error);
    return Response.json(
      { success: false, error: 'Failed to refresh data' },
      { status: 500 }
    );
  }
}