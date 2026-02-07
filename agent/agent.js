const os = require("os");
const axios = require("axios");
const { exec } = require("child_process");

const DEV_ID = os.hostname();
const BACKEND_URL = "http://127.0.0.1:3000/api/logs";


function sendLog(appName){
    const payload = {
        device_id: DEV_ID,
        app_name: appName,
        event_type: "App opened",
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    console.log("Sending log:", payload);

    axios.post(BACKEND_URL, payload).then(() => console.log("Log sent successfully")).catch((err) => console.error("Failed to send log", err.message));

}
function getCurrentApps()
{
    exec("tasklist",(err, stdout) =>{
        if (err) {
            console.error("Failed to get tasklist:", err);
            return;
        }

        const lines = stdout.split("\n").slice(3);
        const apps = new Set();

        lines.forEach(line => {
            const name = line.split("  ")[0];
            if (name && name.endsWith(".exe")){
                apps.add(name);
            }
        });

        apps.forEach(app => {
            axios.post(BACKEND_URL, {
                device_id:DEV_ID,
                app_name:app,
                event_type:"App is currently in use",
                timestamp:new Date().toISOString().slice(0, 19).replace('T', ' ')
            }).catch((err) => console.error("Error sending app log:", err.message));
        });
    });
}

setInterval(getCurrentApps, 30000);
getCurrentApps();
console.log("PC is on", DEV_ID);