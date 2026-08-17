exports.up = (pgm) => {
    pgm.createTable("refresh_tokens", {
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

        token_hash: {
            type: "text",
            notNull: true,
            unique: true,
        },

        expires_at: {
            type: "timestamptz",
            notNull: true,
        },

        revoked_at: {
            type: "timestamptz",
        },

        created_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("CURRENT_TIMESTAMP"),
        },
    });

    pgm.createIndex("refresh_tokens", "user_id", {
        name: "idx_refresh_tokens_user_id",
    });
};

exports.down = (pgm) => {
    pgm.dropTable("refresh_tokens");
};