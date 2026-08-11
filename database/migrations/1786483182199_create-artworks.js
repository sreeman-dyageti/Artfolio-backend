exports.up = (pgm) => {
    pgm.createTable("artworks", {
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

        title: {
            type: "varchar(255)",
            notNull: true,
        },

        description: {
            type: "text",
        },

        cover_image_url: {
            type: "text",
        },

        cover_image_id: {
            type: "text",
        },

        category_id: {
            type: "bigint",
            references: "categories(id)",
            onDelete: "SET NULL",
        },

        status: {
            type: "varchar(20)",
            notNull: true,
            default: "draft",
        },

        published_at: {
            type: "timestamptz",
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

    pgm.addConstraint("artworks", "artworks_status_check", {
        check: "status IN ('draft', 'published', 'archived')",
    });
};

exports.down = (pgm) => {
    pgm.dropTable("artworks");
};