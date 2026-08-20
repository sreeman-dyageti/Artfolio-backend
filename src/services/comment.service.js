const pool = require("../config/database");

// Create Comment
const createComment = async ({
    artworkId,
    userId,
    content,
}) => {
    // Only published artworks can receive comments
    const artworkResult = await pool.query(
        `SELECT id FROM artworks
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
        INSERT INTO comments (
            user_id,
            artwork_id,
            content
        )
        VALUES ($1, $2, $3)
        RETURNING
            id,
            user_id,
            artwork_id,
            content,
            created_at,
            updated_at
        `,
        [
            userId,
            artworkId,
            content.trim(),
        ]
    );

    return result.rows[0];
};

// Get Comments 
const getComments = async ({
    artworkId,
    page = 1,
    limit = 20,
}) => {
    const offset = (page - 1) * limit;

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

    const countResult = await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM comments
        WHERE artwork_id = $1
        `,
        [artworkId]
    );

    const result = await pool.query(
        ` SELECT
            c.id,
            c.user_id,
            c.artwork_id,
            c.content,
            c.created_at,
            c.updated_at,

            p.username,
            p.display_name,
            p.avatar_url

        FROM comments c

        JOIN profiles p
            ON p.user_id = c.user_id

        WHERE c.artwork_id = $1

        ORDER BY c.created_at DESC

        LIMIT $2
        OFFSET $3
        `,
        [artworkId, limit, offset]
    );

    const total = Number(countResult.rows[0].total);

    return {
        comments: result.rows,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total,
            hasPreviousPage: page > 1,
        },
    };
};

// Update Comment
const updateComment = async ({ commentId, userId, content,}) => {
    const result = await pool.query(
        ` UPDATE comments
          SET
            content = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
          AND user_id = $3
        RETURNING
            id,
            user_id,
            artwork_id,
            content,
            created_at,
            updated_at`,
        [content.trim(), commentId, userId]
    );

    if (result.rows.length === 0) {
        const error = new Error(
            "Comment not found or you do not have permission to edit it"
        );

        error.statusCode = 404;
        throw error;
    }

    return result.rows[0];
};

// Delete Comment 
const deleteComment = async ({
    commentId,
    userId,
}) => {
    const result = await pool.query(
        `
        DELETE FROM comments
        WHERE id = $1
          AND user_id = $2
        RETURNING id
        `,
        [
            commentId,
            userId,
        ]
    );

    if (result.rows.length === 0) {
        const error = new Error(
            "Comment not found or you do not have permission to delete it"
        );

        error.statusCode = 404;
        throw error;
    }

    return {
        id: result.rows[0].id,
    };
};

module.exports = {
    createComment,
    getComments,
    updateComment,
    deleteComment,
};