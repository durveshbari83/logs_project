const express = require("express");
const cors = require("cors");
const DB = require("./database");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/logs", (req, res) => {
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

app.get("/api/unique-pcs", (req, res) => {
    console.log("Fetching unique PCs list...");
    DB.query("SELECT DISTINCT device_id FROM logs", (err, results) => {
        if (err) {
            console.error("Select unique PCs error:", err);
            return res.status(500).send("Database error");
        }
        const pcList = results.map(r => r.device_id);
        console.log("Returning unique PCs:", pcList);
        res.json(pcList);
    });
});

app.get("/api/logs", (req, res) => {
    const { device_id } = req.query;
    let query = "SELECT * FROM logs";
    let params = [];

    if (device_id) {
        query += " WHERE device_id = ?";
        params.push(device_id);
    }

    query += " ORDER BY timestamp DESC";

    DB.query(query, params, (err, results) => {
        if (err) {
            console.error("Select logs error:", err);
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

    const PORT = process.env.PORT || 3005;
    app.listen(PORT, () => {
        console.log(`Backend running on http://127.0.0.1:${PORT}`);
    });
});
