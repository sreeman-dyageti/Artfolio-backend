const pool = require("../config/database");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary");

// Process-steps 
const replaceProcessSteps = async ({
    artworkId,
    userId,
    images,
}) => {
    const artworkResult = await pool.query(
        `SELECT id
         FROM artworks
         WHERE id = $1 AND user_id = $2
        `,
        [artworkId, userId]
    );

    if (artworkResult.rows.length === 0) {
        const error = new Error(
            "Artwork not found or you do not have permission to modify it"
        );

        error.statusCode = 404;
        throw error;
    }

    const uploadedImages = [];

    try {
        // Upload the complete new sequence.
        for (const image of images) {
            const uploaded = await uploadToCloudinary(image.buffer, `artfolio/artworks/${artworkId}/process`);
            uploadedImages.push(uploaded);
        }

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            // Get existing Cloudinary IDs before deleting DB rows.
            const existingSteps = await client.query(
                ` SELECT image_id FROM process_steps WHERE artwork_id = $1`,
                [artworkId] );

            await client.query(
                `DELETE FROM process_steps WHERE artwork_id = $1 `,
                [artworkId] );

            const steps = [];

            for (let index = 0; index < uploadedImages.length; index++) {
                const uploadedImage = uploadedImages[index];

                const result = await client.query(
                    ` INSERT INTO process_steps ( artwork_id, step_number, image_url, image_id)
                      VALUES ($1, $2, $3, $4)
                      RETURNING id,
                        artwork_id,
                        step_number,
                        title,
                        description,
                        image_url,
                        image_id,
                        created_at,
                        updated_at
                    `,
                    [ artworkId, index + 1, uploadedImage.url, uploadedImage.publicId,]);

                steps.push(result.rows[0]);
            }

            await client.query("COMMIT");

            // Delete old Cloudinary images after DB success.
            for (const step of existingSteps.rows) {
                try {
                    await deleteFromCloudinary(step.image_id);
                } catch (cleanupError) {
                    console.error(
                        "Failed to delete old process image:",
                        cleanupError
                    );
                }
            }

            return steps;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        // If DB failed, remove newly uploaded images.
        for (const image of uploadedImages) {
            try {
                await deleteFromCloudinary(image.publicId);
            } catch (cleanupError) {
                console.error(
                    "Failed to cleanup uploaded process image:",
                    cleanupError
                );
            }
        }

        throw error;
    }
};

module.exports = {
    replaceProcessSteps,
};