import express from 'express';
import cors from 'express';

import { GAMES, PREGAME, updateData } from '../data/db-data.js';

const router = express.Router();
export { router as GamesRouter };

router.use(cors());
router.get('/', (req, res) => {
    updateData();
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

    //console.log(`Filtering: year=${year}, week=${week}, pageSize=${pageSize}, filter=${filter}`);

    if (week !== undefined && week !== '') g = g.filter(game => game.week === weekNum);
    // filter by top25/conference list
    g = g.filter(game => {
        return ( ((game.home_team_ranking || game.away_team_ranking) && filter.indexOf('Top 25') !== -1) ||
            filter.indexOf(game.home_conference) !== -1 || 
            filter.indexOf(game.away_conference) !== -1);
    });

    g.forEach(game => {
        // lookup spread and win probability to have a basic indication of how close the game will be
        let pgwp = PREGAME.filter(p => p.gameId === game.id);
        if (pgwp.length > 0) {
            game.home_win_probability = pgwp[0].homeWinProb;
            game.spread = pgwp[0].spread;
        } else {
            game.home_win_probability = 0.5;
            game.spread = 0;
        }
    })

    // handle sorting after filtering
    if (sortColumn === 'ei' && sortOrder === 'desc') g = g.sort((a, b) => eiCompare(b, a));
    if (sortColumn === 'ei' && sortOrder === 'asc') g = g.sort((a, b) => eiCompare(a, b));
    if (sortColumn === 'homeTeamName' && sortOrder === 'desc') g = g.sort((a, b) => b.home_team.localeCompare(a.home_team));
    if (sortColumn === 'homeTeamName' && sortOrder === 'asc')  g = g.sort((a, b) => a.home_team.localeCompare(b.home_team));
    if (sortColumn === 'awayTeamName' && sortOrder === 'desc') g = g.sort((a, b) => b.away_team.localeCompare(a.away_team));
    if (sortColumn === 'awayTeamName' && sortOrder === 'asc')  g = g.sort((a, b) => a.away_team.localeCompare(b.away_team));
    if ((sortColumn === 'week' || sortColumn === 'date') && sortOrder === 'desc') g = g.sort((a, b) => b.start_date.localeCompare(a.start_date) || eiCompare(a, b));
    if ((sortColumn === 'week' || sortColumn === 'date') && sortOrder === 'asc')  g = g.sort((a, b) => a.start_date.localeCompare(b.start_date) || eiCompare(a, b));

    const initialPos = pageNumber * pageSize;
    const gPage = g.slice(initialPos, initialPos + pageSize);

    //console.log(`Total results: ${g.length}`);
    let result = {payload: gPage, matchingGames: g.length, week: week, year: year, maxWeek: maxWeek, maxCompletedWeek: maxCompletedWeek};

    res.status(200).json(result);
});

function eiCompare(a, b) {
    return (Number(a.excitement_index||(10 - (Math.abs((a.home_win_probability??0.5)-0.5)*20))||'0') 
               - Number(b.excitement_index||(10 - (Math.abs((b.home_win_probability??0.5)-0.5)*20))||'0')) || 
        a.home_team.localeCompare(b.home_team);
}