// -------------------------------
// IMPORTS
// -------------------------------
const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Models
const Reviews = require("./review");
const Dealerships = require("./dealership");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// -------------------------------
// DATABASE + SEEDING
// -------------------------------
const ATLAS_URI = "mongodb+srv://capstone_user:GxgilUjEMG5R3jjv@capstonedb.0bdcuyf.mongodb.net/dealershipsDB?retryWrites=true&w=majority";

mongoose.connect(ATLAS_URI)
  .then(async () => {
    console.log("MongoDB connected.");

    const dealerCount = await Dealerships.countDocuments();
    if (dealerCount === 0) {
      await Dealerships.insertMany(dealerships_data.dealerships);
      console.log("Dealerships seeded.");
    }

    const reviewCount = await Reviews.countDocuments();
    if (reviewCount === 0) {
      await Reviews.insertMany(reviews_data.reviews);
      console.log("Reviews seeded.");
    }
  })
  .catch(err => console.error("MongoDB connection failed:", err));

// -------------------------------
// ROOT CHECK
// -------------------------------
app.get("/", (req, res) => {
  res.send("Express backend running.");
});

// -------------------------------
// FETCH ALL REVIEWS
// -------------------------------
app.get("/reviews", async (req, res) => {
  const all = await Reviews.find();
  res.json(all);
});

// -------------------------------
// FETCH REVIEWS FOR SPECIFIC DEALER
// -------------------------------
app.get("/fetchReviews/dealer/:dealerId", async (req, res) => {
  try {
    const dealerId = Number(req.params.dealerId);

    // Correct model name
    const reviews = await Reviews.find({ dealership: dealerId });

    return res.status(200).json(reviews);

  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// -------------------------------
// INSERT REVIEW  (THIS IS WHAT DJANGO CALLS)
// -------------------------------
app.post("/insert_review", async (req, res) => {
  try {
    const latest = await Reviews.findOne().sort({ id: -1 });
    const newId = latest ? latest.id + 1 : 1;

    const newReview = new Reviews({
      ...req.body,
      dealership: Number(req.body.dealership),
      id: newId
    });

    const saved = await newReview.save();
    res.status(201).json(saved);

  } catch (error) {
    console.error("Insert review failed:", error);
    res.status(500).json({ error: "Error inserting review" });
  }
});

// -------------------------------
// DEALERS
// -------------------------------
app.get("/fetchDealers", async (req, res) => {
  res.json(await Dealerships.find());
});

app.get("/fetchDealer/:id", async (req, res) => {
  res.json(await Dealerships.find({ id: Number(req.params.id) }));
});

// -------------------------------
// START SERVER
// -------------------------------
app.listen(PORT, () =>
  console.log(`Express backend running on port ${PORT}`)
);

