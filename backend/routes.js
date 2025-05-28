// routes.js
const { Router } = require('express');
const router = Router();

router.get('/me', (req, res) => {
  // Si usas sesión:
  if (!req.session.userId) {
    return res.sendStatus(401);
  }
  // Busca usuario en DB y devuelve…
  res.json({ username: 'juan', email: 'juan@ejemplo.com', bio: '', avatar: null, ratings: [] });
});

module.exports = router;
