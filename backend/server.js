const express = require("express");
const cors = require("cors") ;
const DB = require("./database");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/logs",(req,res) =>
{
    const {
        device_id, app_name, event_type, timestamp
    } = req.body;

    DB.query(
        "INSERT INTO logs (device_id, app_name, event_type, timestamp) VALUES (?,?,?,?)",
        [device_id, app_name, event_type, timestamp],
        (err) => {
            if (err) return
            res.status(500).send("Database error");
            res.send("Log saved");
        }
    );
});

app.get("/api/logs",(req, res) => {
    db.query("SELECT * FROM logs ORDER BY timestamp DESC", (err, results) =>{
        if(err) return
        res.status(500).send("Database error");
        res.json(results);
    });
});

app.listen(3000, () => {
    console.log("Backend running 3000");
});
