require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const collegesRoutes = require("./routes/colleges");
const listingsRoutes = require("./routes/listings");
const messagesRoutes = require("./routes/messages");
const usersRoutes = require("./routes/users");
const savedRoutes = require("./routes/saved");
const uploadsRoutes = require("./routes/uploads");

const app = express();
const PORT = process.env.PORT || 4000;

// CORS — allow the frontend origin
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Routes
app.use("/auth", authRoutes);
app.use("/colleges", collegesRoutes);
app.use("/listings", listingsRoutes);
app.use("/messages", messagesRoutes);
app.use("/users", usersRoutes);
app.use("/saved", savedRoutes);
app.use("/uploads", uploadsRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`DormSy API running on port ${PORT}`);
});
