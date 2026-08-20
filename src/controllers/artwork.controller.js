const artworkService = require("../services/artwork.service");

// Create ArtWork
const createArtwork = async (req, res, next) => {
    try {
        const {
            title,
            description,
            categoryId,
        } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Title is required",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Cover image is required",
            });
        }

        const artwork = await artworkService.createArtwork({
            userId: req.user.id,
            title,
            description,
            categoryId,
            coverImage: req.file,
        });

        return res.status(201).json({
            success: true,
            message: "Artwork created successfully",
            data: {
                artwork,
            },
        });
    } catch (error) {
        next(error);
    }
};

// get ArtWorks
const getArtworks = async (req, res, next) => {
    try {
        const page = Math.max(
            parseInt(req.query.page, 10) || 1,
            1
        );

        const limit = Math.min(
            Math.max(
                parseInt(req.query.limit, 10) || 12,
                1
            ),
            50
        );

        const result = await artworkService.getArtworks({
            page,
            limit,
            search: req.query.search?.trim() || null,
            category: req.query.category?.trim() || null,
            userId: req.user?.id || null,
        });

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// get single ArtWork DRAFT
const getArtworkById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const artwork = await artworkService.getArtworkById(id);

        return res.status(200).json({
            success: true,
            data: {
                artwork,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Publish ArtWork
const publishArtwork = async (req, res, next) => {
    try {
        const artwork = await artworkService.publishArtwork(
            req.params.id,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: "Artwork published successfully",
            data: {
                artwork,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Process Steps
const replaceProcessSteps = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one process image is required",
            });
        }

        const steps = await artworkService.replaceProcessSteps({
            artworkId: req.params.id,
            userId: req.user.id,
            images: req.files,
        });

        return res.status(200).json({
            success: true,
            message: "Process steps updated successfully",
            data: {
                steps,
            },
        });
    } catch (error) {
        next(error);
    }
};

// update ArtWork
const updateArtwork = async (req, res, next) => {
    try {
        const artwork = await artworkService.updateArtwork({
            artworkId: req.params.id,
            userId: req.user.id,
            title: req.body.title,
            description: req.body.description,
            categoryId: req.body.categoryId,
        });

        return res.status(200).json({
            success: true,
            message: "Artwork updated successfully",
            data: {
                artwork,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Delete ArtWork
const deleteArtwork = async (req, res, next) => {
    try {
        await artworkService.deleteArtwork(
            req.params.id,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: "Artwork deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

// LIKES + SAVES
const likeArtwork = async (req, res, next) => {
    try {
        const result = await artworkService.likeArtwork(
            req.params.id,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: result.alreadyLiked
                ? "Artwork already liked"
                : "Artwork liked successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const unlikeArtwork = async (req, res, next) => {
    try {
        const result = await artworkService.unlikeArtwork(
            req.params.id,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: result.wasLiked
                ? "Artwork unliked successfully"
                : "Artwork was not liked",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const saveArtwork = async (req, res, next) => {
    try {
        const result = await artworkService.saveArtwork(
            req.params.id,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: result.alreadySaved
                ? "Artwork already saved"
                : "Artwork saved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const unsaveArtwork = async (req, res, next) => {
    try {
        const result = await artworkService.unsaveArtwork(
            req.params.id,
            req.user.id
        );

        return res.status(200).json({
            success: true,
            message: result.wasSaved
                ? "Artwork removed from saves"
                : "Artwork was not saved",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

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

        const comment = await artworkService.createComment({
            artworkId: req.params.id,
            userId: req.user.id,
            content,
        });

        return res.status(201).json({
            success: true,
            message: "Comment added successfully",
            data: {
                comment,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get Comment
const getComments = async (req, res, next) => {
    try {
        const page = Math.max(
            parseInt(req.query.page, 10) || 1,
            1
        );

        const limit = Math.min(
            Math.max(
                parseInt(req.query.limit, 10) || 20,
                1
            ),
            50
        );

        const result = await artworkService.getComments({
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

// Update Commnets
const updateComment = async (req, res, next) => {
    try {
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Comment content is required",
            });
        }

        const comment = await artworkService.updateComment({
            commentId: req.params.commentId,
            userId: req.user.id,
            content,
        });

        return res.status(200).json({
            success: true,
            message: "Comment updated successfully",
            data: {
                comment,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Delete Comments
const deleteComment = async (req, res, next) => {
    try {
        await artworkService.deleteComment({
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
    createArtwork,
    getArtworks,
    getArtworkById,
    publishArtwork,
    replaceProcessSteps,
    updateArtwork,
    deleteArtwork,
    likeArtwork,
    unlikeArtwork,
    saveArtwork,
    unsaveArtwork,
    createComment,
    getComments,
    updateComment,
    deleteComment,
};