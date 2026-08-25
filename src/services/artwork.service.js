const pool = require("../config/database");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary");

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
            [userId, title.trim(),
                description?.trim() || null,
                uploadedImage.url,
                uploadedImage.publicId,
                categoryId || null,]);

        return result.rows[0];
    } catch (error) {
        // Database failed after Cloudinary upload.
        // Clean up the uploaded image.
        await deleteFromCloudinary(uploadedImage.publicId);

        throw error;
    }
};

// Get ArtWorks
const getArtworks = async ({
    page = 1,
    limit = 12,
    search = null,
    category = null,
    userId = null,
}) => {
    const offset = (page - 1) * limit;

    // Clean way to handle dynamic params without regex hacks
    const filterValues = [];
    const conditions = [`a.status = 'published'`];

    if (search) {
        filterValues.push(`%${search}%`);
        conditions.push(`(a.title ILIKE $${filterValues.length} OR a.description ILIKE $${filterValues.length})`);
    }

    if (category) {
        filterValues.push(category);
        conditions.push(`c.slug = $${filterValues.length}`);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    // COUNT
    const countResult = await pool.query(

        ` SELECT COUNT(*) AS total
        FROM artworks a
        LEFT JOIN categories c
            ON c.id = a.category_id
        ${whereClause}
        `,
        filterValues
    );

    // SOCIAL USER
    const artworkValues = [
        limit,
        offset,
        ...filterValues,
        userId,
    ];

    const artworkWhereClause = filterValues.length ? `WHERE a.status = 'published' AND ${conditions
        .map((condition) =>
            condition.replace(/\$(\d+)/g, (_, number) =>
                `$${Number(number) + 2}`
            )
        )
        .join(" AND ")}`
        : `WHERE a.status = 'published'`;

    const result = await pool.query(
        ` SELECT
        a.id,
        a.title,
        a.description,
        a.cover_image_url,
        a.category_id,
        a.status,
        a.published_at,
        a.created_at,

        p.username,
        p.display_name,
        p.avatar_url,

        c.name AS category_name,
        c.slug AS category_slug,

        ( SELECT COUNT(*) FROM likes l WHERE l.artwork_id = a.id) AS like_count,

        ( SELECT COUNT(*) FROM saves s WHERE s.artwork_id = a.id ) AS save_count,

        (SELECT COUNT(*) FROM shares sh WHERE sh.artwork_id=a.id) AS share_count, 

        EXISTS ( SELECT 1 FROM likes l WHERE l.artwork_id = a.id AND l.user_id = $${artworkValues.length}) AS liked_by_me,

        EXISTS ( SELECT 1 FROM saves s WHERE s.artwork_id = a.id AND s.user_id = $${artworkValues.length}) AS saved_by_me
        FROM artworks a

        JOIN profiles p
        ON p.user_id = a.user_id

        LEFT JOIN categories c
        ON c.id = a.category_id

    ${artworkWhereClause}

    ORDER BY a.created_at DESC

    LIMIT $1
    OFFSET $2
    `,
        artworkValues
    );

    const total = Number(countResult.rows[0].total);

    return {
        artworks: result.rows,
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

// Get ARTWORK by ID
const getArtworkById = async (artworkId, userId = null) => {
    const result = await pool.query(
        `
    SELECT
        a.id,
        a.user_id,
        a.title,
        a.description,
        a.cover_image_url,
        a.cover_image_id,
        a.category_id,
        a.status,
        a.published_at,
        a.created_at,
        a.updated_at,

        p.username,
        p.display_name,
        p.bio,
        p.avatar_url,

        c.name AS category_name,
        c.slug AS category_slug,

        ( SELECT COUNT(*) FROM likes l WHERE l.artwork_id = a.id) AS like_count,
        ( SELECT COUNT(*) FROM saves s WHERE s.artwork_id = a.id) AS save_count,
        (SELECT COUNT(*) FROM shares sh WHERE sh.artwork_id=a.id) AS share_count,
        EXISTS (
            SELECT 1
            FROM likes l
            WHERE l.artwork_id = a.id
              AND l.user_id = $2
        ) AS liked_by_me,

        EXISTS (
            SELECT 1
            FROM saves s
            WHERE s.artwork_id = a.id
              AND s.user_id = $2
        ) AS saved_by_me

    FROM artworks a

    JOIN profiles p
        ON p.user_id = a.user_id

    LEFT JOIN categories c
        ON c.id = a.category_id

    WHERE a.id = $1
      AND a.status = 'published'
    `,
        [artworkId, userId]
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

// Publish ArtWork
const publishArtwork = async (artworkId, userId) => {
    const result = await pool.query(
        ` UPDATE artworks 
        SET
            status = 'published',
            published_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
          AND user_id = $2
          AND status = 'draft'
        RETURNING  id, user_id, title, description, cover_image_url, category_id, status,
            published_at,
            created_at,
            updated_at
        `,
        [artworkId, userId]
    );

    if (result.rows.length === 0) {
        const error = new Error(
            "Artwork not found or you do not have permission to publish it"
        );
        error.statusCode = 404;
        throw error;
    }

    return result.rows[0];
};

// Update ArtWork
const updateArtwork = async ({
    artworkId,
    userId,
    title,
    description,
    categoryId,
}) => {
    const result = await pool.query(
        ` UPDATE artworks
          SET
            title = COALESCE($1, title),
            description = COALESCE($2, description),
            category_id = COALESCE($3, category_id),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4 AND user_id = $5
        RETURNING
            id,
            user_id,
            title,
            description,
            cover_image_url,
            cover_image_id,
            category_id,
            status,
            published_at,
            created_at,
            updated_at `,
        [
            title?.trim() || null,
            description !== undefined ? description.trim() : null,
            categoryId || null,
            artworkId,
            userId,
        ]
    );

    if (result.rows.length === 0) {
        const error = new Error(
            "Artwork not found or you do not have permission to modify it"
        );

        error.statusCode = 404;
        throw error;
    }

    return result.rows[0];
};

// Delete ArtWork
const deleteArtwork = async (artworkId, userId) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const artworkResult = await client.query(
            `
            SELECT
                id,
                cover_image_id
            FROM artworks
            WHERE id = $1
              AND user_id = $2
            `,
            [artworkId, userId]
        );

        if (artworkResult.rows.length === 0) {
            const error = new Error(
                "Artwork not found or you do not have permission to delete it"
            );

            error.statusCode = 404;
            throw error;
        }

        const artwork = artworkResult.rows[0];

        const stepsResult = await client.query(
            `
            SELECT image_id
            FROM process_steps
            WHERE artwork_id = $1
            `,
            [artworkId]
        );

        await client.query(
            `
            DELETE FROM artworks
            WHERE id = $1
              AND user_id = $2
            `,
            [artworkId, userId]
        );

        await client.query("COMMIT");

        // Cloudinary cleanup after DB deletion.
        if (artwork.cover_image_id) {
            await deleteFromCloudinary(
                artwork.cover_image_id
            );
        }

        for (const step of stepsResult.rows) {
            if (step.image_id) {
                await deleteFromCloudinary(
                    step.image_id
                );
            }
        }

        return {
            id: artworkId,
        };
    } catch (error) {
        try {
            await client.query("ROLLBACK");
        } catch (rollbackError) {
            console.error(
                "Rollback failed:",
                rollbackError
            );
        }

        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    createArtwork,
    getArtworks,
    getArtworkById,
    publishArtwork,
    updateArtwork,
    deleteArtwork,
};