const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    dealership: { type: Number, required: true },
    review: { type: String, required: true },
    purchase: { type: Boolean, required: true },
    purchase_date: { type: String, required: false },
    car_make: { type: String, required: false },
    car_model: { type: String, required: false },
    car_year: { type: String, required: false },
    sentiment: { type: String, default: null }
});

module.exports = mongoose.model('reviews', reviewSchema);
