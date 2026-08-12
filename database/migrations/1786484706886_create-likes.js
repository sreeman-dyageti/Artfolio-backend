exports.up = (pgm) => {
    pgm.createTable("likes", {
        user_id: {
            type: "bigint",
            notNull: true,
            references: "users(id)",
            onDelete: "CASCADE",
        },

        artwork_id: {
            type: "bigint",
            notNull: true,
            references: "artworks(id)",
            onDelete: "CASCADE",
        },

        created_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("CURRENT_TIMESTAMP"),
        },
    });

    pgm.addConstraint("likes", "likes_pkey", {
        primaryKey: ["user_id", "artwork_id"],
    });
};

exports.down = (pgm) => {
    pgm.dropTable("likes");
};