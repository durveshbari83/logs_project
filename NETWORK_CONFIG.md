# Network Configuration - Activity Logger System

## Network Setup

### Backend Machine
- **IP Address**: 172.21.14.253
- **Port**: 3000
- **URL**: http://172.21.14.253:3000
- **Services**:
  - Express API Server (Node.js)
  - MySQL Database (localhost:3306)
- **File**: backend/server.js
- **Database**: LOGS (MySQL)

### Agent Machine
- **IP Address**: 172.21.10.41
- **Role**: Monitors running applications and sends logs to backend
- **Backend Endpoint**: http://172.21.14.253:3000/api/logs
- **File**: agent/agent.js

### Frontend Machine
- **Role**: Displays logs and activity from backend
- **Backend Endpoint**: http://172.21.14.253:3000/api/logs
- **Backend Endpoint (unique PCs)**: http://172.21.14.253:3000/api/unique-pcs

## API Endpoints

### POST /api/logs
**Purpose**: Save application activity logs
**Source**: Agent (172.21.10.41)
**Payload**:
```json
{
  "device_id": "HOSTNAME",
  "app_name": "Application Name",
  "event_type": "App opened",
  "timestamp": "2026-02-08 14:30:00"
}
```
**Response**: "Log saved" (200) or error (500)

### GET /api/logs
**Purpose**: Retrieve all logs or filter by device_id
**Query Parameters**:
- `device_id` (optional): Filter logs by device

**Response**:
```json
[
  {
    "id": 1,
    "device_id": "DESKTOP-ABC123",
    "app_name": "Chrome",
    "event_type": "App opened",
    "timestamp": "2026-02-08T14:30:00.000Z"
  }
]
```

### GET /api/unique-pcs
**Purpose**: Get list of all monitored devices
**Response**:
```json
["DESKTOP-ABC123", "DESKTOP-XYZ789"]
```

## Configuration Files Modified

### 1. agent/agent.js
```javascript
const BACKEND_URL = "http://172.21.14.253:3000/api/logs";
```

### 2. backend/server.js
```javascript
app.listen(PORT, '172.21.14.253', () => {
    console.log(`Backend running on http://172.21.14.253:${PORT}`);
});
```

### 3. backend/database.js
```javascript
const db = mysql.createConnection({
    host: "localhost",        // MySQL on same machine
    user: "root",
    password: "DAsb4804",
    database: "LOGS",
});
```

## Running the System

### Terminal 1: Start Backend Server (on 172.21.14.253)
```bash
cd backend
node server.js
```
Expected output:
```
Database connection successful
Backend running on http://172.21.14.253:3000
```

### Terminal 2: Start Agent (on 172.21.10.41)
```bash
cd agent
node agent.js
```
Expected output:
```
Activity Logger running on [HOSTNAME]
Found X foreground app(s): ...
Log sent successfully: Chrome
```

### Terminal 3: Start Frontend (optional, any machine)
```bash
cd front_end/website
ng serve
```

## Monitoring Logs

Check logs stored in the database:
```bash
cd backend
node check_logs.js
```

## Troubleshooting

### Agent can't connect to backend
1. Verify backend is running on 172.21.14.253:3000
2. Check firewall allows port 3000 from 172.21.10.41
3. Verify BACKEND_URL in agent/agent.js is correct

### Logs not being recorded
1. Check MySQL database is running
2. Verify database "LOGS" exists
3. Run `node init_db.js` to create/fix logs table
4. Check backend logs for errors

### Wrong app names showing
1. App name mapping is in EXECUTABLE_MAPPING object in agent/agent.js
2. Add more mappings for uncommon applications
3. System processes are filtered by IGNORE_PROCESSES list
