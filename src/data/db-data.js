import { readFile, writeFile } from 'fs/promises';
import * as https from 'https';

let GAMES = JSON.parse(await readFile('src/data/2023.json', 'utf8'));
let RANKINGS = JSON.parse(await readFile('src/data/2023_rankings.json', 'utf8'));
let PREGAME = JSON.parse(await readFile('src/data/2023_pregame.json', 'utf8'));
let lastUpdated = new Date();
let latestRankingWeek = 1;
let stale = 1000 * 60 * 60; // (1 hour)
let CFBD_URL = 'https://api.collegefootballdata.com'
let CFBD_OPTIONS = { headers: {accept: 'application/json', Authorization: `Bearer ${process.env['CFBD_TOKEN']}`}}

function fixData() {
    latestRankingWeek = RANKINGS.filter(r => r.polls.some(p => p.poll === 'AP Top 25' || p.poll === 'Playoff Committee Rankings')).reduce((acc, r) => Math.max(acc, r.week), 0);

    GAMES.forEach(game => {
        let rForWeek = RANKINGS.filter(r => r.season === game.season && r.week === Math.min(latestRankingWeek, game.week)).map(r => r.polls.filter(p => p.poll === 'Playoff Committee Rankings').flat()).flat().map(p => p.ranks).flat();
        if (rForWeek.length === 0) rForWeek = RANKINGS.filter(r => r.season === game.season && r.week === Math.min(latestRankingWeek, game.week)).map(r => r.polls.filter(p => p.poll === 'AP Top 25').flat()).flat().map(p => p.ranks).flat();
        rForWeek.filter(r => r.school === game.home_team && r.conference === game.home_conference).forEach(r => game.home_team_ranking = r.rank);
        rForWeek.filter(r => r.school === game.away_team && r.conference === game.away_conference).forEach(r => game.away_team_ranking = r.rank);
    })
}

fixData();

async function updateData() {
    if (new Date() - lastUpdated > stale) {
        lastUpdated = new Date();
        console.log(`Updating data`);
        console.log(JSON.stringify(CFBD_OPTIONS));
        let GP = new Promise((resolve, reject) => {
            https.get(`${CFBD_URL}/games?year=2023&seasonType=regular`, CFBD_OPTIONS, res => {
                let data = '';
                res.on('data', chunk => { data += chunk });
                res.on('close', () => {
                    GAMES = JSON.parse(data);
                    console.log(`Retrieved GAMES data`);
                    writeFile('src/data/2023.json', data, 'utf8');
                    resolve(GAMES);
                });
            }).on('error', err => { console.log(err.message); reject(err) });
        });
        let RP = new Promise((resolve, reject) => {
            https.get(`${CFBD_URL}/rankings?year=2023&seasonType=regular`, CFBD_OPTIONS, res => {
                let data = '';
                res.on('data', chunk => { data += chunk });
                res.on('close', () => {
                    RANKINGS = JSON.parse(data);
                    console.log(`Retrieved RANKINGS data`);
                    writeFile('src/data/2023_rankings.json', data, 'utf8');
                    resolve(RANKINGS);
                });
            }).on('error', err => { console.log(err.message); reject(err) });
        })
        let PP = new Promise((resolve, reject) => {
            https.get(`${CFBD_URL}/metrics/wp/pregame?year=2023&seasonType=regular`, CFBD_OPTIONS, res => {
                let data = '';
                res.on('data', chunk => { data += chunk });
                res.on('close', () => {
                    PREGAME = JSON.parse(data);
                    console.log(`Retrieved PREGAME data`);
                    writeFile('src/data/2023_pregame.json', data, 'utf8');
                    resolve(PREGAME);
                });
            }).on('error', err => { console.log(err.message); reject(err) });
        })
        await Promise.all([GP, RP, PP]).then(values => {
            console.log(`Finished with all data retrieval`);
            fixData();
        })
    }
}

export { GAMES, PREGAME, updateData };