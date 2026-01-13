import app from './app.js';
import type { AppConfig } from './types/index.js';

const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '127.0.0.1'
};

app.listen(config.port, config.host, () => {
  console.log(`🏠 Homestack is running at http://${config.host}:${config.port}`);
  console.log('📦 Connecting to Docker daemon...');
});
