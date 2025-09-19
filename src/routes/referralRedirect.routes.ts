import { Router } from 'express';

const router = Router();

router.get('/r/:code', (req, res) => {
  const code = (req.params.code || '').toUpperCase();
  if (/^[A-Z0-9]{6,12}$/.test(code)) {
    res.cookie('bf_ref', code, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
  return res.redirect(302, `https://www.betforbes.com/cadastro?ref=${encodeURIComponent(code)}`);
});

export default router;
