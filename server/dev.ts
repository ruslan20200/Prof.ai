import 'dotenv/config';
import { createServer } from 'http';
import { createApp } from './app';

async function startDevServer() {
  const app = createApp();
  const server = createServer(app);
  const port = Number(process.env.PORT || process.env.API_PORT || 4000);

  server.listen(port, () => {
    console.log(`API dev server running on http://localhost:${port}`);
  });
}

startDevServer().catch((error) => {
  console.error('Failed to start API dev server', error);
  process.exit(1);
});
