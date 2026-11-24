import 'dotenv/config'; // loads values from my .env file into process.env
import db from './config/connection.js'
import express from 'express'; // imwporting express to build a server and api routes.
import routes from './routes/index.js';


const app = express();
const PORT = process.env.PORT || 3001;

//then we use app ro add routes, middleware and to start the server.

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
 
app.use(routes);
 
db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});