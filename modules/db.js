var mysql = require('mysql');

var pool = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "123456",
    database: "db-student"
})

module.exports = pool;