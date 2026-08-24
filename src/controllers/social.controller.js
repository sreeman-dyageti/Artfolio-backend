const socialService = require("../services/social.service");

const likeArtwork = async (req, res, next) => {
    try {
        const result = await socialService.likeArtwork(
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
        const result = await socialService.unlikeArtwork(
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
        const result = await socialService.saveArtwork(
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
        const result = await socialService.unsaveArtwork(
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

// Follow
const followUser = async (req, res, next) => {
    try {
        const result = await socialService.followUser(
            req.user.id,
            req.params.userId
        );

        return res.status(200).json({
            success: true,
            message: result.alreadyFollowing
                ? "Already following this user"
                : "User followed successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// Unfollow 
const unfollowUser = async (req, res, next) => {
    try {
        const result = await socialService.unfollowUser(
            req.user.id,
            req.params.userId
        );

        return res.status(200).json({
            success: true,
            message: result.wasFollowing
                ? "User unfollowed successfully"
                : "User was not being followed",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    likeArtwork,
    unlikeArtwork,
    saveArtwork,
    unsaveArtwork,
    followUser,
    unfollowUser,
};