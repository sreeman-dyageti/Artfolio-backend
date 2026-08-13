// this migration is for preserving the user's input while making identity matching case-insensitive.
exports.up = (pgm) => {
    // Remove the existing case-sensitive unique constraint
    pgm.dropConstraint("users", "users_email_key");

    pgm.dropConstraint("profiles", "profiles_username_key");

    // Replace them with case-insensitive unique indexes
    pgm.createIndex("users", "LOWER(email)", {
        name: "idx_users_email_lower_unique",
        unique: true,
    });

    pgm.createIndex("profiles", "LOWER(username)", {
        name: "idx_profiles_username_lower_unique",
        unique: true,
    });
};

exports.down = (pgm) => {
    pgm.dropIndex("users", "idx_users_email_lower_unique");

    pgm.dropIndex("profiles", "idx_profiles_username_lower_unique");

    pgm.addConstraint("users", "users_email_key", {
        unique: ["email"],
    });

    pgm.addConstraint("profiles", "profiles_username_key", {
        unique: ["username"],
    });
};