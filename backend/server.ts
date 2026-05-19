import express from 'express';
import cors from 'cors';

const app = express();
const port = 5500;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});