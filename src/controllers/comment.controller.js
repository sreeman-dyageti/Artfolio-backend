const commentService = require("../services/comment.service");

// Create Comment
const createComment = async (req, res, next) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Comment content is required",
            });
        }

        const comment = await commentService.createComment({
            artworkId: req.params.id,
            userId: req.user.id,
            content,
        });

        return res.status(201).json({
            success: true,
            message: "Comment added successfully",
            data: { comment },
        });
    } catch (error) {
        next(error);
    }
};

// Get Comments
const getComments = async (req, res, next) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(
            Math.max(parseInt(req.query.limit, 10) || 20, 1),
            50
        );

        const result = await commentService.getComments({
            artworkId: req.params.id,
            page,
            limit,
        });

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// Update Comment
const updateComment = async (req, res, next) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Comment content is required",
            });
        }

        const comment = await commentService.updateComment({
            commentId: req.params.commentId,
            userId: req.user.id,
            content,
        });

        return res.status(200).json({
            success: true,
            message: "Comment updated successfully",
            data: { comment },
        });
    } catch (error) {
        next(error);
    }
};

// Delete Comment
const deleteComment = async (req, res, next) => {
    try {
        await commentService.deleteComment({
            commentId: req.params.commentId,
            userId: req.user.id,
        });

        return res.status(200).json({
            success: true,
            message: "Comment deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createComment,
    getComments,
    updateComment,
    deleteComment,
};