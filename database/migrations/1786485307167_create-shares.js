exports.up = (pgm) => {
    pgm.createTable("shares", {
        id: {
            type: "bigserial",
            primaryKey: true,
        },

        artwork_id: {
            type: "bigint",
            notNull: true,
            references: "artworks(id)",
            onDelete: "CASCADE",
        },

        user_id: {
            type: "bigint",
            references: "users(id)",
            onDelete: "SET NULL",
        },

        platform: {
            type: "varchar(30)",
            notNull: true,
        },

        created_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("CURRENT_TIMESTAMP"),
        },
    });

    pgm.addConstraint("shares", "shares_platform_check", {
        check: `
            platform IN (
                'copy_link',
                'whatsapp',
                'facebook',
                'x',
                'email',
                'other'
            )
        `,
    });
};

exports.down = (pgm) => {
    pgm.dropTable("shares");
};