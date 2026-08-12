exports.up = (pgm) => {
    pgm.createTable("artwork_tags", {
        artwork_id: {
            type: "bigint",
            notNull: true,
            references: "artworks(id)",
            onDelete: "CASCADE",
        },

        tag_id: {
            type: "bigint",
            notNull: true,
            references: "tags(id)",
            onDelete: "CASCADE",
        },
    });

    pgm.addConstraint(
        "artwork_tags",
        "artwork_tags_pkey",
        {
            primaryKey: ["artwork_id", "tag_id"],
        }
    );
};

exports.down = (pgm) => {
    pgm.dropTable("artwork_tags");
};