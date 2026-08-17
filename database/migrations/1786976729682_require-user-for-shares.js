exports.up = (pgm) => {
    pgm.alterColumn("shares", "user_id", {
        notNull: true,
    });
};

exports.down = (pgm) => {
    pgm.alterColumn("shares", "user_id", {
        notNull: false,
    });
};