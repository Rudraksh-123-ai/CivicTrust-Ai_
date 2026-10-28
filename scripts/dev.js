import { spawn } from 'node:child_process';

const processes = [
  spawn(process.execPath, ['server.js'], { stdio: 'inherit' }),
  spawn(process.execPath, ['backend/server.js'], { stdio: 'inherit' })
];
let shuttingDown = false;

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of processes) {
    if (!child.killed) child.kill();
  }
  process.exitCode = exitCode;
}

for (const child of processes) {
  child.on('error', error => {
    console.error('Unable to start CivicTrust service:', error);
    shutdown(1);
  });
  child.on('exit', (code, signal) => {
    if (!shuttingDown) {
      console.error(`CivicTrust service stopped (${signal || code}).`);
      shutdown(code || 1);
    }
  });
}

process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());
