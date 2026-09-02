const bcrypt = require("bcrypt");
const pool = require("../config/database");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Registeration
const register = async ({
    email,
    password,
    username,
    displayName,
}) => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const existingUser = await client.query(
            ` SELECT id FROM users WHERE LOWER(email) = $1`,
            [normalizedEmail]
        );

        if (existingUser.rows.length > 0) {
            const error = new Error("Email is already registered");
            error.statusCode = 409;
            throw error;
        }

        const existingProfile = await client.query(
            ` SELECT id FROM profiles WHERE LOWER(username) = $1`,
            [normalizedUsername]
        );

        if (existingProfile.rows.length > 0) {
            const error = new Error("Username is already taken");
            error.statusCode = 409;
            throw error;
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const userResult = await client.query(
            ` INSERT INTO users ( email, password_hash) VALUES ($1, $2)
            RETURNING id, email, is_verified, created_at`,
            [normalizedEmail, passwordHash]
        );

        const user = userResult.rows[0];

        const profileResult = await client.query(
            ` INSERT INTO profiles ( user_id, username, display_name)
            VALUES ($1, $2, $3)
            RETURNING id, user_id, username, display_name, bio, avatar_url, website, created_at`,
            [
                user.id,
                normalizedUsername,
                displayName.trim(),
            ]
        );

        const profile = profileResult.rows[0];

        await client.query("COMMIT");

        return {
            user,
            profile,
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

// refresh token generation
const generateRefreshToken = () => {
    return crypto.randomBytes(64).toString("hex");
};

const hashToken = (token) => {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
};

// generate access Token
const generateAccessToken = (user) => {
    return jwt.sign(
        {
            sub: user.id,
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn:
                process.env.JWT_ACCESS_EXPIRES_IN || "15m",
        }
    );
};

// Login
const login = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
        ` SELECT u.id,u.email,u.password_hash,u.role,u.is_verified,p.id AS profile_id,p.username,p.display_name,p.avatar_url
         FROM users u
         JOIN profiles p ON p.user_id = u.id
         WHERE LOWER(u.email) = $1 `,
        [normalizedEmail]
    );

    if (result.rows.length === 0) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!passwordMatches) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    const tokenHash = hashToken(refreshToken);

    const expiresAt = new Date();

    expiresAt.setDate(
        expiresAt.getDate() +
        Number(process.env.JWT_REFRESH_EXPIRES_DAYS || 7)
    );

    await pool.query(
        `INSERT INTO refresh_tokens ( user_id, token_hash, expires_at)
    VALUES ($1, $2, $3)`,
        [user.id, tokenHash, expiresAt,]
    );

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            isVerified: user.is_verified,
            profile: {
                id: user.profile_id,
                username: user.username,
                displayName: user.display_name,
                avatarUrl: user.avatar_url,
            },
        },
    };
};

// refresh access Token to return access token
const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        const error = new Error("Refresh token is required");
        error.statusCode = 401;
        throw error;
    }

    const tokenHash = hashToken(refreshToken);

    const result = await pool.query(
        `SELECT rt.id, rt.user_id, rt.expires_at, rt.revoked_at, u.role
         FROM refresh_tokens rt
         JOIN users u ON u.id = rt.user_id
        WHERE rt.token_hash = $1
        `,
        [tokenHash]
    );

    if (result.rows.length === 0) {
        const error = new Error("Invalid refresh token");
        error.statusCode = 401;
        throw error;
    }

    const session = result.rows[0];

    if (session.revoked_at) {
        const error = new Error("Refresh token has been revoked");
        error.statusCode = 401;
        throw error;
    }

    if (new Date(session.expires_at) <= new Date()) {
        const error = new Error("Refresh token has expired");
        error.statusCode = 401;
        throw error;
    }

    const accessToken = generateAccessToken({
        id: session.user_id,
    });

    return {
        accessToken,
    };
};

// logout 
const logout = async (refreshToken) => {
    if (!refreshToken) {
        const error = new Error("Refresh token is required");
        error.statusCode = 400;
        throw error;
    }

    const tokenHash = hashToken(refreshToken);

    await pool.query(
        `UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP
        WHERE token_hash = $1
        `,
        [tokenHash]
    );
};

// get current user
const getCurrentUser = async (userId) => {
    const result = await pool.query(
        ` SELECT u.id, u.email, u.role, u.is_verified, u.created_at, p.id AS profile_id,
            p.username,
            p.display_name,
            p.bio,
            p.avatar_url,
            p.website
        FROM users u
        JOIN profiles p ON p.user_id = u.id
        WHERE u.id = $1
        `,
        [userId]
    );

    if (result.rows.length === 0) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    const user = result.rows[0];

    return {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.is_verified,
        createdAt: user.created_at,
        profile: {
            id: user.profile_id,
            username: user.username,
            displayName: user.display_name,
            bio: user.bio,
            avatarUrl: user.avatar_url,
            website: user.website,
        },
    };
};

module.exports = {
    register,
    login,
    refreshAccessToken,
    logout,
    getCurrentUser,
};