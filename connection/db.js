const mysql = require('mysql2');

const connectionPool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_rent_car',
    connectionLimit: 5,
});

module.exports = connectionPool;