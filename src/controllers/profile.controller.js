const profileService = require("../services/profile.service");

const getProfile = async (req, res, next) => {
    try {
        const profile = await profileService.getProfileByUserId(
            req.params.userId,
            req.user?.id || null
        );

        return res.status(200).json({
            success: true,
            data: {
                profile,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
};