// ------------------------------------------------------
// CLEAN EXPRESS BACKEND – PERMANENT SAFE SEEDING
// ------------------------------------------------------

const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// LOAD SEED FILES
const reviews_seed = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "reviews.json"))
).reviews;

const dealers_seed = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "dealerships.json"))
).dealerships;

// MONGOOSE MODELS
const Reviews = require("./review");
const Dealerships = require("./dealership");

// ------------------------------------------------------
// MONGO CONNECTION
// ------------------------------------------------------
const ATLAS_URI =
  "mongodb+srv://capstone_user:GxgilUjEMG5R3jjv@capstonedb.0bdcuyf.mongodb.net/dealershipsDB?retryWrites=true&w=majority";

mongoose
  .connect(ATLAS_URI)
  .then(async () => {
    console.log("MongoDB connected.");

    // --- SAFE SEEDING LOGIC ---
    // NEVER delete existing data again
    const dealerCount = await Dealerships.countDocuments();

    if (dealerCount === 0) {
      console.log("Seeding dealerships...");
      await Dealerships.insertMany(dealers_seed);

      console.log("Seeding reviews...");
      await Reviews.insertMany(reviews_seed);

      console.log("Database seeded successfully.");
    } else {
      console.log("Database already contains data — no reseeding.");
    }
  })
  .catch((err) => console.error("MongoDB failed:", err));

// ------------------------------------------------------
// HEALTH CHECK
// ------------------------------------------------------
app.get("/", (req, res) => {
  res.send("Express backend is running on Render 🚀");
});

// ------------------------------------------------------
// API ROUTES
// ------------------------------------------------------

// Fetch ALL dealerships
app.get("/fetchDealers", async (req, res) => {
  const dealers = await Dealerships.find();
  res.json(dealers);
});

// Fetch single dealer by ID
app.get("/fetchDealer/:id", async (req, res) => {
  const dealer = await Dealerships.find({ id: Number(req.params.id) });
  res.json(dealer);
});

// Get ALL reviews for a given dealer
app.get("/fetchReviews/dealer/:dealerId", async (req, res) => {
  try {
    const dealerId = Number(req.params.dealerId);
    const reviews = await Reviews.find({ dealership: dealerId });

    return res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Insert new review
app.post("/insert_review", async (req, res) => {
  try {
    const latest = await Reviews.findOne().sort({ id: -1 });
    const new_id = latest ? latest.id + 1 : 1;

    const review = new Reviews({
      ...req.body,
      dealership: Number(req.body.dealership),
      id: new_id,
    });

    const saved = await review.save();
    res.json(saved);
  } catch (err) {
    console.error("Insert failed:", err);
    res.status(500).json({ error: "Error inserting review" });
  }
});

// ------------------------------------------------------
// START EXPRESS SERVER
// ------------------------------------------------------
app.listen(PORT, () => console.log("Express backend running on", PORT));
