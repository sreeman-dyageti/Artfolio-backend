const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const artworkController = require("../controllers/artwork.controller");
const optionalAuth = require("../middleware/optionalAuth");

const router = express.Router();

router.post(
    "/",
    authenticate,
    upload.single("coverImage"),
    artworkController.createArtwork
);

router.get("/", optionalAuth, artworkController.getArtworks);

router.patch(
    "/:id/publish",
    authenticate,
    artworkController.publishArtwork
);

router.put(
    "/:id/process-steps",
    authenticate,
    upload.array("images", 20),
    artworkController.replaceProcessSteps
);

router.patch(
    "/:id",
    authenticate,
    artworkController.updateArtwork
);

router.delete(
    "/:id",
    authenticate,
    artworkController.deleteArtwork
);

router.get("/:id", optionalAuth, artworkController.getArtworkById);

module.exports = router;