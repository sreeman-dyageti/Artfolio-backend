const bcrypt = require("bcrypt");
const pool = require("../config/database");

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

module.exports = {
    register,
};