const pool = require("../config/database");

// LIKES + SAVES
const likeArtwork = async (artworkId, userId) => {
    const artworkResult = await pool.query(
        `
        SELECT id
        FROM artworks
        WHERE id = $1
          AND status = 'published'
        `,
        [artworkId]
    );

    if (artworkResult.rows.length === 0) {
        const error = new Error("Artwork not found");
        error.statusCode = 404;
        throw error;
    }

    const result = await pool.query(
        `
        INSERT INTO likes (
            user_id,
            artwork_id
        )
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING user_id, artwork_id, created_at
        `,
        [userId, artworkId]
    );

    if (result.rows.length === 0) {
        return {
            liked: true,
            alreadyLiked: true,
        };
    }

    return {
        liked: true,
        alreadyLiked: false,
    };
};

const unlikeArtwork = async (artworkId, userId) => {
    const result = await pool.query(
        `
        DELETE FROM likes
        WHERE user_id = $1
          AND artwork_id = $2
        RETURNING user_id, artwork_id
        `,
        [userId, artworkId]
    );

    return {
        liked: false,
        wasLiked: result.rows.length > 0,
    };
};

const saveArtwork = async (artworkId, userId) => {
    const artworkResult = await pool.query(
        `
        SELECT id
        FROM artworks
        WHERE id = $1
          AND status = 'published'
        `,
        [artworkId]
    );

    if (artworkResult.rows.length === 0) {
        const error = new Error("Artwork not found");
        error.statusCode = 404;
        throw error;
    }

    const result = await pool.query(
        `
        INSERT INTO saves (
            user_id,
            artwork_id
        )
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING user_id, artwork_id, created_at
        `,
        [userId, artworkId]
    );

    if (result.rows.length === 0) {
        return {
            saved: true,
            alreadySaved: true,
        };
    }

    return {
        saved: true,
        alreadySaved: false,
    };
};

const unsaveArtwork = async (artworkId, userId) => {
    const result = await pool.query(
        `
        DELETE FROM saves
        WHERE user_id = $1
          AND artwork_id = $2
        RETURNING user_id, artwork_id
        `,
        [userId, artworkId]
    );

    return {
        saved: false,
        wasSaved: result.rows.length > 0,
    };
};

// Follows
const followUser = async (followerId, followingId) => {
    if (Number(followerId) === Number(followingId)) {
        const error = new Error("You cannot follow yourself");
        error.statusCode = 400;
        throw error;
    }

    // Make sure target user exists
    const userResult = await pool.query(
        `
        SELECT id
        FROM users
        WHERE id = $1
        `,
        [followingId]
    );

    if (userResult.rows.length === 0) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    const result = await pool.query(
        `
        INSERT INTO follows (
            follower_id,
            following_id
        )
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING follower_id, following_id, created_at
        `,
        [followerId, followingId]
    );

    if (result.rows.length === 0) {
        return {
            following: true,
            alreadyFollowing: true,
        };
    }

    return {
        following: true,
        alreadyFollowing: false,
    };
};

// Unfollow
const unfollowUser = async (followerId, followingId) => {
    const result = await pool.query(
        `
        DELETE FROM follows
        WHERE follower_id = $1
          AND following_id = $2
        RETURNING follower_id, following_id
        `,
        [followerId, followingId]
    );

    return {
        following: false,
        wasFollowing: result.rows.length > 0,
    };
};

module.exports = {
    likeArtwork,
    unlikeArtwork,
    saveArtwork,
    unsaveArtwork,
    followUser,
    unfollowUser,
};