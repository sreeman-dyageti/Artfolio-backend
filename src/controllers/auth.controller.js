const authService = require("../services/auth.service");

const register = async (req, res, next) => {
    try {
        const {
            email,
            password,
            username,
            displayName,
        } = req.body;

        if (!email || !password || !username || !displayName) {
            return res.status(400).json({
                success: false,
                message:
                    "Email, password, username, and display name are required",
            });
        }

        const result = await authService.register({
            email,
            password,
            username,
            displayName,
        });

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
};