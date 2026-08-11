exports.up = (pgm) => {
    pgm.createTable("categories", {
        id: {
            type: "bigserial",
            primaryKey: true,
        },

        name: {
            type: "varchar(100)",
            notNull: true,
            unique: true,
        },

        slug: {
            type: "varchar(120)",
            notNull: true,
            unique: true,
        },

        created_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("CURRENT_TIMESTAMP"),
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable("categories");
};