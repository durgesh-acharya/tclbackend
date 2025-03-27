const mysql = require('mysql2');

require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect(function(err) {
  if (err) throw err;
  console.log('Connected to database successfully!');
});

function pingdb() {
  var sql_keep = `SELECT 1 + 1 AS solution`; 
  connection.query(sql_keep, function (err, result) {
    if (err) throw err;
    console.log("Ping DB");
  });
}
setInterval(pingdb, 1800000);

module.exports = connection;

