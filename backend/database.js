const mysql = require("mysql2");

const db = mysql.createConnection(
    {
        host: "localhost",
        user: "root",
        password: "mehul123",
        database: "LOGS",
    });


db.connect(err => {
    if (err) {
        console.error("Database connection terminated", err);
        return;
    }
    console.log("Database connection successful");
});

module.exports = db;