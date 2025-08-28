DIR=$(dirname "$0")
. ${DIR}/.env
curl -X GET "https://api.collegefootballdata.com/games?year=2025" -H  "accept: application/json" -H  "Authorization: Bearer $CFBD_TOKEN" -o src/data/2025.json
curl -X GET "https://api.collegefootballdata.com/games?year=2025&seasonType=postseason" -H  "accept: application/json" -H  "Authorization: Bearer $CFBD_TOKEN" -o src/data/2025P.json
curl -X GET "https://api.collegefootballdata.com/rankings?year=2025" -H  "accept: application/json" -H  "Authorization: Bearer $CFBD_TOKEN" -o src/data/2025_rankings.json
curl -X GET "https://api.collegefootballdata.com/metrics/wp/pregame?year=2025" -H  "accept: application/json" -H  "Authorization: Bearer $CFBD_TOKEN" -o src/data/2025_pregame.json
curl -X GET "https://api.collegefootballdata.com/metrics/wp/pregame?year=2025&seasonType=postseason" -H  "accept: application/json" -H  "Authorization: Bearer $CFBD_TOKEN" -o src/data/2025P_pregame.json
