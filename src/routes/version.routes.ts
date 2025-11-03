import { Router } from 'express';
import { execSync } from 'node:child_process';
import os from 'node:os';

const router = Router();

router.get('/', (_req, res) => {
  let commit = 'unknown';
  try {
    commit = execSync('git rev-parse --short HEAD', { stdio: ['ignore','pipe','ignore'] })
      .toString().trim();
  } catch {}
  res.json({
    ok: true,
    service: 'betforbes-backend',
    version: process.env.APP_VERSION || process.env.BUILD_VERSION || '1.0.0',
    commit,
    pid: process.pid,
    node: process.version,
    uptimeSec: Math.round(process.uptime()),
    host: os.hostname()
  });
});

export default router;
