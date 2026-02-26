import 'dotenv/config';
import { execSync } from 'node:child_process';

function getPort() {
  const raw = process.env.API_PORT || process.env.PORT || '4001';
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 4001;
}

function killWindows(port) {
  const output = execSync('netstat -ano -p tcp', { encoding: 'utf8' });
  const lines = output.split(/\r?\n/);
  const pids = new Set();

  for (const line of lines) {
    if (!line.includes(`:${port}`) || !/LISTENING/i.test(line)) continue;
    const match = line.trim().match(/\s(\d+)$/);
    if (!match) continue;
    pids.add(Number(match[1]));
  }

  for (const pid of pids) {
    if (!Number.isFinite(pid) || pid <= 0 || pid === process.pid) continue;
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      console.log(`[dev] Freed API port ${port} by stopping PID ${pid}`);
    } catch {
      console.warn(`[dev] Could not stop PID ${pid} on port ${port}`);
    }
  }
}

function killUnix(port) {
  try {
    const output = execSync(`lsof -ti tcp:${port} -sTCP:LISTEN`, { encoding: 'utf8' });
    const pids = output
      .split(/\r?\n/)
      .map((line) => Number(line.trim()))
      .filter((pid) => Number.isFinite(pid) && pid > 0 && pid !== process.pid);

    for (const pid of pids) {
      try {
        process.kill(pid, 'SIGKILL');
        console.log(`[dev] Freed API port ${port} by stopping PID ${pid}`);
      } catch {
        console.warn(`[dev] Could not stop PID ${pid} on port ${port}`);
      }
    }
  } catch {
  }
}

function main() {
  const port = getPort();

  try {
    if (process.platform === 'win32') {
      killWindows(port);
    } else {
      killUnix(port);
    }
  } catch {
    console.warn(`[dev] Port pre-check skipped for ${port}`);
  }
}

main();
