exports.up = (pgm) => {
    pgm.createTable("users", {
        id: {
            type: "bigserial",
            primaryKey: true,
        },

        email: {
            type: "varchar(255)",
            notNull: true,
            unique: true,
        },

        password_hash: {
            type: "text",
            notNull: true,
        },

        role: {
            type: "varchar(20)",
            notNull: true,
            default: "artist",
        },

        is_verified: {
            type: "boolean",
            notNull: true,
            default: false,
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

    pgm.addConstraint("users", "users_role_check", {
        check: "role IN ('artist', 'admin')",
    });
};

exports.down = (pgm) => {
    pgm.dropTable("users");
};