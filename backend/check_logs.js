const DB = require('./database');

DB.query("SELECT COUNT(*) as total FROM logs", (err, result) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  console.log('Total logs in database:', result[0].total);
  
  DB.query("SELECT * FROM logs ORDER BY id DESC LIMIT 5", (err, rows) => {
    if (err) {
      console.error('Error:', err);
      process.exit(1);
    }
    console.log('\nLast 5 logs:');
    console.table(rows);
    process.exit(0);
  });
});
