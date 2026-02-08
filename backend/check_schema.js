const DB = require('./database');
DB.query("SHOW CREATE TABLE logs", (err, results) => {
  if (err) {
    console.error('SHOW CREATE TABLE failed:', err.message);
    process.exit(1);
  }
  console.log(results);
  process.exit(0);
});