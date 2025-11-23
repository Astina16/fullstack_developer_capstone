const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3030;
const path = require('path');

// State mapping for filtering: Used if the user selects a two-letter code (e.g., TX)
const stateMap = {
    'TX': 'Texas',
    'CA': 'California',
    'NY': 'New York',
    'MD': 'Maryland',
    'PA': 'Pennsylvania',
    'WA': 'Washington',
    'IL': 'Illinois',
    'FL': 'Florida',
    'AZ': 'Arizona',
    'MA': 'Massachusetts',
    'MI': 'Michigan',
    'OR': 'Oregon',
    'VA': 'Virginia',
    'CO': 'Colorado',
    'GA': 'Georgia',
    'LA': 'Louisiana',
};

// Middleware
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));

// Data Loading (using the correct path helper)
const reviews_data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'reviews.json'), 'utf8'));
const dealerships_data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'dealerships.json'), 'utf8'));

// Mongoose Setup (Connect and Models)
const ATLAS_URI = "mongodb+srv://capstone_user:GxgilUjEMG5R3jjv@capstonedb.0bdcuyf.mongodb.net/dealershipsDB?retryWrites=true&w=majority"; 
const Reviews = require('./review');
const Dealerships = require('./dealership'); 

// Define the async startup function to handle database connection and population
async function startDatabaseAndServer() {
    try {
        console.log("Attempting to connect to MongoDB...");
        await mongoose.connect(ATLAS_URI);
        console.log("MongoDB connection successful.");

        const dealerCount = await Dealerships.countDocuments();
        
        if (dealerCount === 0) {
            console.log("Database empty. Populating with initial data...");
            await Reviews.deleteMany({});
            await Dealerships.deleteMany({});
            await Reviews.insertMany(reviews_data['reviews']);
            await Dealerships.insertMany(dealerships_data['dealerships']);
            console.log("Database population complete.");
        } else {
            console.log("Database already contains data. Skipping population.");
        }

        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });

    } catch (error) {
        console.error("Mongoose startup error:", error);
        process.exit(1); 
    }
}

startDatabaseAndServer();


// ----------------------------------------------------------------------
// API ROUTES
// ----------------------------------------------------------------------

// Express route to fetch dealer by a particular id (Task 10)
app.get('/fetchDealer/:id', async (req, res) => { // <-- FIXED: Added async
    try {
        const documents = await Dealerships.find({ id: req.params.id });
        res.json(documents);
    } catch (error) {
        console.error("Error fetching dealer by ID:", error);
        res.status(500).json({ error: 'Error fetching dealer by ID' });
    }
});


// Express route to fetch all reviews
app.get('/fetchReviews', async (req, res) => { // <-- FIXED: Added async
    try {
        const documents = await Reviews.find();
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching documents' });
    }
});

// Express route to fetch reviews by a particular dealer (Task 8)
app.get('/fetchReviews/dealer/:id', async (req, res) => { // <-- FIXED: Added async
    try {
        const documents = await Reviews.find({ dealership: req.params.id }); 
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching documents' });
    }
});


// EXPRESS ROUTE TO FETCH DEALERS (TASK 9, 11, 19)
// Handles both /fetchDealers (all) and /fetchDealers?state=TX (filtered)
app.get('/fetchDealers', async (req, res) => { // <-- CRITICAL FIX: ADDED async
    try {
        const stateCode = req.query.state; // Check for query parameter
        let filter = {};
        let documents = [];

        if (stateCode) {
            let targetName = stateCode;
            const originalCode = stateCode;
            
            // 1. Map two-letter codes to full names (TX -> Texas)
            if (targetName.length === 2 && targetName === targetName.toUpperCase()) {
                 targetName = stateMap[targetName] || targetName; 
            }

            // 2. Define the FINAL $or filter (Fixes filtering issue)
            filter = {
                $or: [
                    // Option A: Check for the Full Mapped Name (e.g., 'Texas')
                    { state: { $regex: new RegExp(targetName, 'i') } }, 
                    // Option B: Check for the Original Code (e.g., 'TX')
                    { state: { $regex: new RegExp(originalCode, 'i') } } 
                ]
            };
        }
        
        documents = await Dealerships.find(filter);
        res.json(documents);
    } catch (error) {
        console.error("Error fetching dealers:", error);
        res.status(500).json({ error: 'Error fetching dealerships' });
    }
});


//Express route to insert review
app.post('/insert_review', async (req, res) => { // Removed express.raw middleware
    // Inside app.post('/insert_review', ... )
try {
    const data = req.body; 

    // CRITICAL FIX: Find MAX ID or set to 1 if collection is empty
    const latestReview = await Reviews.findOne().sort( { id: -1 } );
    let new_id = latestReview ? latestReview.id + 1 : 1; 

    // Ensure data fields are correctly mapped (especially checking null values for purchase_date)
    const review = new Reviews({
        "id": new_id,
        "name": data.name, 
        "dealership": parseInt(data.dealership), 
        "review": data.review,
        "purchase": data.purchase,
        "purchase_date": data.purchase_date,
        "car_make": data.car_make,
        "car_model": data.car_model,
        "car_year": parseInt(data.car_year), 
        "sentiment": data.sentiment
    });

    const savedReview = await review.save();
    res.json(savedReview);
} catch (error) {
    // Log the actual Mongoose error to the console for diagnosis
    console.error('Mongoose Insertion Error:', error); 
    res.status(500).json({ error: 'Error inserting review' });
}
});