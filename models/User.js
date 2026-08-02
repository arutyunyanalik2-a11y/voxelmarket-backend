const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  avatar: { type: String, default: '' },
  
  // НОВОЕ ПОЛЕ: Массив сохраненных адресов
  addresses: [
    {
      coordinates: [Number], // Координаты: [широта, долгота]
      street: String,        // Название улицы
      isMultiStory: Boolean, // Многоэтажка или нет
      floor: String,         // Этаж
      apartment: String      // Квартира
    }
  ]
});

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', UserSchema);