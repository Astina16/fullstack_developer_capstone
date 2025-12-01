const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();

// Render MUST use process.env.PORT
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Load JSON seeds
const reviews_data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'reviews.json')));
const dealerships_data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'dealerships.json')));

const ATLAS_URI = "mongodb+srv://capstone_user:GxgilUjEMG5R3jjv@capstonedb.0bdcuyf.mongodb.net/dealershipsDB?retryWrites=true&w=majority";

const Reviews = require('./review');
const Dealerships = require('./dealership');

// -------------------------------
// MONGO CONNECTION + SEEDING
// -------------------------------
mongoose.connect(ATLAS_URI)
  .then(async () => {
    console.log("MongoDB connected.");

    const count = await Dealerships.countDocuments();
    if (count === 0) {
      await Reviews.deleteMany({});
      await Dealerships.deleteMany({});
      await Reviews.insertMany(reviews_data.reviews);
      await Dealerships.insertMany(dealerships_data.dealerships);
      console.log("Database seeded.");
    }
  })
  .catch(err => console.error("MongoDB connection failed:", err));


// -------------------------------
// HEALTH CHECK ROUTE (VERY IMPORTANT FOR RENDER)
// -------------------------------
app.get("/", (req, res) => {
  res.send("Express backend is running (Render)");
});


// -------------------------------
// ROUTES
// -------------------------------

// Get all reviews
app.get("/reviews", async (req, res) => {
  res.json(await Reviews.find());
});

// Get reviews for a dealer
app.get("/fetchReviews/dealer/:dealerId", async (req, res) => {
    try {
        const dealerId = parseInt(req.params.dealerId);

        const reviews = await Reviews.find({ dealership: dealerId });

        return res.status(200).json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return res.status(500).json({ error: "Failed to fetch reviews" });
    }
});


// Insert a review
app.post('/reviews/add', async (req, res) => {
  try {
    const latest = await Reviews.findOne().sort({ id: -1 });
    const new_id = latest ? latest.id + 1 : 1;

    const review = new Reviews({
      ...req.body,
      dealership: Number(req.body.dealership),
      id: new_id
    });

    const saved = await review.save();
    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error inserting review" });
  }
});

// Dealer endpoints
app.get('/fetchDealer/:id', async (req, res) => {
  res.json(await Dealerships.find({ id: Number(req.params.id) }));
});

app.get('/fetchDealers', async (req, res) => {
  res.json(await Dealerships.find());
});


// -------------------------------
// START SERVER
// -------------------------------
app.listen(PORT, () => console.log("Express running on", PORT));


