const util = require('util');
const DB = require("./database");

const query = util.promisify(DB.query).bind(DB);

const sampleLogs = [
    { device_id: "PC-X72A81", app_name: "explorer.exe", event_type: "App in use" },
    { device_id: "PC-X72A81", app_name: "chrome.exe", event_type: "Active" },
    { device_id: "PC-B92F1H", app_name: "notepad.exe", event_type: "Active" },
    { device_id: "PC-B92F1H", app_name: "calculator.exe", event_type: "Active" },
    { device_id: "LAPTOP-K3L9M2", app_name: "code.exe", event_type: "Active" },
    { device_id: "LAPTOP-K3L9M2", app_name: "terminal.exe", event_type: "App in use" },
    { device_id: "DESKTOP-4N6P8Q", app_name: "slack.exe", event_type: "Active" },
    { device_id: "DESKTOP-4N6P8Q", app_name: "discord.exe", event_type: "Active" }
];

async function seed() {
    console.log("Cleaning and Seeding database...");
    try {
        await query("TRUNCATE TABLE logs");
        console.log("Table truncated.");

        for (const log of sampleLogs) {
            const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
            await query(
                "INSERT INTO logs (device_id, app_name, event_type, timestamp) VALUES (?,?,?,?)",
                [log.device_id, log.app_name, log.event_type, timestamp]
            );
            console.log(`Inserted log for ${log.device_id}`);
        }

        console.log("Seeding complete.");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seed();
