DIR=$(dirname "$0")
${DIR}/update.sh
git add src/data/*.json
git commit -m 'Updating games'
git push
