const express = require("express");
const cors = require("cors");

require("dotenv").config();
require("./config/db");


const app = express();
const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use(cors());
app.use(express.json());



app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);


app.get("/", (req, res) => {
    res.json({
        message: "Stay Finder API Running"
    });
});

const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: "*"
}));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});