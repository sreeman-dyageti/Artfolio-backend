const pool = require("../config/database");
const {
    uploadToCloudinary,
    deleteFromCloudinary,
} = require("../utils/cloudinary");

// Create Artwork
const createArtwork = async ({
    userId,
    title,
    description,
    categoryId,
    coverImage,
}) => {
    const uploadedImage = await uploadToCloudinary(
        coverImage.buffer,
        "artfolio/artworks"
    );

    try {
        const result = await pool.query(
            `INSERT INTO artworks ( user_id,title, description, cover_image_url, cover_image_id, category_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, user_id, title, description, cover_image_url, cover_image_id, category_id, status, published_at, created_at, updated_at
            `,
            [
                userId,
                title.trim(),
                description?.trim() || null,
                uploadedImage.url,
                uploadedImage.publicId,
                categoryId || null,
            ]
        );

        return result.rows[0];
    } catch (error) {
        // Database failed after Cloudinary upload.
        // Clean up the uploaded image.
        await deleteFromCloudinary(uploadedImage.publicId);

        throw error;
    }
};

// Get ArtWork
const getArtworks = async ({ page = 1, limit = 12 }) => {
    const offset = (page - 1) * limit;

    const result = await pool.query(
        `SELECT a.id, a.title, a.description, a.cover_image_url, a.category_id, a.status, a.published_at,
            a.created_at,
            p.username,
            p.display_name,
            p.avatar_url,
            c.name AS category_name,
            c.slug AS category_slug
        FROM artworks a
        JOIN profiles p ON p.user_id = a.user_id
        LEFT JOIN categories c
            ON c.id = a.category_id
        WHERE a.status = 'published'
        ORDER BY a.created_at DESC
        LIMIT $1
        OFFSET $2
        `,
        [limit, offset]
    );

    return result.rows;
};

// Get Single ArtWork DRAFT
const getArtworkById = async (artworkId) => {
    const result = await pool.query(
        ` SELECT a.id, a.user_id, a.title, a.description, a.cover_image_url, a.cover_image_id, a.category_id, a.status,
            a.published_at,
            a.created_at,
            a.updated_at,

            p.username,
            p.display_name,
            p.bio,
            p.avatar_url,

            c.name AS category_name,
            c.slug AS category_slug

        FROM artworks a

        JOIN profiles p
            ON p.user_id = a.user_id

        LEFT JOIN categories c
            ON c.id = a.category_id

        WHERE a.id = $1
          AND a.status = 'published'
        `,
        [artworkId]
    );

    if (result.rows.length === 0) {
        const error = new Error("Artwork not found");
        error.statusCode = 404;
        throw error;
    }

    const artwork = result.rows[0];

    const stepsResult = await pool.query(
        `SELECT id, step_number, title, description, image_url, created_at, updated_at
        FROM process_steps
        WHERE artwork_id = $1
        ORDER BY step_number ASC `,
        [artworkId]
    );

    return {
        ...artwork,
        processSteps: stepsResult.rows,
    };
};

module.exports = {
    createArtwork,
    getArtworks,
    getArtworkById,
};