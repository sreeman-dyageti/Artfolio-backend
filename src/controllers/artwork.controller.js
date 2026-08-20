const artworkService = require("../services/artwork.service");
const processStepService = require("../services/processStep.service");

// Create ArtWork
const createArtwork = async (req, res, next) => {
    try {
        const { title, description, categoryId } = req.body;

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
            data: { artwork },
        });
    } catch (error) {
        next(error);
    }
};

// Get ArtWorks
const getArtworks = async (req, res, next) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(
            Math.max(parseInt(req.query.limit, 10) || 12, 1),
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

// Get single ArtWork
const getArtworkById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const artwork = await artworkService.getArtworkById(id);

        return res.status(200).json({
            success: true,
            data: { artwork },
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
            data: { artwork },
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

        const steps = await processStepService.replaceProcessSteps({
            artworkId: req.params.id,
            userId: req.user.id,
            images: req.files,
        });

        return res.status(200).json({
            success: true,
            message: "Process steps updated successfully",
            data: { steps },
        });
    } catch (error) {
        next(error);
    }
};

// Update ArtWork
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
            data: { artwork },
        });
    } catch (error) {
        next(error);
    }
};

// Delete ArtWork
const deleteArtwork = async (req, res, next) => {
    try {
        await artworkService.deleteArtwork(req.params.id, req.user.id);

        return res.status(200).json({
            success: true,
            message: "Artwork deleted successfully",
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
};