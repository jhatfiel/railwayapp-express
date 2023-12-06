DIR=$(dirname "$0")
. ${DIR}/.env
curl -X GET "https://api.collegefootballdata.com/games?year=2023" -H  "accept: application/json" -H  "Authorization: Bearer $CFBD_TOKEN" -o src/data/2023.json
curl -X GET "https://api.collegefootballdata.com/games?year=2023&seasonType=postseason" -H  "accept: application/json" -H  "Authorization: Bearer $CFBD_TOKEN" -o src/data/2023P.json
curl -X GET "https://api.collegefootballdata.com/rankings?year=2023" -H  "accept: application/json" -H  "Authorization: Bearer $CFBD_TOKEN" -o src/data/2023_rankings.json
curl -X GET "https://api.collegefootballdata.com/metrics/wp/pregame?year=2023" -H  "accept: application/json" -H  "Authorization: Bearer $CFBD_TOKEN" -o src/data/2023_pregame.json
curl -X GET "https://api.collegefootballdata.com/metrics/wp/pregame?year=2023&seasonType=postseason" -H  "accept: application/json" -H  "Authorization: Bearer $CFBD_TOKEN" -o src/data/2023P_pregame.json
