import express from "express";
import { GamesRouter } from "./routes/games.route.js";

const app = express();

app.use('/api/games', GamesRouter);

// the port that the process listens on is automatically set by railway,
// so you don't need to set the PORT manually on your service.
// it defaults to port 3000 when the PORT environment variable is not set,
// so you can access your app at http://localhost:3000 when running locally with `npm run dev`
//
// if you want to have the same environment variables that you've set on the railway dashboard,
// check out the cli at https://github.com/railwayapp/cli
const port = process.env.PORT || 3000;

// the final step is to start your app using the following code:
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
