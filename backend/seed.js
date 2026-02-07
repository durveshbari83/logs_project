const DB = require("./database");

const sampleLogs = [
    { device_id: "mehul39059", app_name: "explorer.exe", event_type: "App is currently in use", timestamp: new Date().toISOString() },
    { device_id: "mehul39059", app_name: "chrome.exe", event_type: "App opened", timestamp: new Date().toISOString() },
    { device_id: "mehul39059", app_name: "code.exe", event_type: "App is currently in use", timestamp: new Date().toISOString() },
    { device_id: "mehul39059", app_name: "slack.exe", event_type: "App opened", timestamp: new Date().toISOString() },
    { device_id: "mehul39059", app_name: "discord.exe", event_type: "App opened", timestamp: new Date().toISOString() },
    { device_id: "DESKTOP-BPHIJBO", app_name: "notepad.exe", event_type: "App is currently in use", timestamp: new Date().toISOString() },
    { device_id: "DESKTOP-BPHIJBO", app_name: "calculator.exe", event_type: "App opened", timestamp: new Date().toISOString() },
    { device_id: "DESKTOP-BPHIJBO", app_name: "terminal.exe", event_type: "App is currently in use", timestamp: new Date().toISOString() }
];

function seed() {
    console.log("Seeding database...");
    let count = 0;
    sampleLogs.forEach(log => {
        DB.query(
            "INSERT INTO logs (device_id, app_name, event_type, timestamp) VALUES (?,?,?,?)",
            [log.device_id, log.app_name, log.event_type, log.timestamp],
            (err) => {
                if (err) {
                    console.error("Error seeding log:", err);
                } else {
                    count++;
                    if (count === sampleLogs.length) {
                        console.log(`Successfully seeded ${count} sample logs.`);
                        process.exit(0);
                    }
                }
            }
        );
    });
}

seed();
