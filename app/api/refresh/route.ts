import { getSheetData } from '@/lib/googleSheets';

export async function GET() {
  try {
    // Fetch all the data in parallel
    const [
      top20MVPData,
      leaderboardData,
      avgPtsData,
      orangeCapData,
      purpleCapData,
      valuSigningsData,
      captainRegretsData,
      rosterDependencyData,
    ] = await Promise.all([
      getSheetData('POINTS!I1:I22'),
      getSheetData('POINTS!J1:J10'),
      getSheetData('POINTS!J11:J20'),
      getSheetData('POINTS!F103:F115'),
      getSheetData('POINTS!I103:I115'),
      getSheetData('POINTS!F83:F95'),
      getSheetData('POINTS!F116:F130'),
      getSheetData('POINTS!I59:I75'),
    ]);

    return Response.json({
      success: true,
      data: {
        top20MVP: top20MVPData || [],
        leaderboard: leaderboardData || [],
        avgPts: avgPtsData || [],
        orangeCap: orangeCapData || [],
        purpleCap: purpleCapData || [],
        valueSigings: valuSigningsData || [],
        captainRegrets: captainRegretsData || [],
        rosterDependency: rosterDependencyData || [],
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
