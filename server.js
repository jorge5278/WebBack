import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import userRoutes from './src/routes/userRoutes.js';
import setupSwagger from './src/config/swaggerConfig.js';

const app = express();

// CORS: solo permitimos tu front en Vercel
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_, res) => {
  res.send('API funcionando');
});

setupSwagger(app);

app.use('/api', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Swagger Docs en http://localhost:${PORT}/api-docs`);
});
