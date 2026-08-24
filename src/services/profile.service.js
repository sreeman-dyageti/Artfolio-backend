const pool = require("../config/database");

const getProfileByUserId = async (userId, currentUserId = null) => {
    const result = await pool.query(
        ` SELECT p.id, p.user_id, p.username,
            p.display_name,
            p.bio,
            p.avatar_url,
            p.website,
            p.created_at,

            ( SELECT COUNT(*) FROM follows f WHERE f.following_id = p.user_id) AS followers_count,

            ( SELECT COUNT(*) FROM follows f WHERE f.follower_id = p.user_id) AS following_count,

            EXISTS ( SELECT 1 FROM follows f WHERE f.follower_id = $2 AND f.following_id = p.user_id) AS following_by_me
        FROM profiles p WHERE p.user_id = $1
        `,
        [userId, currentUserId]
    );

    if (result.rows.length === 0) {
        const error = new Error("Profile not found");
        error.statusCode = 404;
        throw error;
    }

    return result.rows[0];
};

// Profile Update -for display_name, bio, website, avatar
const updateProfile = async ({
    userId,
    displayName,
    bio,
    website,
}) => {
    const result = await pool.query(
        `
        UPDATE profiles
        SET
            display_name=COALESCE($1,display_name),
            bio=COALESCE($2,bio),
            website=COALESCE($3,website),
            updated_at=CURRENT_TIMESTAMP
        WHERE user_id=$4
        RETURNING
            id,user_id,username,display_name,bio,avatar_url,website,created_at,updated_at
        `,
        [displayName, bio, website, userId]
    );

    if (result.rows.length === 0) {
        const error = new Error("Profile not found");
        error.statusCode = 404;
        throw error;
    }

    return result.rows[0];
};





module.exports = {
    getProfileByUserId,
    updateProfile,
};