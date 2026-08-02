const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// 1. Создать новый заказ
router.post('/', async (req, res) => {
    try {
        const { userEmail, productName, productImage, price, phone, address, coordinates } = req.body;

        if (!userEmail || !phone || !address || !coordinates || (Array.isArray(coordinates) && coordinates.length === 0)) {
            return res.status(400).json({ message: "Укажите email, номер телефона, адрес и точные координаты" });
        }

        // Генерируем случайный 6-значный код (например: "482910")
        const secureCode = Math.floor(100000 + Math.random() * 900000).toString();

        const newOrder = new Order({
            userEmail,
            productName,
            productImage,
            price,
            phone,
            address,
            coordinates,
            code: secureCode
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (err) {
        console.error("Ошибка при создании заказа:", err);
        res.status(500).json({ message: "Ошибка сервера при оформлении заказа", error: err.message });
    }
});

// 2. Получить все заказы (для админ-панели)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "Ошибка при получении заказов", error: err.message });
    }
});

// 3. Получить заказы конкретного пользователя (для профиля)
router.get('/user/:email', async (req, res) => {
    try {
        const orders = await Order.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "Ошибка при получении заказов пользователя", error: err.message });
    }
});

// 4. Удалить / завершить заказ (когда в админке нажимаешь забрать/завершить)
router.delete('/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: "Заказ успешно завершен и удален из базы" });
    } catch (err) {
        res.status(500).json({ message: "Ошибка при удалении заказа", error: err.message });
    }
});

module.exports = router;