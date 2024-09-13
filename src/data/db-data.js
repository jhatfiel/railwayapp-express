import { statSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import * as https from 'https';

let stale = 1000 * 60 * 60; // (1 hour)
let CFBD_URL = 'https://api.collegefootballdata.com'
let CFBD_OPTIONS = { headers: {accept: 'application/json', Authorization: `Bearer ${process.env['CFBD_TOKEN']}`}}
let latestRankingWeek = 1;
let lastUpdated = 0;
try { lastUpdated = statSync('src/data/2024.json').mtimeMs; } catch (err) {}
let GAMES;
let GAMESP;
let RANKINGS;
let PREGAME;
let PREGAMEP;

await updateData();

function fixData() {
    let latestWeek = GAMES[GAMES.length-1].week;
    console.log('last week', latestWeek);
    GAMESP.forEach(game => { game.week = latestWeek+1; GAMES.push(game); })
    PREGAMEP.forEach(pg => { PREGAME.push(pg); })

    latestRankingWeek = RANKINGS.filter(r => r.polls.some(p => p.poll === 'AP Top 25' || p.poll === 'Playoff Committee Rankings')).reduce((acc, r) => Math.max(acc, r.week), 0);

    GAMES.forEach(game => {
        let rForWeek = RANKINGS.filter(r => r.season === game.season && r.week === Math.min(latestRankingWeek, game.week)).map(r => r.polls.filter(p => p.poll === 'Playoff Committee Rankings').flat()).flat().map(p => p.ranks).flat();
        if (rForWeek.length === 0) rForWeek = RANKINGS.filter(r => r.season === game.season && r.week === Math.min(latestRankingWeek, game.week)).map(r => r.polls.filter(p => p.poll === 'AP Top 25').flat()).flat().map(p => p.ranks).flat();
        rForWeek.filter(r => r.school === game.home_team && r.conference === game.home_conference).forEach(r => game.home_team_ranking = r.rank);
        rForWeek.filter(r => r.school === game.away_team && r.conference === game.away_conference).forEach(r => game.away_team_ranking = r.rank);
    })
}

async function updateData() {
    if (Date.now() - lastUpdated > stale) {
        console.log(`Updating data ${CFBD_URL} because ${Math.round((Date.now() - lastUpdated)/1000)} seconds have passed`);
        let GP = new Promise((resolve, reject) => {
            https.get(`${CFBD_URL}/games?year=2024`, CFBD_OPTIONS, res => {
                let data = '';
                res.on('data', chunk => { data += chunk });
                res.on('close', () => {
                    GAMES = JSON.parse(data);
                    console.log(`Retrieved GAMES data`);
                    writeFile('src/data/2024.json', data, 'utf8');
                    resolve(GAMES);
                });
            }).on('error', err => { console.log(err.message); reject(err) });
        });
        let GPP = new Promise((resolve, reject) => {
            https.get(`${CFBD_URL}/games?year=2024&seasonType=postseason`, CFBD_OPTIONS, res => {
                let data = '';
                res.on('data', chunk => { data += chunk });
                res.on('close', () => {
                    GAMESP = JSON.parse(data);
                    console.log(`Retrieved GAMESP data`);
                    writeFile('src/data/2024P.json', data, 'utf8');
                    resolve(GAMESP);
                });
            }).on('error', err => { console.log(err.message); reject(err) });
        });
        let RP = new Promise((resolve, reject) => {
            https.get(`${CFBD_URL}/rankings?year=2024`, CFBD_OPTIONS, res => {
                let data = '';
                res.on('data', chunk => { data += chunk });
                res.on('close', () => {
                    RANKINGS = JSON.parse(data);
                    console.log(`Retrieved RANKINGS data`);
                    writeFile('src/data/2024_rankings.json', data, 'utf8');
                    resolve(RANKINGS);
                });
            }).on('error', err => { console.log(err.message); reject(err) });
        })
        let PP = new Promise((resolve, reject) => {
            https.get(`${CFBD_URL}/metrics/wp/pregame?year=2024`, CFBD_OPTIONS, res => {
                let data = '';
                res.on('data', chunk => { data += chunk });
                res.on('close', () => {
                    PREGAME = JSON.parse(data);
                    console.log(`Retrieved PREGAME data`);
                    writeFile('src/data/2024_pregame.json', data, 'utf8');
                    resolve(PREGAME);
                });
            }).on('error', err => { console.log(err.message); reject(err) });
        })
        let PPP = new Promise((resolve, reject) => {
            https.get(`${CFBD_URL}/metrics/wp/pregame?year=2024&seasonType=postseason`, CFBD_OPTIONS, res => {
                let data = '';
                res.on('data', chunk => { data += chunk });
                res.on('close', () => {
                    PREGAMEP = JSON.parse(data);
                    console.log(`Retrieved PREGAMEP data`);
                    writeFile('src/data/2024P_pregame.json', data, 'utf8');
                    resolve(PREGAMEP);
                });
            }).on('error', err => { console.log(err.message); reject(err) });
        })
        await Promise.all([GP, GPP, RP, PP, PPP]).then(values => {
            console.log(`Finished with all data retrieval`);
            lastUpdated = new Date();
        })
    } else {
        GAMES = JSON.parse(await readFile('src/data/2024.json', 'utf8'));
        GAMESP = JSON.parse(await readFile('src/data/2024P.json', 'utf8')); 
        RANKINGS = JSON.parse(await readFile('src/data/2024_rankings.json', 'utf8'));
        PREGAME = JSON.parse(await readFile('src/data/2024_pregame.json', 'utf8'));
        PREGAMEP = JSON.parse(await readFile('src/data/2024P_pregame.json', 'utf8'));
    }

    fixData();
}

export { GAMES, PREGAME, updateData, lastUpdated };