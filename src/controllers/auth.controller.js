const authService = require("../services/auth.service");

// register
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

// login 
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const result = await authService.login({
            email,
            password,
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// refresh token validation
const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        const result =
            await authService.refreshAccessToken(refreshToken);

        return res.status(200).json({
            success: true,
            message: "Access token refreshed successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    refresh,
};