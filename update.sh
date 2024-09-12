DIR=$(dirname "$0")
. ${DIR}/.env
curl -X GET "https://api.collegefootballdata.com/games?year=2024" -H  "accept: application/json" -H  "Authorization: Bearer $CFBD_TOKEN" -o src/data/2024.json
curl -X GET "https://api.collegefootballdata.com/games?year=2024&seasonType=postseason" -H  "accept: application/json" -H  "Authorization: Bearer $CFBD_TOKEN" -o src/data/2024P.json
curl -X GET "https://api.collegefootballdata.com/rankings?year=2024" -H  "accept: application/json" -H  "Authorization: Bearer $CFBD_TOKEN" -o src/data/2024_rankings.json
curl -X GET "https://api.collegefootballdata.com/metrics/wp/pregame?year=2024" -H  "accept: application/json" -H  "Authorization: Bearer $CFBD_TOKEN" -o src/data/2024_pregame.json
curl -X GET "https://api.collegefootballdata.com/metrics/wp/pregame?year=2024&seasonType=postseason" -H  "accept: application/json" -H  "Authorization: Bearer $CFBD_TOKEN" -o src/data/2024P_pregame.json
