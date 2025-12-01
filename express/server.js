// server.js
import express from "express";
import cors from "cors";
import dealerRoutes from "./dealership.js";
import reviewRoutes from "./review.js";

const app = express();
const PORT = process.env.PORT || 3030;

app.use(cors());
app.use(express.json());

// Base routes
app.use("/", dealerRoutes);
app.use("/", reviewRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
