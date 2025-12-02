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
// LOAD JSON SEED FILES
// -------------------------------
const reviews_data = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "reviews.json"))
);

const dealerships_data = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "dealerships.json"))
);

// -------------------------------
// DATABASE + PERMANENT SEEDING
// -------------------------------
const ATLAS_URI =
  "mongodb+srv://capstone_user:GxgilUjEMG5R3jjv@capstonedb.0bdcuyf.mongodb.net/dealershipsDB";

mongoose
  .connect(ATLAS_URI)
  .then(async () => {
    console.log("MongoDB connected.");

    // Seed dealerships if they don't exist
    for (let dealer of dealerships_data.dealerships) {
      const exists = await Dealerships.findOne({ id: dealer.id });
      if (!exists) {
        await Dealerships.create(dealer);
        console.log("Seeded dealer:", dealer.id);
      }
    }

    // Seed reviews if they don't exist
    for (let review of reviews_data.reviews) {
      const exists = await Reviews.findOne({ id: review.id });
      if (!exists) {
        await Reviews.create(review);
        console.log("Seeded review:", review.id);
      }
    }
  })
  .catch((err) => console.error("MongoDB connection failed:", err));


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
  res.json(await Reviews.find());
});

// -------------------------------
// FETCH REVIEWS FOR SPECIFIC DEALER
// -------------------------------
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

// -------------------------------
// INSERT REVIEW (CALLED BY DJANGO)
// -------------------------------
app.post("/insert_review", async (req, res) => {
  try {
    const latest = await Reviews.findOne().sort({ id: -1 });
    const newId = latest ? latest.id + 1 : 1;

    const saved = await Reviews.create({
      ...req.body,
      id: newId,
      dealership: Number(req.body.dealership),
    });

    res.status(201).json(saved);
  } catch (error) {
    console.error("Insert review failed:", error);
    res.status(500).json({ error: "Error inserting review" });
  }
});

// -------------------------------
// DEALER ROUTES
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
