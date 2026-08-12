exports.up = (pgm) => {
    pgm.createTable("follows", {
        follower_id: {
            type: "bigint",
            notNull: true,
            references: "users(id)",
            onDelete: "CASCADE",
        },

        following_id: {
            type: "bigint",
            notNull: true,
            references: "users(id)",
            onDelete: "CASCADE",
        },

        created_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("CURRENT_TIMESTAMP"),
        },
    });

    pgm.addConstraint("follows", "follows_pkey", {
        primaryKey: ["follower_id", "following_id"],
    });

    pgm.addConstraint("follows", "follows_no_self_follow", {
        check: "follower_id <> following_id",
    });
};

exports.down = (pgm) => {
    pgm.dropTable("follows");
};