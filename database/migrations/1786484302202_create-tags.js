exports.up = (pgm) => {
    pgm.createTable("tags", {
        id: {
            type: "bigserial",
            primaryKey: true,
        },

        name: {
            type: "varchar(50)",
            notNull: true,
            unique: true,
        },

        slug: {
            type: "varchar(70)",
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
    pgm.dropTable("tags");
};