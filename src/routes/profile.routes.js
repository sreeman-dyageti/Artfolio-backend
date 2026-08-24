const express = require("express");

const router = express.Router();

const optionalAuth = require("../middleware/optionalAuth");
const profileController = require("../controllers/profile.controller");
const authenticate = require("../middleware/auth.middleware")

router.get("/profiles/:userId",
    optionalAuth,
    profileController.getProfile
);

router.patch("/profiles/me",
    authenticate,
    profileController.updateProfile
);

module.exports = router;