const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs')


const app = express();

dotenv.config({path: './.env'})



const db = mysql.createConnection({
    host: "localhost"   ,
    user: "root"   ,
    password: "password"   ,
    database: "clientuser"  
})


db.connect((error) =>{
    if (error){
        console.log(error)
    }else {
        console.log("MySQL conectado")
    }
})

app.use(express.urlencoded({extended:false}));
app.use(express.json())

app.set('view engine', 'hbs');
const publicDir = path.join(__dirname, './public')

app.use(express.static(publicDir))

