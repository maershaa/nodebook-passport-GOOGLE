const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../schemas/user');

 

// Middleware для проверки аутентификации пользователя
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // Если пользователь аутентифицирован, переходим к следующему обработчику маршрута
  }
  req.flash('message', 'Авторизируйтесь'); // Иначе, выводим сообщение об авторизации
  res.redirect('/'); // и перенаправляем на главную страницу
};

// Маршрут для отображения главной страницы
router.get('/', (req, res, next) => {
  res.render('index', { message: req.flash('message') }); // Отображение главной страницы с возможным сообщением
});

// !auth with google+
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
  (req, res) => {
    // Этот код выполнится после успешного запуска аутентификации
    console.log('Redirected to Google for authentication');
    console.log('User email:', req.user ? req.user.email : 'No user');
    console.log('User email:', req.user.email);
    // В этот момент пользователь уже перенаправлен на страницу входа Google
    // и обратный вызов Passport.js будет выполнен после успешной аутентификации
  }
);

// !callback route for google to redirect to
// hand control to passport to use code to grab profile info
router.get('/auth/google/callback', 
 passport.authenticate('google',{ failureRedirect: '/login' }), (req, res) => {
  console.log('Callback success');
  console.log('User email:', req.user ? req.user.email : 'No user');
  console.log('User email:', req.user.email);
  res.redirect('/');
});

// Маршрут для обработки POST-запроса при входе пользователя
router.post('/', (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) {
      return next(err); // Обработка ошибки аутентификации
    }
    if (!user) {
      req.flash('message', 'Укажите правильный логин и пароль!');
      return res.redirect('/'); // Если пользователь не найден, перенаправляем на главную с сообщением об ошибке
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err); // Обработка ошибки при логине пользователя
      }
      return res.redirect('/profile'); // Перенаправляем на профиль пользователя после успешной аутентификации
    });
  })(req, res, next);
});

// Маршрут для отображения страницы регистрации
router.get('/registration', (req, res, next) => {
  res.render('registration', { message: req.flash('message') }); // Отображение страницы регистрации с возможным сообщением
});

// Маршрут для обработки POST-запроса при регистрации пользователя
router.post('/registration', async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    const user = await User.findOne({ email }); // Поиск пользователя по email в базе данных
    if (user) {
      req.flash('message', 'Пользователь с таким Email уже существует');
      return res.redirect('/registration'); // Если пользователь существует, выводим сообщение и перенаправляем на страницу регистрации
    }
    const newUser = new User({ username, email }); // Создание нового пользователя
    newUser.setPassword(password); // Установка пароля для нового пользователя
    await newUser.save(); // Сохранение пользователя в базе данных
    req.flash('message', 'Вы успешно зарегистрировались');
    res.redirect('/'); // Перенаправляем на главную страницу после успешной регистрации
  } catch (e) {  
    console.error(e);

    next(e); // Обработка ошибок при регистрации
  }
});

// Маршрут для отображения профиля пользователя
router.get('/profile', isLoggedIn, (req, res, next) => {
  const { username, email } = req.user; // Получение данных о пользователе из сессии
  res.render('profile', { username, email }); // Отображение страницы профиля с данными о пользователе
});

// Маршрут для выхода пользователя из системы
router.get('/logout', (req, res) => {
  req.logout(); // Выход пользователя из системы
  res.redirect('/'); // Перенаправление на главную страницу после выхода
});

module.exports = router; // Экспорт роутера для использования в приложении Express
