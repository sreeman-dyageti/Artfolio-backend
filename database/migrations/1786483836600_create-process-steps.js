exports.up = (pgm) => {
    pgm.createTable("process_steps", {
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

        step_number: {
            type: "integer",
            notNull: true,
        },

        title: {
            type: "varchar(255)",
        },

        description: {
            type: "text",
        },

        image_url: {
            type: "text",
            notNull: true,
        },

        image_id: {
            type: "text",
            notNull: true,
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

    pgm.addConstraint(
        "process_steps",
        "process_steps_artwork_step_unique",
        {
            unique: ["artwork_id", "step_number"],
        }
    );

    pgm.addConstraint(
        "process_steps",
        "process_steps_step_number_positive",
        {
            check: "step_number > 0",
        }
    );
};

exports.down = (pgm) => {
    pgm.dropTable("process_steps");
};