const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    productName: { type: String, required: true },
    productImage: { type: String, required: true },
    price: { type: Number, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    coordinates: { 
        type: [Number], // Массив [широта, долгота]
        required: true 
    }, 
    code: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);