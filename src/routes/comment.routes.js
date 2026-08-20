const express = require("express");
const authenticate = require("../middleware/auth.middleware");
const commentController = require("../controllers/comment.controller");

const router = express.Router();

router.post(
    "/artworks/:id/comments",
    authenticate,
    commentController.createComment
);

router.get(
    "/artworks/:id/comments",
    commentController.getComments
);

router.patch(
    "/comments/:commentId",
    authenticate,
    commentController.updateComment
);

router.delete(
    "/comments/:commentId",
    authenticate,
    commentController.deleteComment
);

module.exports = router;