import { spawn } from 'node:child_process';

const processes = [];

const run = (command, args, name) => {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
    },
  });

  processes.push(child);
  child.on('exit', (code) => {
    if (code !== 0) {
      stop(code ?? 1);
    }
  });

  console.log(`[dev] started ${name}`);
  return child;
};

const stop = (code = 0) => {
  for (const child of processes) {
    if (!child.killed) {
      child.kill();
    }
  }
  process.exit(code);
};

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));

run('npm', ['run', 'dev:server'], 'api server');
run('npm', ['run', 'dev:vite'], 'frontend');
