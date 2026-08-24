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

// profile Update
const updateProfile = async (req, res, next) => {
    try {
        const { display_name, bio, website } = req.body;

        const profile = await profileService.updateProfile({
            userId: req.user.id,
            displayName: display_name,
            bio,
            website,
        });

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
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
    updateProfile,
};