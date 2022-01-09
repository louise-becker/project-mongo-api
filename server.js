import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
// import listEndpoints from 'express-list-endpoints';

// If you're using one of our datasets, uncomment the appropriate import below
// to get started!
//
import goldenGlobesData from './data/golden-globes.json';
// import avocadoSalesData from './data/avocado-sales.json'
// import booksData from './data/books.json'
// import netflixData from './data/netflix-titles.json'
// import topMusicData from './data/top-music.json'

const mongoUrl =
  process.env.MONGO_URL || 'mongodb://localhost/project-mongo-api';
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(bodyParser.json());

//Setting up Mongoose model for each nomination
const NominationInfo = mongoose.model('NominationInfo', {
  year_film: String,
  year_award: String,
  ceremony: String,
  category: String,
  nominee: String,
  film: String,
  win: Boolean,
});

//Only keep seedDatabase when setting it up. Remember to comment out/delete when going live!!!
//Otherwise it will keep deleting the old info everytime the server is run

if (process.env.RESET_DB) {
  const seedDatabase = async () => {
    await NominationInfo.deleteMany({});

    goldenGlobesData.forEach((item) => {
      const newNominationInfo = new NominationInfo(item);
      newNominationInfo.save();
    });
  };
  // Don't forget to invoke the seedDatabase function
  seedDatabase();
}

// Our own middleware that checks if the database is connected before going forward to our endpoints
app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next();
  } else {
    res.status(503).json({ error: 'Service unavailable' });
  }
});

// first endpoint
app.get('/', (req, res) => {
  res.send(
    'This is the Golden Globes. Or at least a list of nominations. Look at /movies'
  );
});

// get all movies
app.get('/movies', async (req, res) => {
  // console.log(req.query);
  let movies = await NominationInfo.find(req.query);
  res.json(goldenGlobesData);
});

// get one nominated movie (nominee) based on name
app.get('/movies/nominee/:name', async (req, res) => {
  try {
    const nomineeByName = await NominationInfo.findOne({
      name: req.params.nominee,
    });
    if (nomineeByName) {
      res.json(nomineeByName);
    } else {
      res.status(404).json({ error: 'Movie not found' });
    }
  } catch (err) {
    res.status(400).json({ error: 'Name is invalid' });
  }
});

// Start the server
app.listen(port, () => {
  // eslint-disable-next-line
  console.log(`Server running on http://localhost:${port}`);
});
