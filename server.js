const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Подключаем официальный SDK Google GenAI
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI(); // Автоматически использует process.env.GEMINI_API_KEY

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/productsRoutes'); // Подключаем маршруты товаров
const ordersRoutes = require('./routes/ordersRoutes');    // Подключаем маршруты заказов
const User = require('./models/User');                    // Подключаем модель пользователя
const Order = require('./models/Order');                  // Подключаем модель заказа (нужна для админки)

const app = express();

app.use(cors());

// Увеличиваем лимиты, чтобы картинки (base64) без проблем доходили до сервера
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Подключаем маршруты авторизации
app.use('/api/auth', authRoutes);

// Подключаем маршруты пользователей (для сохранения адресов)
app.use('/api/users', require('./routes/users'));

// Подключаем маршруты товаров (для работы с каталогом)
app.use('/api/products', productsRoutes);

// Подключаем маршруты заказов
app.use('/api/orders', ordersRoutes);

// --- Эндпоинт для ИИ-ассистента Захара ---
const SYSTEM_INSTRUCTION = (
    "Ты — Захар, интеллектуальный ИИ-ассистент экосистемы Voxel Rivo и платформы Voxel Market. ",
    "Твоя задача — вежливо, кратко и по делу отвечать на вопросы пользователей. ",
    "Ты помогаешь клиентам ориентироваться на маркетплейсе, отвечаешь на вопросы о технологиях, 3D-печати и покупках."
);

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Пустое сообщение" });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
            }
        });

        res.json({
            reply: response.text
        });
    } catch (error) {
        console.error("Ошибка при обработке запроса чата:", error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

// --- Эндпоинт для админ-панели (получение всех заказов) ---
app.get('/api/admin/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error("Ошибка при получении заказов для админа:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Эндпоинт для удаления адреса пользователя
app.delete('/api/users/addresses/:email/:addressId', async (req, res) => {
    try {
        const { email, addressId } = req.params;

        // Находим пользователя и удаляем элемент из массива адресов по _id
        const user = await User.findOneAndUpdate(
            { email: email },
            { $pull: { addresses: { _id: addressId } } },
            { new: true } // возвращает обновленный документ
        );

        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        // Возвращаем фронтенду актуальный список адресов
        res.json(user.addresses);
    } catch (error) {
        console.error("Ошибка при удалении адреса:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Успешное подключение к MongoDB'))
  .catch((err) => console.error('Ошибка подключения к MongoDB:', err));

app.get('/', (req, res) => {
  res.send('API Voxel Market работает!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});