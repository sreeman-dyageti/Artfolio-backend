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

// get ArtWork
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

        const artworks = await artworkService.getArtworks({
            page,
            limit,
        });

        return res.status(200).json({
            success: true,
            data: {
                artworks,
                pagination: {
                    page,
                    limit,
                },
            },
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

module.exports = {
    createArtwork,
    getArtworks,
    getArtworkById,
};