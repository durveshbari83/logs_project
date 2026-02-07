const os = require("os");
const axios = require("axios");
const { exec } = require("child_process");

const DEV_ID = os.hostname();
const BACKEND_URL = "http://127.0.0.1:3000/api/logs";

const IGNORE_PROCESSES = new Set([
    "system", "registry", "smss.exe", "csrss.exe", "wininit.exe", "services.exe",
    "lsass.exe", "winlogon.exe", "svchost.exe", "dwm.exe", "fontdrvhost.exe",
    "sihost.exe", "conhost.exe", "runtimebroker.exe", "wudfhost.exe",
    "intelcphdcpsvc.exe", "igfxcuiservicen.exe", "wlanext.exe", "spoolsv.exe",
    "igfxemn.exe", "taskhostw.exe", "rtkaudservice64.exe", "dllhost.exe"
].map(p => p.toLowerCase()));

// Mapping of executable names to user-friendly app names
const EXECUTABLE_MAPPING = {
    'chrome.exe': 'Chrome',
    'firefox.exe': 'Firefox',
    'msedge.exe': 'Edge',
    'iexplore.exe': 'Internet Explorer',
    'code.exe': 'Visual Studio Code',
    'devenv.exe': 'Visual Studio',
    'explorer.exe': 'File Explorer',
    'notepad.exe': 'Notepad',
    'notepad++.exe': 'Notepad++',
    'spotify.exe': 'Spotify',
    'steam.exe': 'Steam',
    'discord.exe': 'Discord',
    'slack.exe': 'Slack',
    'telegram.exe': 'Telegram',
    'viber.exe': 'Viber',
    'whatsapp.exe': 'WhatsApp',
    'vlc.exe': 'VLC Media Player',
    'foobar2000.exe': 'foobar2000',
    'winamp.exe': 'Winamp',
    'itunes.exe': 'iTunes',
    'photoshop.exe': 'Photoshop',
    'illustrator.exe': 'Illustrator',
    'indesign.exe': 'InDesign',
    'acrobat.exe': 'Adobe Acrobat',
    'acrord32.exe': 'Adobe Reader',
    'winscp.exe': 'WinSCP',
    'putty.exe': 'PuTTY',
    'filezilla.exe': 'FileZilla',
    'totalcmd.exe': 'Total Commander',
    '7zfm.exe': '7-Zip',
    'winrar.exe': 'WinRAR',
    'wordpad.exe': 'WordPad',
    'mspaint.exe': 'Paint',
    'calc.exe': 'Calculator',
    'winword.exe': 'Microsoft Word',
    'excel.exe': 'Microsoft Excel',
    'powerpnt.exe': 'Microsoft PowerPoint',
    'outlook.exe': 'Microsoft Outlook',
    'onenote.exe': 'Microsoft OneNote',
    'msaccess.exe': 'Microsoft Access',
    'mspub.exe': 'Microsoft Publisher'
};

const failedQueue = [];
let previousApps = new Set(); // Track previously detected apps for real-time change detection

// Function to get local system timestamp
function getLocalTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function getAppName(processName, windowTitle) {
    // First, check if we have a mapping for this executable
    const lowerProcessName = processName.toLowerCase();
    if (EXECUTABLE_MAPPING[lowerProcessName]) {
        return EXECUTABLE_MAPPING[lowerProcessName];
    }

    // Try to extract app name from window title
    if (windowTitle && windowTitle.length > 0) {
        // Remove common endings
        let appName = windowTitle
            .split(' - ')[0] // Remove " - Something" suffix
            .split(' | ')[0] // Remove " | Something" suffix
            .trim();
        
        if (appName.length > 2 && appName.length < 100) {
            return appName;
        }
    }

    // Use process name without .exe as fallback
    if (processName) {
        return processName.replace('.exe', '');
    }

    return null;
}

function sendLog(appName) {
    if (!appName) return;

    const payload = {
        device_id: DEV_ID,
        app_name: appName,
        event_type: "App opened",
        timestamp: getLocalTimestamp()
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

        const currentApps = new Set();

        for (let r = 1; r < rows.length; r++) {
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

            // Get user-friendly app name
            const appName = getAppName(processName, windowTitle);
            if (appName) {
                currentApps.add(appName);
            }
        }

        // Detect newly opened apps
        const newApps = [];
        currentApps.forEach(app => {
            if (!previousApps.has(app)) {
                newApps.push(app);
                sendLog(app);
            }
        });

        // Detect closed apps
        previousApps.forEach(app => {
            if (!currentApps.has(app)) {
                console.log(`App closed: ${app}`);
            }
        });

        if (newApps.length > 0) {
            console.log(`New app(s) opened:`, newApps.join(', '));
        }

        // Update previousApps for next cycle
        previousApps = currentApps;

        console.log(`Currently running: ${currentApps.size} app(s)`);
    });
}

// Check running apps every 10 seconds for near real-time logging
setInterval(getRunningApps, 10000);
getRunningApps();

// Flush failed logs every 5 seconds
setInterval(flushQueue, 5000);

console.log("Activity Logger running on", DEV_ID);
