exports.up = (pgm) => {
    pgm.dropConstraint("users", "users_role_check");
    pgm.dropColumn("users", "role");
};

exports.down = (pgm) => {
    pgm.addColumn("users", {
        role: {
            type: "varchar(20)",
            notNull: true,
            default: "artist",
        },
    });

    pgm.addConstraint("users", "users_role_check", {
        check: "role IN ('artist', 'admin')",
    });
};