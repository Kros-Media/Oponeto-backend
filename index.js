const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const { connectToDatabase, getUsersCollection } = require('./modules/db');
const articleController = require('./modules/articleControler');
const { initializePassport } = require('./modules/auth');

const app = express();
const port = process.env.PORT || 3006

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true, // Dodaj tę linijkę
};

app.use(cors(corsOptions));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
  })
);


initializePassport();

app.use(passport.initialize());
app.use(passport.session());

app.use('/', articleController);

app.get('/getUserByGoogleId/:googleId', async (req, res) => {
  const googleId = req.params.googleId;

  try {
    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ googleId });

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user by Google ID:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const googleId = req.user && req.user.googleId;
    if (googleId) {
      res.cookie('googleId', googleId);
    }
    res.redirect('http://localhost:3000');
  }
);

app.get('/logout', (req, res) => {
  req.logout();
  res.clearCookie('googleId');
  res.redirect('/');
});

const checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

app.get('/dashboard', checkAuthenticated, (req, res) => {
  res.send(`Hello ${req.user.displayName}!`);
});

app.post(
  '/auth/register',
  passport.authenticate('local-register', {
    successRedirect: '/dashboard',
    failureRedirect: '/',
    failureFlash: true,
  })
);

async function startServer() {
  try {
    await connectToDatabase();
    app.listen(port, () => {
      console.log(`Serwer działa na http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Błąd podczas uruchamiania serwera:', error);
  }
}

startServer();
