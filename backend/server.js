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

    if (!device_id || !app_name || !event_type) {
        return res.status(400).send("Missing required fields");
    }

    DB.query(
        "INSERT INTO logs (device_id, app_name, event_type, timestamp) VALUES (?,?,?,?)",
        [device_id, app_name, event_type, timestamp],
        (err) => {
            if (err) {
                console.error("Insert error:", err);
                return res.status(500).send("Database error");
            }
            res.send("Log saved");
        }
    );
});

app.get("/api/logs",(req, res) => {
    DB.query("SELECT * FROM logs ORDER BY timestamp DESC", (err, results) =>{
        if(err) {
            console.error("Select error:", err);
            return res.status(500).send("Database error");
        }
        res.json(results);
    });
});

app.get('/', (req, res) => res.send('OK'));

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

DB.query('SELECT 1', (err) => {
    if (err) {
        console.error('Database connectivity check failed:', err);
        console.error('Server will not start until database is reachable.');
        process.exit(1);
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Backend running on http://127.0.0.1:${PORT}`);
    });
});
