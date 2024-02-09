const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../schemas/user");
require("dotenv").config();
const {BASE_URL, GOOGLE_CLIENT_SECRET, GOOGLE_CLIENT_ID } = process.env;

// Сериализация пользователя (сохранение идентификатора пользователя в сессии)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Десериализация пользователя (поиск пользователя по идентификатору из сессии)
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// Настройка стратегии локальной аутентификации
passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    // Поиск пользователя в базе данных по электронной почте
    User.findOne({ email })
      .then((user) => {
        // Проверка наличия пользователя
        if (!user) {
          return done(null, false);
        }

        // Проверка совпадения пароля
        if (!user.validPassword(password)) {
          return done(null, false);
        }

        // Возвращение пользователя в колбэк, если аутентификация прошла успешно
        return done(null, user);
      })
      .catch((err) => done(err));
  })
);

//! Настройка стратегии Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      // callbackURL: 'http://localhost:3000/auth/google/callback',
      callbackURL: `${BASE_URL}/auth/google/callback` ,
      state: true // !хз надо ли
    },
    function (accessToken, refreshToken, profile, done) {
      console.log('accessToken:', accessToken);
      console.log('refreshToken:', refreshToken);
      // console.log('profile:', profile);
      console.log('profile:', JSON.stringify(profile, null, 2));


         
         
         // Поиск или создание пользователя в базе данных по профилю Google
      User.findOne({ googleId: profile.id })
        .then((currentUser) => {
          if (currentUser) {
            // Если пользователь уже существует, вернуть его
            console.log("Created new user:", user);
            return done(null, currentUser);
          } else {
            // Если пользователя нет, создать нового пользователя на основе профиля Google
            const newUser = new User({
              googleId: profile.id,
              displayName: profile.displayName
            });

            // Сохранить нового пользователя в базе данных
            newUser
              .save()
              .then((user) => {
                console.log("created new user: ", user);
                done(null, user);
              })
              .catch((err) => {
                console.error("Error saving new user:", err);
                done(err);
              });
          }
        })
        .catch((err) => {
          console.error("Error searching for user:", err);
          done(err);
        });
    }
  )
);
