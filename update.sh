. ./.env
DIR=$(dirname "$0")
curl -X GET "https://api.collegefootballdata.com/games?year=2023&seasonType=regular" -H  "accept: application/json" -H  "Authorization: Bearer $CFBD_TOKEN" -o src/data/2023.json
curl -X GET "https://api.collegefootballdata.com/rankings?year=2023&seasonType=regular" -H  "accept: application/json" -H  "Authorization: Bearer $CFBD_TOKEN" -o src/data/2023_rankings.json