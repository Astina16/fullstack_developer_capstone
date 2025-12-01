// -------------------------------
// IMPORTS
// -------------------------------
const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();

// -------------------------------
// CONFIG
// -------------------------------
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// -------------------------------
// LOAD SEED DATA
// -------------------------------
const reviews_data = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'reviews.json'))
);

const dealerships_data = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'dealerships.json'))
);

// -------------------------------
// MONGODB CONNECTION
// -------------------------------
const ATLAS_URI =
  "mongodb+srv://capstone_user:GxgilUjEMG5R3jjv@capstonedb.0bdcuyf.mongodb.net/dealershipsDB?retryWrites=true&w=majority";

const Reviews = require('./review');        // ✔ Correct model
const Dealerships = require('./dealership'); // ✔ Correct model

mongoose
  .connect(ATLAS_URI)
  .then(async () => {
    console.log("MongoDB connected.");

    const count = await Dealerships.countDocuments();

    if (count === 0) {
      console.log("Seeding database...");
      await Reviews.deleteMany({});
      await Dealerships.deleteMany({});
      await Reviews.insertMany(reviews_data.reviews);
      await Dealerships.insertMany(dealerships_data.dealerships);
      console.log("Database seeded.");
    }
  })
  .catch((err) => console.error("MongoDB connection failed:", err));


// -------------------------------
// HEALTH CHECK ROUTE
// -------------------------------
app.get("/", (req, res) => {
  res.send("Express backend is running on Render!");
});


// -------------------------------
// ROUTES
// -------------------------------

/** 
 * GET ALL REVIEWS 
 */
app.get("/reviews", async (req, res) => {
  res.json(await Reviews.find());
});

/**
 * GET REVIEWS FOR SPECIFIC DEALER
 */
app.get("/fetchReviews/dealer/:dealerId", async (req, res) => {
  try {
    const dealerId = parseInt(req.params.dealerId);

    // ✔ FIXED — Use correct model name: Reviews
    const reviews = await Reviews.find({ dealership: dealerId });

    return res.status(200).json(reviews);

  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

/**
 * INSERT A REVIEW
 * Called from Django using POST JSON
 */
app.post("/insert_review", async (req, res) => {
  try {
    // Auto-increment ID
    const latest = await Reviews.findOne().sort({ id: -1 });
    const new_id = latest ? latest.id + 1 : 1;

    const review = new Reviews({
      ...req.body,
      dealership: Number(req.body.dealership),
      id: new_id,
    });

    const saved = await review.save();
    return res.status(201).json(saved);

  } catch (error) {
    console.error("Error inserting review:", error);
    return res.status(500).json({ error: "Error inserting review" });
  }
});

/**
 * GET DEALER BY ID
 */
app.get("/fetchDealer/:id", async (req, res) => {
  const id = Number(req.params.id);
  res.json(await Dealerships.find({ id }));
});

/**
 * GET ALL DEALERS
 */
app.get("/fetchDealers", async (req, res) => {
  res.json(await Dealerships.find());
});


// -------------------------------
// START SERVER
// -------------------------------
app.listen(PORT, () =>
  console.log(`Express server running on port ${PORT}`)
);
