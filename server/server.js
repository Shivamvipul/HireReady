const env = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');

(async () => {
  try {
    await connectDB();
    app.listen(env.port, () => console.log(`HireReady API running on :${env.port} (${env.nodeEnv})`));
  } catch (e) {
    console.error('Failed to start server:', e.message);
    process.exit(1);
  }
})();
