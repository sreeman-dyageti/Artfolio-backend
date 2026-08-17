const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const errorHandler = require("./middleware/error.middleware");

const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(helmet());

app.use(express.json());

app.use(express.urlencoded({extended:true}));

app.get("/health", (req,res) =>{
    res.status(200).json({
        success: true,
        message: "Artfolio API is running",
    });
});

app.use("/api/v1/auth", authRoutes)

app.use(errorHandler);

module.exports = app;