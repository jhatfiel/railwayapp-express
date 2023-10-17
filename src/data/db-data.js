import { readFile } from 'fs/promises';

let GAMES = JSON.parse(await readFile('src/data/2023.json', 'utf8'));
let RANKINGS = JSON.parse(await readFile('src/data/2023_rankings.json', 'utf8'));

export { GAMES };

GAMES.forEach(game => {
    let rForWeek = RANKINGS.filter(r => r.season === game.season && r.week === game.week).map(r => r.polls.filter(p => p.poll === 'AP Top 25').flat()).flat().map(p => p.ranks).flat();
    rForWeek.filter(r => r.school === game.home_team && r.conference === game.home_conference).forEach(r => game.home_team_ranking = r.rank);
    rForWeek.filter(r => r.school === game.away_team && r.conference === game.away_conference).forEach(r => game.away_team_ranking = r.rank);
})