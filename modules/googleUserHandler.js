// modules/googleUserHandler.js
const cors = require('cors')
const User = require('./user');

app.use(cors());

const handleGoogleUser = async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Próba znalezienia użytkownika w bazie danych...', profile.id);
    const user = await User.findOne({ googleId: profile.id }).lean();

    if (!user) {
      console.log('Użytkownik nie istnieje. Tworzenie nowego użytkownika...');
      const newUser = {
        googleId: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value,
      };

      const createdUser = await User.create(newUser);
      console.log('Użytkownik pomyślnie dodany do bazy danych.', createdUser);
      return done(null, createdUser);
    } else {
      console.log('Znaleziono istniejącego użytkownika w bazie danych.', user);
      return done(null, user);
    }
  } catch (error) {
    console.error('Błąd podczas obsługi użytkownika Google:', error);
    return done(error);
  }
};

module.exports = { handleGoogleUser };
