import config from '../config/environment.js';

/**
 * Health check controller
 * Confirms that the backend service is up and responsive.
 * Does not require authentication or database connectivity.
 */
export const getHealth = (req, res) => {
  return res.status(200).json({
    success: true,
    status: 'UP',
    application: config.appName,
    message: 'Backend is running successfully'
  });
};

export default {
  getHealth
};
