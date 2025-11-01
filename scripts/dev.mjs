import { spawn } from 'child_process';

console.log('🚀 Starting development environment...\n');

// Start the Express server
const server = spawn('npx', ['tsx', 'watch', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true
});

// Start Vite
const vite = spawn('npx', ['vite'], {
  stdio: 'inherit',
  shell: true
});

// Handle process termination
const cleanup = () => {
  console.log('\n\n🛑 Shutting down development servers...');
  server.kill();
  vite.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  cleanup();
});

vite.on('error', (err) => {
  console.error('❌ Vite error:', err);
  cleanup();
});
