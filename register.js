
const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();

dotenv.config({ path: './.env' });

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "clientuser"
});

db.connect((error) => {
    if (error) {
        console.log(error)
    } else {
        console.log("MySQL conectado")
    }
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('view engine', 'hbs');
const publicDir = path.join(__dirname, './public');
app.use(express.static(publicDir));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/views/register", (req, res) => {
    res.render("register")


})
app.get("/views/login", (req, res) => {
    res.render("login")
})

app.post("/auth/register", (req, res) =>{
    const {username, password} = req.body;

    console.log("Dados recebidos:", { username, password })
    
   db.query('SELECT username FROM users WHERE username = ?', [username], async (error, results) => {
        if (error) {
            console.log(error);
            res.status(500).json({ message: 'Erro ao verificar usuário' });
        }

        if (results.length > 0) {
            return res.render('register', {message: "Usuário já existe"})
        } else {
            const hashedPassword = await bcrypt.hash(password, 8); 
            db.query('INSERT INTO users SET ?', { username: username, senha: hashedPassword }, (error, result) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({ message: 'Erro ao registrar usuário' });
                } else {
                    console.log("Usuário registrado com sucesso");
                    res.status(200).json({ message: 'Usuário registrado com sucesso' });
                }
            });
        }
    });
});



app.post("/auth/login", (req, res) => {
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

        // Comparar a senha fornecida com a senha criptografada no banco de dados
        const passwordMatch = await bcrypt.compare(password, user.senha);

        if (passwordMatch) {
            // Se as credenciais estiverem corretas, redirecione o usuário para outra página
            res.redirect('/');
        } else {
            // Se as credenciais estiverem incorretas, redirecione o usuário de volta para a página de login com a mensagem de erro
            return res.render('login', { message: "Credenciais inválidas" });
        }
    });
});

app.listen(5000, () => {
    console.log("Server started at port 5000");
});
