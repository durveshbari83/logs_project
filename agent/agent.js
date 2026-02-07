const os = require("os");
const axios = require("axios");
const { exec } = require("child_process");

const DEV_ID = os.hostname();
const BACKEND_URL = "http://127.0.0.1:3000/api/logs";

const IGNORE_PROCESSES = new Set([
    "system", "registry", "smss.exe", "csrss.exe", "wininit.exe", "services.exe",
    "lsass.exe", "winlogon.exe", "svchost.exe", "dwm.exe", "fontdrvhost.exe",
    "sihost.exe", "conhost.exe", "runtimebroker.exe", "wudfhost.exe",
    "intelcphdcpsvc.exe", "igfxcuiservicen.exe", "wlanext.exe", "spoolsv.exe"
].map(p => p.toLowerCase()));

const failedQueue = [];

function sendLog(appName) {
    if (!appName) return;

    const payload = {
        device_id: DEV_ID,
        app_name: appName,
        event_type: "App opened",
        timestamp: new Date().toISOString().slice(0, 19).replace("T", " ")
    };

    axios.post(BACKEND_URL, payload)
        .then(() => console.log("Log sent successfully:", appName))
        .catch((err) => {
            const msg = err && err.message ? err.message : String(err);
            console.error("Log Sending failed:", msg);
            failedQueue.push(payload);
        });
}

function flushQueue() {
    if (failedQueue.length === 0) return;
    const toRetry = failedQueue.splice(0, failedQueue.length);
    toRetry.forEach(payload => {
        axios.post(BACKEND_URL, payload)
            .then(() => console.log("Retry successful:", payload.app_name))
            .catch((err) => {
                const msg = err && err.message ? err.message : String(err);
                console.error("Retry failed:", msg);
                failedQueue.push(payload);
            });
    });
}

function getRunningApps() {

    exec('tasklist /v /FO CSV', (err, stdout) => {
        if (err) {
            console.error('Failed to get tasklist:', err);
            return;
        }

        const rows = stdout.split(/\r?\n/).filter(Boolean);
        if (rows.length < 2) return;

        const header = rows[0].replace(/^"|"$/g, '').split('","');
        const iImage = header.indexOf('Image Name');
        const iWindow = header.indexOf('Window Title');
        const iSessionName = header.indexOf('Session Name');

        const apps = [];

        for (let r = 1; r < rows.length && apps.length < 6; r++) {
            const cols = rows[r].replace(/^"|"$/g, '').split('","');
            const processName = (cols[iImage] || '').trim();
            const windowTitle = (cols[iWindow] || '').trim();
            const sessionName = (cols[iSessionName] || '').trim();

            if (!processName) continue;
            const procLower = processName.toLowerCase();

            if (IGNORE_PROCESSES.has(procLower)) continue;

            if (!windowTitle || /^N\/A$/i.test(windowTitle)) continue;
            if (windowTitle.length < 3) continue;

            if (/^[A-Za-z]:\\/.test(windowTitle)) continue;

            if (sessionName && /services?/i.test(sessionName)) continue;

            apps.push(processName);
        }

        console.log(`Found ${apps.length} foreground app(s):`, apps.join(', '));
        apps.forEach(app => sendLog(app));
    });
}

setInterval(getRunningApps, 30000);
getRunningApps();
setInterval(flushQueue, 5000);

console.log("Activity Logger running on", DEV_ID);
