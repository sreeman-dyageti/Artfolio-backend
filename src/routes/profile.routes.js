const express = require("express");

const router = express.Router();

const optionalAuth = require("../middleware/optionalAuth");
const profileController = require("../controllers/profile.controller");

router.get(
    "/profiles/:userId",
    optionalAuth,
    profileController.getProfile
);

module.exports = router;