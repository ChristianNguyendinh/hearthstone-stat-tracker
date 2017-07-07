// some config variables for crypto and postgres connection
module.exports = {
    conString: process.env.DATABASE_URL || 'postgres://localhost:5432/christian',
    secret: "asdf"
}