const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

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

module.exports = app;