const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const socialController = require("../controllers/social.controller");

const router = express.Router();

router.post(
    "/artworks/:id/like",
    authenticate,
    socialController.likeArtwork
);

router.delete(
    "/artworks/:id/like",
    authenticate,
    socialController.unlikeArtwork
);

router.post(
    "/artworks/:id/save",
    authenticate,
    socialController.saveArtwork
);

router.delete(
    "/artworks/:id/save",
    authenticate,
    socialController.unsaveArtwork
);

router.post(
    "/users/:userId/follow",
    authenticate,
    socialController.followUser
);

router.delete(
    "/users/:userId/follow",
    authenticate,
    socialController.unfollowUser
);

router.post(
    "/artworks/:artworkId/share",
    authenticate,
    socialController.shareArtwork
);

module.exports = router;