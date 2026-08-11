exports.up = (pgm) => {
    pgm.createTable("profiles", {
        id: {
            type: "bigserial",
            primaryKey: true,
        },

        user_id: {
            type: "bigint",
            notNull: true,
            unique: true,
            references: "users(id)",
            onDelete: "CASCADE",
        },

        username: {
            type: "varchar(50)",
            notNull: true,
            unique: true,
        },

        display_name: {
            type: "varchar(100)",
            notNull: true,
        },

        bio: {
            type: "text",
        },

        avatar_url: {
            type: "text",
        },

        avatar_id: {
            type: "text",
        },

        website: {
            type: "varchar(255)",
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
    pgm.dropTable("profiles");
};