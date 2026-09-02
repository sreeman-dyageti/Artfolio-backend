const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const errorHandler = require("./middleware/error.middleware");
const artworkRoutes = require("./routes/artwork.routes");
const commentRoutes = require("./routes/comment.routes");
const socialRoutes = require("./routes/social.routes"); 
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");

const app = express();

app.use(helmet());
app.use(cors({origin: "http://localhost:5173"}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Artfolio API is running",
    });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/artworks", artworkRoutes);
app.use("/api/v1/comments", commentRoutes); 
app.use("/api/v1/social", socialRoutes); 
app.use("/api/v1", profileRoutes);


app.use(errorHandler);

module.exports = app;