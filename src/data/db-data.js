const GAMES = require('./2023.json');
const RANKINGS = require('./2023_rankings.json');

export { GAMES, RANKINGS };

GAMES.forEach(game => {
    let rForWeek = RANKINGS.filter(r => r.season === game.season && r.week === game.week).map(r => r.polls.filter(p => p.poll === 'AP Top 25').flat()).flat().map(p => p.ranks).flat();
    rForWeek.filter(r => r.school === game.home_team && r.conference === game.home_conference).forEach(r => game.home_team_ranking = r.rank);
    rForWeek.filter(r => r.school === game.away_team && r.conference === game.away_conference).forEach(r => game.away_team_ranking = r.rank);
})