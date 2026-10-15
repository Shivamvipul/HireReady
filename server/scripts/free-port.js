const { execSync } = require('node:child_process');

const port = Number(process.argv[2] || 8000);

function getWindowsListeningPids(portToCheck) {
  try {
    const output = execSync('netstat -ano -p tcp', { encoding: 'utf8' });
    const lines = output.split(/\r?\n/);
    const pids = new Set();

    for (const line of lines) {
      if (!line.includes('LISTENING')) continue;
      if (!line.includes(`:${portToCheck}`)) continue;
      const pidMatch = line.match(/\s(\d+)\s*$/);
      if (pidMatch) {
        const pid = Number(pidMatch[1]);
        if (pid > 0) pids.add(pid);
      }
    }

    return [...pids];
  } catch {
    return [];
  }
}

function getUnixListeningPids(portToCheck) {
  try {
    const output = execSync(`lsof -t -iTCP:${portToCheck} -sTCP:LISTEN`, { encoding: 'utf8' });
    return output.split(/\r?\n/).map((x) => Number(x.trim())).filter((x) => Number.isFinite(x) && x > 0);
  } catch {
    return [];
  }
}

function killPids(pids) {
  for (const pid of pids) {
    try {
      if (process.platform === 'win32') {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      } else {
        process.kill(pid, 'SIGKILL');
      }
      console.log(`Stopped stale process ${pid} on port ${port}`);
    } catch {
      // Ignore any process that disappears in the meantime.
    }
  }
}

function main() {
  const pids = process.platform === 'win32'
    ? getWindowsListeningPids(port)
    : getUnixListeningPids(port);

  if (!pids.length) {
    console.log(`Port ${port} is free.`);
    return;
  }

  console.log(`Port ${port} is in use. Clearing stale process...`);
  killPids(pids);
}

main();
