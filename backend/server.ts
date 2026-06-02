import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import restaurantRouter from './routes/restaurants';
import { loadDataFile } from './dataStore';
import authRouter from './routes/auth';
import favouritesRouter from './routes/favourites';

loadDataFile();
const app = express();
const port = 5500;

app.use(cors());
app.use(express.json());
app.use('/', authRouter);
app.use('/', restaurantRouter);
app.use('/favourites', favouritesRouter);

app.get("/", (req, res) => {
  res.send("Backend is running"); // For Debug purposes
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
