const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');

// 1. Получить все адреса пользователя
router.get('/users/addresses/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
        
        res.json(user.addresses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Добавить новый адрес (с координатами)
router.post('/users/addresses/:email', async (req, res) => {
    try {
        const { coordinates, street, isMultiStory, floor, apartment } = req.body;
        
        const user = await User.findOne({ email: req.params.email });
        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

        // Добавляем новый адрес в массив
        user.addresses.push({
            coordinates,
            street,
            isMultiStory,
            floor,
            apartment
        });

        await user.save();
        
        // Фронтенд ждет обновленный массив адресов
        res.json(user.addresses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Удалить адрес
router.delete('/users/addresses/:email/:addressId', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

        // Удаляем адрес по ID
        user.addresses = user.addresses.filter(
            addr => addr._id.toString() !== req.params.addressId
        );

        await user.save();
        res.json(user.addresses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Получить заказы пользователя
router.get('/orders/user/:email', async (req, res) => {
    try {
        const orders = await Order.find({ userEmail: req.params.email });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;