require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { startCronJobs } = require("./lib/cron");

const authRoutes = require("./routes/auth");
const collegesRoutes = require("./routes/colleges");
const listingsRoutes = require("./routes/listings");
const messagesRoutes = require("./routes/messages");
const usersRoutes = require("./routes/users");
const savedRoutes = require("./routes/saved");
const uploadsRoutes = require("./routes/uploads");
const supportRoutes = require("./routes/support");

const app = express();
const PORT = process.env.PORT || 4000;

// CORS — allow the frontend origin(s)
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (
        ALLOWED_ORIGINS.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
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
app.use("/support", supportRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`DormSy API running on port ${PORT}`);
  startCronJobs();
});
