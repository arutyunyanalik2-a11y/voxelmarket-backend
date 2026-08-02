const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Регистрация
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Заполните email и пароль' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        const newUser = new User({
            username: username || 'Пользователь',
            email,
            password
        });

        await newUser.save();
        res.status(201).json({ message: 'Регистрация прошла успешно!' });

    } catch (error) {
        console.error('ПОДРОБНАЯ ОШИБКА РЕГИСТРАЦИИ:', error);
        res.status(500).json({ message: 'Ошибка сервера: ' + error.message });
    }
});

// Вход
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Неверный email или пароль' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Неверный email или пароль' });
        }

        res.json({ 
            message: 'Успешный вход!', 
            redirectUrl: user.role === 'admin' ? '/admin' : '/profile',
            avatar: user.avatar 
        });

    } catch (error) {
        console.error('ПОДРОБНАЯ ОШИБКА ВХОДА:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;