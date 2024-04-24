const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config({ path: 'C:/Users/Erika/Desktop/apigooglw/login_auth/.env' });

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "clientuser"
});

db.connect((error) => {
    if (error) {
        console.log(error);
    } else {
        console.log("MySQL conectado");
    }
});

module.exports = db;
