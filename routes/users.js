const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 1. Получить все адреса конкретного пользователя
router.get('/addresses/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
        
        res.json(user.addresses || []);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// 2. Добавить новый адрес в профиль
router.post('/addresses/:email', async (req, res) => {
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

        await user.save(); // Сохраняем в MongoDB
        res.json(user.addresses); // Возвращаем обновленный список
    } catch (error) {
        console.error('Ошибка сохранения адреса:', error);
        res.status(500).json({ message: 'Ошибка при сохранении адреса' });
    }
});

module.exports = router;