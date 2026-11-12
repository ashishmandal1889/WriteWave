import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  appName: 'WriteWave',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/writewave',
  jwtSecret: process.env.JWT_SECRET || 'writewave_jwt_super_secret_key_development_only',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
};

export default config;
