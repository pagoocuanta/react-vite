import dotenv from 'dotenv';
dotenv.config();

import { createServer as createViteServer } from 'vite';
import { createServer } from './index';

async function startDevServer() {
  console.log('Starting development server...');
  const app = createServer();
  const port = process.env.PORT || 8080;

  try {
    // Create Vite server in middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    // Use vite's connect instance as middleware
    app.use(vite.middlewares);

    app.listen(port, () => {
      console.log(`🚀 Gruppy dev server running on http://localhost:${port}`);
      console.log(`📊 API endpoints available at http://localhost:${port}/api/`);
      console.log(`🏥 Health check: http://localhost:${port}/api/health`);
      console.log(`🔥 Hot reload enabled for both client and server`);
    });
  } catch (error) {
    console.error('Failed to start dev server:', error);
    process.exit(1);
  }
}

startDevServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully');
  process.exit(0);
});
