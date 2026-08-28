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

        if (!email?.trim() || !password || !username?.trim() || !displayName?.trim()) {
            return res.status(400).json({
                success: false,
                message:
                    "Email, password, username, and display name are required",
            });
        }
        if (username.trim().length > 50) {
            return res.status(400).json({
                success: false,
                message: "Username must not exceed 50 characters",
            });
        }

        if (displayName.trim().length > 100) {
            return res.status(400).json({
                success: false,
                message: "Display name must not exceed 100 characters",
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

        if (!email?.trim() || !password) {
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

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Access token refreshed successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// logout
const logout = async (req, res, next) => {
    try { 
        const { refreshToken } = req.body;
        await authService.logout(refreshToken);
       

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        next(error);
    }
};

// current user
const getMe = async (req, res, next) => {
    try {
        const user = await authService.getCurrentUser(req.user.id);

        return res.status(200).json({
            success: true,
            data: {
                user,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    refresh,
    logout,
    getMe,
};