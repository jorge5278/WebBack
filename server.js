import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import userRoutes from './src/routes/userRoutes.js';
import setupSwagger from './src/config/swaggerConfig.js';

const app = express();

// Permitir múltiples orígenes definidos en CLIENT_URL separados por comas
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS policy: access denied'));
  },
  credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

// Health-check para la ruta raíz
app.get('/', (_, res) => {
  res.send('API funcionando');
});

// Swagger UI
setupSwagger(app);

// APIs bajo /api
app.use('/api', userRoutes);

// Manejo básico de errores CORS
app.use((err, req, res, next) => {
  if (err.message.includes('CORS policy')) {
    return res.status(403).json({ message: err.message });
  }
  next(err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Swagger Docs en http://localhost:${PORT}/api-docs`);
});
