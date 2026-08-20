const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const artworkController = require("../controllers/artwork.controller");

router.post("/artworks/:id/comments",
    authenticate,
    artworkController.createComment
);

router.get("/artworks/:id/comments",
    artworkController.getComments
);

router.patch("/comments/:commentId",
    authenticate,
    artworkController.updateComment
);

router.delete("/comments/:commentId",
    authenticate,
    artworkController.deleteComment
);

module.exports = router;