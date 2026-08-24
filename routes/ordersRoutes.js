const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Функция отправки уведомления в Telegram
async function sendTelegramNotification(order) {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    // Если ключей нет (например, забыли добавить), просто пропускаем, чтобы не ломать сервер
    if (!BOT_TOKEN || !CHAT_ID) {
        console.log("Telegram токен или Chat ID не настроены в .env!");
        return;
    }

    // Формируем красивое сообщение
    const message = `🚨 **Новый заказ в Voxel Market!**\n\n` +
        `👤 **Email:** ${order.userEmail}\n` +
        `📞 **Телефон:** ${order.phone}\n` +
        `📍 **Адрес:** ${order.address}\n` +
        `📦 **Товар:** ${order.productName || 'Товар из корзины'}\n` +
        `💰 **Сумма:** ${order.price} ֏\n` +
        `🔑 **Код подтверждения:** ${order.code}\n` +
        `📊 **Статус:** ${order.status}`; // Добавил статус в уведомление

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown' // Чтобы работали жирный шрифт и эмодзи
            })
        });
    } catch (error) {
        console.error("Ошибка отправки уведомления в Telegram:", error);
    }
}

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
            // status не передаем, он сам станет "Оформлен" по умолчанию из модели
        });

        const savedOrder = await newOrder.save();

        // 🔔 ОТПРАВЛЯЕМ УВЕДОМЛЕНИЕ В TELEGRAM (не блокируя ответ пользователю)
        sendTelegramNotification(savedOrder);

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

// 5. ИСПРАВЛЕНО: Изменить статус заказа (для админки)
// Заменили router.put на router.patch, чтобы совпадало с запросом с фронтенда
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ message: "Необходимо передать статус" });
        }

        // Ищем заказ по ID и обновляем ему поле status
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true } // Возвращает уже обновленный документ
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Заказ не найден' });
        }

        res.json(updatedOrder);
    } catch (error) {
        console.error("Ошибка при обновлении статуса:", error);
        res.status(500).json({ message: 'Ошибка сервера при обновлении статуса' });
    }
});

module.exports = router;