import express, { text } from 'express';
import cors from 'cors';
import mongoose, { Number } from 'mongoose';
import listEndpoints from 'express-list-endpoints';

// If you're using one of our datasets, uncomment the appropriate import below
// to get started!
//
import goldenGlobesData from './data/golden-globes.json';
// import avocadoSalesData from './data/avocado-sales.json'
// import booksData from './data/books.json'
// import netflixData from './data/netflix-titles.json'
// import topMusicData from './data/top-music.json'

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/project-mongo';
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
app.use(express.json());

//Setting up Mongoose model for each nomination
const NominationInfo = mongoose.model('NominationInfo', {
  year_film: Date,
  year_award: Date,
  // ceremony: Number,
  // category: Text,
  // nominee: Text,
  // film: Text,
  win: Boolean,
});

//Only keep seedDatabase when setting it up. Remember to comment out/delete when going live!!!
//Otherwise it will keep deleting the old info everytime the server is run

if (process.env.RESET_DB) {
  const seedDatabase = async () => {
    await NominationInfo.deleteMany({});

    NominationInfo.forEach((Movie) => {
      const newNominationInfo = new NominationInfo(Movie);
      newNominationInfo.save();
    });
  };

  // Start defining your routes here
  app.get('/', (req, res) => {
    res.send(
      'This is the Golden Globes. Or at least a list of nominations. Look at /endpoints'
    );
  });

  app.get('/endpoints', (req, res) => {
    res.send(listEndpoints(app));
  });

  app.get('/movies', (req, res) => {
    res.json(goldenGlobesData);
  });
}

// Start the server
app.listen(port, () => {
  // eslint-disable-next-line
  console.log(`Server running on http://localhost:${port}`);
});
