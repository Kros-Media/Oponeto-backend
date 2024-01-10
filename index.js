const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(helmet());

// Routing
app.get('/', (req, res) => {
  res.send('Witaj na Zoptymalizowanym Backendzie Express.js v2.0.0!');
});

// Dodaj inne ścieżki i routy według potrzeb

// Obsługa błędów
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Coś poszło nie tak!');
});

// Start serwera
app.listen(port, () => {
  console.log(`Serwer działa na http://localhost:${port}`);
});
