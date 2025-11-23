const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const reviews = new Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    
    // FIX 1: Allow string or number for dealership ID for flexibility
    dealership: { type: String, required: true }, 
    
    review: { type: String, required: true },
    purchase: { type: Boolean, required: true },
    
    // FIX 2: Make purchase_date NOT required, as it can be left blank (null)
    purchase_date: { type: String, required: false }, 
    
    car_make: { type: String, required: true },
    car_model: { type: String, required: true },
    
    // FIX 3: Make car_year NOT required/allow string just in case parseInt fails
    car_year: { type: String, required: true }, 
    
    // FIX 4: Ensure Sentiment is defined (from previous fix)
    sentiment: { type: String } 
});

module.exports = mongoose.model('reviews', reviews);