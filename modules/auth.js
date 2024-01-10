const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { connectToDatabase } = require('./db');

const generateRandomPassword = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const passwordLength = 8;
  let password = '';

  for (let i = 0; i < passwordLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }

  return password;
};

const initializePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: '261065365530-u01p73nc278q500a8n9jmesum67pitit.apps.googleusercontent.com',
        clientSecret: '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',
        callbackURL: 'http://localhost:3006/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const db = await connectToDatabase();

          const existingUser = await db.collection('users').findOne({ googleId: profile.id });

          if (existingUser) {
            return done(null, existingUser);
          }

          const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
          };

          await db.collection('users').insertOne(newUser);

          return done(null, newUser);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  return passport;
};

module.exports = {initializePassport};
