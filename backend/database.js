const mysql = require("mysql2");

const db = mysql.create(
    {
        host :"localhost",
        user:"root",
        password:"Dasb4804",
        database:"LOGS",
    });


db.connect(err => 
    {
        if(err)
        {
            console.error("Database connection terminated",err);
            return;
        }
        console.log("Database connection successful");
    });

    module.exports = db;