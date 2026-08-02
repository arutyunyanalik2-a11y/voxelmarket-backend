const mongoose = require('mongoose');

// Схема товара для базы данных MongoDB
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },           // Название товара
    price: { type: Number, required: true },          // Цена
    category: { type: String, default: '3D Модели' },   // Категория
    description: { type: String },                    // Описание товара
    format: { type: String, default: '.vox' },        // Формат файла
    image: { type: String, required: true },          // Публичная ссылка на изображение из ImageKit
    createdAt: { type: Date, default: Date.now }      // Дата создания товара
});

module.exports = mongoose.model('Product', productSchema);