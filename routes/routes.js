const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const db = require('../db/db.js');
const appF= require("../app.js")
const router = express.Router();




router.get("/", (req, res) => {
    res.render("index");
});

router.get("/views/register", (req, res) => {
    res.render("register");
});

router.get("/views/login", (req, res) => {
    res.render("login");
});

////////////////////////////////////////////////////////
router.post("/auth/register", (req, res) => {
    
    const { username, password } = req.body;
    var erros= [];

if(!req.body.username || typeof req.body.username== undefined || req.body.username == null){ //verificar o username
        erros.push({text: "Username  invalido!"})
}else {
if (!req.body.password || req.body.password== undefined | req.body.password==null){     //verificar a senha
    erros.push({text:  "Senha inválida"}) 
}else{ 
        

            db.query('SELECT username FROM users WHERE username = ?', [username], async (error, results) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({ message: 'Erro ao verificar usuário', success: false });
                } //verificacao

                if (results.length > 0) {
                    return res.render('register', { message: "Usuário já existe" , success: false});
                } else {
                    const hashedPassword = await bcrypt.hash(password, 8);
                    db.query('INSERT INTO users SET ?', { username: username, password: hashedPassword }, (error, result) => {
                        if (error) {
                            console.log(error);
                            res.status(500).json({ message: 'Erro ao registrar usuário', success: false });
                        } else {
                            return res.render('register', { message: "Usuário registrado com sucesso", success: true});
                        } //else - confimação usuário
                    })//query INSERT;
                } //else - INsert
            }); //query SELECT
            }//else - senha e username ok
} // else - 1

    




    console.log("Dados recebidos:", { username, password });

    
});

router.post("/auth/login", (req, res) => {
    const { username, password } = req.body;

    console.log("Dados recebidos:", { username, password });

    db.query('SELECT * FROM users WHERE username = ?', [username], async (error, results) => {
        if (error) {
            console.log(error);
            res.status(500).json({ message: 'Erro ao verificar usuário' });
        }

        if (results.length === 0) {
            return res.render('login', { message: "Usuário não encontrado" });
        }

        const user = results[0];

        const passwordMatch = await bcrypt.compare(password, user.senha);

        if (passwordMatch) {
            res.redirect('/');
        } else {
            return res.render('login', { message: "Credenciais inválidas" });
        }
    });
});

module.exports = router;




















