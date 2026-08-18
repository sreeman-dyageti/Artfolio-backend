const artworkService = require("../services/artwork.service");

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

module.exports = {
    createArtwork,
};