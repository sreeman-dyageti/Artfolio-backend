// this migration file is to create indexes 
exports.up = (pgm) => {
    // Artworks
    pgm.createIndex("artworks", "user_id", {
        name: "idx_artworks_user_id",
    });

    pgm.createIndex("artworks", "category_id", {
        name: "idx_artworks_category_id",
    });

    pgm.createIndex("artworks", ["status", "created_at"], {
        name: "idx_artworks_status_created_at",
    });

    // Process steps
    pgm.createIndex("process_steps", "artwork_id", {
        name: "idx_process_steps_artwork_id",
    });

    // Comments
    pgm.createIndex("comments", ["artwork_id", "created_at"], {
        name: "idx_comments_artwork_created_at",
    });

    // Likes
    pgm.createIndex("likes", "artwork_id", {
        name: "idx_likes_artwork_id",
    });

    // Saves
    pgm.createIndex("saves", "artwork_id", {
        name: "idx_saves_artwork_id",
    });

    // Follows
    pgm.createIndex("follows", "following_id", {
        name: "idx_follows_following_id",
    });

    // Shares
    pgm.createIndex("shares", "artwork_id", {
        name: "idx_shares_artwork_id",
    });
};

exports.down = (pgm) => {
    pgm.dropIndex("artworks", "idx_artworks_user_id");
    pgm.dropIndex("artworks", "idx_artworks_category_id");
    pgm.dropIndex("artworks", "idx_artworks_status_created_at");

    pgm.dropIndex("process_steps", "idx_process_steps_artwork_id");

    pgm.dropIndex("comments", "idx_comments_artwork_created_at");

    pgm.dropIndex("likes", "idx_likes_artwork_id");

    pgm.dropIndex("saves", "idx_saves_artwork_id");

    pgm.dropIndex("follows", "idx_follows_following_id");

    pgm.dropIndex("shares", "idx_shares_artwork_id");
};
