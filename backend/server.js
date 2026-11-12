import app from './src/app.js';
import config from './src/config/environment.js';
import connectDB from './src/config/db.js';

const PORT = config.port;

// Connect to MongoDB and start HTTP listener
const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`===============================================`);
    console.log(`🚀 ${config.appName} Independent Publishing Platform`);
    console.log(`📡 Port:        ${PORT}`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}${config.apiPrefix}/health`);
    console.log(`💻 Client URL:  ${config.clientUrl}`);
    console.log(`===============================================`);
  });

  // Handle unhandled Promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception thrown:', err);
    process.exit(1);
  });

  // Handle graceful shutdown on process termination signals
  const handleGracefulShutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('💤 HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
};

startServer();
