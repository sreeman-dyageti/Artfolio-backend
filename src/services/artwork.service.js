const pool = require("../config/database");
const {
    uploadToCloudinary,
    deleteFromCloudinary,
} = require("../utils/cloudinary");

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

module.exports = {
    createArtwork,
};