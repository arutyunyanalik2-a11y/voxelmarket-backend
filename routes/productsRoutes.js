const express = require('express');
const router = express.Router();
const ImageKit = require('imagekit');
const Product = require('../models/Product');

const imagekit = new ImageKit({
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

// Получить список всех товаров
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Ошибка при получении списка товаров", error: err.message });
    }
});

// Получить один конкретный товар по его ID (для страницы подробностей)
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Товар не найден" });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: "Ошибка сервера", error: err.message });
    }
});

// Добавить новый товар
router.post('/', async (req, res) => {
    try {
        const { name, price, category, description, format, image } = req.body;

        if (!image) {
            return res.status(400).json({ message: "Поле изображения обязательно для заполнения" });
        }

        const uploadResponse = await imagekit.upload({
            file: image,
            fileName: `voxel_product_${Date.now()}.jpg`,
            folder: "/voxel_market"
        });

        const newProduct = new Product({
            name,
            price,
            category,
            description,
            format,
            image: uploadResponse.url
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        console.error("Ошибка при сохранении товара:", err);
        res.status(500).json({ message: "Ошибка при сохранении товара", error: err.message });
    }
});

// Удалить товар
router.delete('/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Товар успешно удален" });
    } catch (err) {
        res.status(500).json({ message: "Ошибка при удалении товара", error: err.message });
    }
});

module.exports = router;