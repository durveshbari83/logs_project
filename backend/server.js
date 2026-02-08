const express = require("express");
const cors = require("cors");
const DB = require("./database");
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/logs", (req, res) => {
    const { device_id, app_name, event_type, timestamp } = req.body;

    if (!device_id || !app_name || !event_type) {
        return res.status(400).send("Missing required fields");
    }

    const sql = "INSERT INTO logs (`device_id`,`app_name`,`event_type`,`timestamp`) VALUES (?,?,?,?)";
    DB.query(sql, [device_id, app_name, event_type, timestamp], (err) => {
        if (err) {
            const msg = err && err.message ? err.message : String(err);
            console.error("Insert error:", err);
            // also write to error log for quieter inspection
            try {
                fs.appendFileSync('server_insert_errors.log', new Date().toISOString() + ' ' + msg + '\n');
            } catch (e) {
                console.error('Failed to write error log:', e);
            }
            return res.status(500).send("Database error: " + msg);
        }
        res.send("Log saved");
    });
});

app.get("/api/unique-pcs", (req, res) => {
    DB.query("SELECT DISTINCT device_id FROM logs", (err, results) => {
        if (err) {
            console.error("Select unique PCs error:", err);
            return res.status(500).send("Database error");
        }
        const pcList = results.map(r => r.device_id);
        res.json(pcList);
    });
});

app.get("/api/logs", (req, res) => {
    const { device_id } = req.query;
    let query = "SELECT * FROM logs";
    const params = [];

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
        console.error('Continuing anyway - will retry on first request');
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '172.21.14.253', () => {
        console.log(`Backend running on http://172.21.14.253:${PORT}`);
    });
});
