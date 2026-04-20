const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// load env
dotenv.config();

const app = express();

// =======================
// MIDDLEWARE
// =======================
app.use(express.json()); // ✅ VERY IMPORTANT (for req.body)
app.use(cors());

// =======================
// DEBUG (OPTIONAL)
// =======================
console.log("ENV TEST:", process.env.MONGO_URI);

// =======================
// STATIC FILES (PDF)
// =======================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =======================
// ROUTES
// =======================

// auth routes
app.use("/api/auth", require("./routes/authRoutes"));

// schedule routes
app.use("/api/schedule", require("./routes/scheduleRoutes"));

// session routes
app.use("/api/session", require("./routes/sessionRoutes"));

// admin routes (protected)
app.use("/api/admin", require("./routes/adminRoutes"));

// admin login route
app.use("/api/admin-auth", require("./routes/adminAuthRoutes"));

// =======================
// TEST ROUTE
// =======================
app.get("/", (req, res) => {
    res.send("API Running 🚀");
});

// =======================
// DATABASE CONNECTION
// =======================
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected ✅");

        // start server only after DB connects
        app.listen(5000, () => {
            console.log("Server running on port 5000 🚀");
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err.message);
    });