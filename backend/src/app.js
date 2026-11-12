import express from 'express';
import cors from 'cors';
import config from './config/environment.js';
import corsOptions from './config/corsOptions.js';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Enable CORS with environment-driven options
app.use(cors(corsOptions));

// Express JSON parsing middleware
app.use(express.json({ limit: '10mb' }));

// URL-encoded request body parsing
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API routes under /api/v1
app.use(config.apiPrefix, routes);

// Root route basic ping
app.get('/', (req, res) => {
  res.status(200).json({
    application: config.appName,
    version: '1.0.0',
    documentation: `${config.apiPrefix}/health`
  });
});

// 404 Route Handler for any unmatched path
app.use(notFoundHandler);

// Centralized Error-Handling Middleware
app.use(errorHandler);

export default app;
