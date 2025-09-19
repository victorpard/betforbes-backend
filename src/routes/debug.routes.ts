import { Router, Request, Response } from 'express';
import { microcache } from '../middlewares/microcache';

const debugRouter = Router();

debugRouter.get('/echo-auth', (req: Request, res: Response) => {
  const h = req.headers.authorization;
  const masked = typeof h === 'string'
    ? h.replace(/(Bearer\s+)(.{8}).+/, '$1$2…')
    : h;
  res.json({ auth: masked, ip: req.ip, xff: req.headers['x-forwarded-for'] });
});

debugRouter.get('/mc',
  microcache({ ttlMs: 3000, key: (req: Request) => `mc:${req.ip}` }),
  (_req: Request, res: Response) => res.json({ ok: true, now: Date.now() })
);

export default debugRouter;
