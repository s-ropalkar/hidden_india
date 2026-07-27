import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BACKEND = path.join(ROOT, 'backend');
const FRONTEND = path.join(ROOT, 'final_hidden_india');

const isWin = process.platform === 'win32';
const py = isWin
  ? path.join(BACKEND, 'venv', 'Scripts', 'python.exe')
  : path.join(BACKEND, 'venv', 'bin', 'python');
const pip = isWin
  ? path.join(BACKEND, 'venv', 'Scripts', 'pip.exe')
  : path.join(BACKEND, 'venv', 'bin', 'pip');

function run(cmd, args, cwd, label) {
  const child = spawn(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: isWin,
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
  });
  child.on('exit', (code) => {
    if (code !== 0 && code !== null) console.error(`[${label}] exited with code ${code}`);
  });
  return child;
}

async function setupBackend() {
  if (!existsSync(py)) {
    console.log('Creating Python virtual environment...');
    await new Promise((resolve, reject) => {
      const venv = spawn('python', ['-m', 'venv', 'venv'], { cwd: BACKEND, stdio: 'inherit', shell: isWin });
      venv.on('exit', (c) => (c === 0 ? resolve() : reject(new Error('venv failed'))));
    });
  }

  console.log('Installing backend dependencies...');
  await new Promise((resolve) => {
    const trusted = ['--trusted-host', 'pypi.org', '--trusted-host', 'files.pythonhosted.org'];
    const p = spawn(pip, ['install', ...trusted, '-r', 'requirements.txt', '-q'], {
      cwd: BACKEND,
      stdio: 'inherit',
      shell: isWin,
    });
    p.on('exit', () => resolve());
  });

  if (!existsSync(path.join(BACKEND, '.env'))) {
    const fs = await import('node:fs/promises');
    await fs.copyFile(path.join(BACKEND, '.env.example'), path.join(BACKEND, '.env'));
  }

  console.log('Seeding India catalog if needed...');
  await new Promise((resolve) => {
    const seed = spawn(py, ['seed.py'], { cwd: BACKEND, stdio: 'inherit', shell: isWin });
    seed.on('exit', (code) => {
      if (code !== 0) {
        console.warn('\n⚠ Seed step failed — API may still start if MongoDB is running.');
        console.warn('  Check backend/.env → MONGO_URI=mongodb://localhost:27017/hidden_india');
        console.warn('  Re-seed later: npm run seed\n');
      }
      resolve();
    });
  });
}

async function setupFrontend() {
  const nm = path.join(FRONTEND, 'node_modules');
  if (!existsSync(nm)) {
    console.log('Installing frontend dependencies...');
    await new Promise((resolve) => {
      const p = spawn(isWin ? 'npm.cmd' : 'npm', ['install'], { cwd: FRONTEND, stdio: 'inherit', shell: isWin });
      p.on('exit', () => resolve());
    });
  }
}

async function main() {
  console.log('\n🇮🇳 Hidden India Explorer — starting full stack...\n');
  await setupFrontend();
  await setupBackend();

  const backend = run(py, ['app.py'], BACKEND, 'API');
  const frontend = run(isWin ? 'npm.cmd' : 'npm', ['run', 'dev'], FRONTEND, 'UI');

  console.log('\n✓ Backend API  → http://localhost:5000/api/health');
  console.log('✓ Frontend UI  → http://localhost:3000\n');
  console.log('Demo accounts (after seed):');
  console.log('  Admin:    admin@hiddenindia.in / Admin@123');
  console.log('  Explorer: aryan@explorer.in / Explorer@123\n');

  const shutdown = () => {
    backend.kill();
    frontend.kill();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
