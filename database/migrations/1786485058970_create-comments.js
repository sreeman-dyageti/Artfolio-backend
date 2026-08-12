exports.up = (pgm) => {
    pgm.createTable("comments", {
        id: {
            type: "bigserial",
            primaryKey: true,
        },

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

        content: {
            type: "text",
            notNull: true,
        },

        created_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("CURRENT_TIMESTAMP"),
        },

        updated_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("CURRENT_TIMESTAMP"),
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable("comments");
};