import express from 'express';
import cors from 'express';

import { GAMES, PREGAME, updateData, lastUpdated } from '../data/db-data.js';

const router = express.Router();
export { router as GamesRouter };

router.use(cors());
router.get('/', async (req, res) => {
    await updateData();
    const queryParams = req.query;
    let year = queryParams.year,
        week = queryParams.week,
        filter = queryParams.filter || 'top25', // top25/[selected conferences]
        sortColumn = queryParams.sortColumn || 'ei',
        sortOrder = queryParams.sortOrder || 'desc',
        pageNumber = Number(queryParams.pageNumber) || 0,
        pageSize = Number(queryParams.pageSize);
    let maxCompletedWeek = 1;
    let maxWeek = 1;
    let weekNum = 1;
    let yearNum = 0;

    let g = GAMES;
    //g = g.filter(game => game.completed); // when we do live data this has to change
    if (year === '-1') year = g.reduce((acc, game) => Math.max(acc, game.season), 0);
    yearNum = Number(year);
    // console.log(`yearNum=${yearNum}`);
    if (year !== undefined && year !== '') g = g.filter(game => game.season === yearNum);

    maxCompletedWeek = g.filter(game => game.completed).reduce((acc, game) => Math.max(acc, game.week), 0);
    maxWeek = g.reduce((acc, game) => Math.max(acc, game.week), 0);
    if (week === '-1') week = maxCompletedWeek;
    weekNum = Number(week);
    // need to check for other query parameters, like:
    // filter by top 25 
    //           All FBS (majors)/FCS (minors) 
    //           selected conference(s) (group them by Power 5 (ACC/Big Ten/Big 12/Pac-12/SEC)/Group of 5(AAC/CUSA/Mid-American/Mountain West/Sun Belt)
    //           favorites/starred

    // console.log(`Filtering: year=${year}, week=${week}, pageSize=${pageSize}, filter=${filter}`);

    if (week !== undefined && week !== '') g = g.filter(game => game.week === weekNum);
    // filter by top25/conference list
    // console.log(`Total results (before conference filter): ${g.length}`);
    let hasRanked = g.some(g => g.homeTeamRanking !== undefined || g.awayTeamRanking !== undefined);
    // console.log(`Conferences:`, g.reduce((acc, game) => { acc[game.homeConference] = (acc[game.homeConference]??0)+1; acc[game.awayConference] = (acc[game.awayConference]??0)+1; return acc }, {}));
    g = g.filter(game => {
        return ( 
            (!hasRanked && filter.indexOf('Top 25') !== -1) || 
            ((game.homeTeamRanking || game.awayTeamRanking) && filter.indexOf('Top 25') !== -1) ||
            filter.indexOf(game.homeConference) !== -1 || 
            filter.indexOf(game.awayConference) !== -1);
    });
    // console.log(`Total results: ${g.length}`);

    g.forEach(game => {
        // lookup spread and win probability to have a basic indication of how close the game will be
        let pgwp = PREGAME.filter(p => p.gameId === game.id);
        if (pgwp.length > 0) {
            game.homeWinProbability = pgwp[0].homeWinProb;
            game.spread = pgwp[0].spread;
        }
    })

    // handle sorting after filtering
    if (sortColumn === 'ei' && sortOrder === 'desc') g = g.sort((a, b) => eiCompare(b, a));
    if (sortColumn === 'ei' && sortOrder === 'asc') g = g.sort((a, b) => eiCompare(a, b));
    if (sortColumn === 'homeTeamName' && sortOrder === 'desc') g = g.sort((a, b) => b.homeTeam.localeCompare(a.homeTeam));
    if (sortColumn === 'homeTeamName' && sortOrder === 'asc')  g = g.sort((a, b) => a.homeTeam.localeCompare(b.homeTeam));
    if (sortColumn === 'awayTeamName' && sortOrder === 'desc') g = g.sort((a, b) => b.awayTeam.localeCompare(a.awayTeam));
    if (sortColumn === 'awayTeamName' && sortOrder === 'asc')  g = g.sort((a, b) => a.awayTeam.localeCompare(b.awayTeam));
    if ((sortColumn === 'week' || sortColumn === 'date') && sortOrder === 'desc') g = g.sort((a, b) => b.startDate.localeCompare(a.startDate) || eiCompare(a, b));
    if ((sortColumn === 'week' || sortColumn === 'date') && sortOrder === 'asc')  g = g.sort((a, b) => a.startDate.localeCompare(b.startDate) || eiCompare(a, b));

    const initialPos = pageNumber * pageSize;
    const gPage = g.slice(initialPos, initialPos + pageSize);

    let result = {payload: gPage, matchingGames: g.length, week: week, year: year, maxWeek: maxWeek, maxCompletedWeek: maxCompletedWeek, lastUpdated: lastUpdated};

    res.status(200).json(result);
});

function eiCompare(a, b) {
    if (a.completed && !b.completed) return 1;
    if (b.completed && !a.completed) return -1;
    if (!a.completed && !b.completed && a.homeWinProbability === undefined && b.homeWinProbability !== undefined) return -1;
    if (!a.completed && !b.completed && b.homeWinProbability === undefined && a.homeWinProbability !== undefined) return 1;
    return (Number(a.excitementIndex||(10 - (Math.abs((a.homeWinProbability??0.5)-0.5)*20))||'0') 
          - Number(b.excitementIndex||(10 - (Math.abs((b.homeWinProbability??0.5)-0.5)*20))||'0')) || 
        (a.homeTeam??"").localeCompare(b.homeTeam);
}