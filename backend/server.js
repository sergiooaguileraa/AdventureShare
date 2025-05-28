// server.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const routes = require('./routes');

const app = express();

// 1) CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// 2) Sesión con SameSite=None y Secure
app.use(session({
  secret: 'un-secreto-muy-seguro',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,      // <–– obliga a que el navegador envíe la cookie sólo si viene con HTTPS o en localhost
    sameSite: 'none'   // <–– permite que la cookie viaje en peticiones XHR cross-site
  }
}));

app.use(express.json());
app.use('/api', routes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
