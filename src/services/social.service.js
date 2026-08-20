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

module.exports = {
    likeArtwork,
    unlikeArtwork,
    saveArtwork,
    unsaveArtwork,
};