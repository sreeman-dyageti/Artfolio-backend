const bcrypt = require("bcrypt");
const pool = require("../config/database");
const jwt = require("jsonwebtoken");

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
            RETURNING id, email, role, is_verified, created_at`,
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


const login = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
        ` SELECT u.id, u.email, u.password_hash, u.role, u.is_verified, p.id AS profile_id, p.username, p.display_name, p.avatar_url
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

    const accessToken = jwt.sign(
        {
            sub: user.id,
            role: user.role,
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
        }
    );

    return {
        accessToken,
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

module.exports = {
    register,
    login,
};