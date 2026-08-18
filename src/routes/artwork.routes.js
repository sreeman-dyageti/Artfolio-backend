const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const artworkController = require("../controllers/artwork.controller");

const router = express.Router();

router.post(
    "/",
    authenticate,
    upload.single("coverImage"),
    artworkController.createArtwork
);

router.get("/", artworkController.getArtworks);
router.patch( "/:id/publish",
    authenticate,
    artworkController.publishArtwork
);
router.get("/:id", artworkController.getArtworkById);







module.exports = router;