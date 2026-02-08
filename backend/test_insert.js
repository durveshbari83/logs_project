const DB = require('./database');

const payload = {
  device_id: "TEST-PC",
  app_name: "Notepad",
  event_type: "App opened",
  timestamp: "2026-02-08 12:00:00"
};

const sql = "INSERT INTO logs (`device_id`,`app_name`,`event_type`,`timestamp`) VALUES (?,?,?,?)";

DB.query(sql, [payload.device_id, payload.app_name, payload.event_type, payload.timestamp], (err, results) => {
  if (err) {
    console.error('ERROR:', err);
    console.error('Error Code:', err.code);
    console.error('SQL Error:', err.sql);
    process.exit(1);
  }
  console.log('✓ Insert successful:', results);
  
  // Now query the inserted data
  DB.query("SELECT * FROM logs ORDER BY id DESC LIMIT 1", (err, rows) => {
    if (err) {
      console.error('SELECT failed:', err);
      process.exit(1);
    }
    console.log('✓ Inserted record:', rows);
    process.exit(0);
  });
});
