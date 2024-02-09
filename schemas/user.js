const mongoose = require('mongoose');
const bCrypt = require('bcryptjs');

const Schema = mongoose.Schema;

// Определение схемы пользователя
const userSchema = new Schema({
  username: String, // Имя пользователя (необязательное поле)
  email: {
    type: String,
    required: [true, 'Email required'], // Обязательное поле с сообщением об ошибке, если не указано
    unique: true, // Уникальность почтового адреса
  },
  password: {
    type: String,
    required: [false], // Обязательное поле с сообщением об ошибке, если не указано
  },
});

// Метод для установки пароля пользователя
userSchema.methods.setPassword = function (password) {
  this.password = bCrypt.hashSync(password, bCrypt.genSaltSync(6)); // Хеширование пароля перед сохранением
};

// Метод для проверки введенного пароля
userSchema.methods.validPassword = function (password) {
  return bCrypt.compareSync(password, this.password); // Сравнение хеша введенного пароля с хешем сохраненного пароля
};

// Создание модели пользователя на основе схемы
const User = mongoose.model('user', userSchema);

module.exports = User; // Экспорт модели пользователя
