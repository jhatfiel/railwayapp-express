import express from 'express';

import { GAMES } from '../data/db-data.js';

const router = express.Router();
export { router as GamesRouter };

router.get('/', (req, res) => {
    const queryParams = req.query;
    let year = Number(queryParams.year),
        week = Number(queryParams.week),
        filter = queryParams.filter || '',
        pageNumber = Number(queryParams.pageNumber) || 0,
        pageSize = Number(queryParams.pageSize);

    let g = GAMES.sort((a, b) => (Number(b.excitement_index||'0') - Number(a.excitement_index||'0')) || a.id-b.id);
    if (year === -1) year = g.filter(game => game.completed).reduce((acc, game) => acc = Math.max(acc, game.season), 0);
    if (week === -1) week = g.filter(game => game.completed).reduce((acc, game) => acc = Math.max(acc, game.week), 0);
    // need to check for other query parameters, like:
    // filter by top 25 
    //           All FBS (majors)/FCS (minors) 
    //           selected conference(s) (group them by Power 5 (ACC/Big Ten/Big 12/Pac-12/SEC)/Group of 5(AAC/CUSA/Mid-American/Mountain West/Sun Belt)
    //           favorites/starred

    if (year) g = g.filter(game => game.season === year);
    /* if (week !== NaN) */ g = g.filter(game => game.week === week);
    g = g.filter(game => game.home_team_ranking || game.away_team_ranking);

    const initialPos = pageNumber * pageSize;
    const gPage = g.slice(initialPos, initialPos + pageSize);

    let result = {payload: gPage, matchingGames: g.length};
    // need to add in other things like: maxCompletedWeek for each year

    res.status(200).json(result);
});