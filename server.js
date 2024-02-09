const express = require("express");
const flash = require("connect-flash");
const passport = require("passport");
const path = require("path");
const session = require("express-session");
const mongoose = require("mongoose");
require('dotenv').config();

// Установка глобального промиса для Mongoose
mongoose.Promise = global.Promise;

// Подключение к базе данных MongoDB
mongoose.connect(process.env.DB_HOST, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
}).catch(console.log);

// Инициализация Express-приложения
const app = express();

// Установка директории для шаблонов и движка EJS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Подключение middleware для обработки данных форм
app.use(express.urlencoded({ extended: false }));

// Подключение middleware для обслуживания статических файлов
app.use(express.static(path.join(__dirname, "public")));

// Подключение middleware для работы с сессиями
app.use(
  session({
    secret: "secret-word",
    key: "session-key",
    cookie: {
      path: "/",
      httpOnly: true,
      maxAge: null
    },
    saveUninitialized: false,
    resave: false
  })
);

// Подключение middleware для Flash-сообщений
app.use(flash());

// Подключение файла конфигурации Passport
require("./config/config-passport");

// Инициализация Passport
app.use(passport.initialize());

// Подключение middleware для работы с сессиями Passport
app.use(passport.session());

// Подключение маршрутов из файла index.js
const indexRouter = require("./routes/index");
app.use("/", indexRouter);

// Обработка ошибки, если маршрут не найден
app.use((req, res, next) => {
  console.log(req.method, req.url)
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// Обработка ошибок в разработке и в режиме production
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});
// Установка порта для прослушивания сервера
const port = process.env.PORT || "3000";

// Запуск сервера на указанном порту
app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
