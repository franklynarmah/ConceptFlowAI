import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import explainRouter from './routes/explain.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api', explainRouter);

app.listen(PORT, () => {
  console.log(`ConceptFlow backend → http://localhost:${PORT}`);
});
