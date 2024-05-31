const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/db.js');
const router = express.Router();
const cookieParser = require('cookie-parser')
const moment = require('moment');
const secretKey = 'fen*$fne28$b2';
router.use(cookieParser());
var tkn = false
router.get("/", (req, res) => {
    if(tkn){
        res.render("index", {tkn: true});
    }else {
        
            res.render("index");
    
    }
});


router.get("/loginreq", (req, res)=>{
    res.render("login-required")
})


router.get("/views/register", (req, res) => {
    res.render("register");
});

router.get("/views/login", (req, res) => {
    res.render("login");
});

router.get("/views/cardapio", (req, res) => {
    res.render("cardapio");
});

router.get('/delivery', (req, res) => {
    res.render('delivery');
});

router.get("/views/pontos-turistico", (req, res) => {
    res.render("pturis");
});

router.get("/views/about", (req, res) => {
    res.render("about");
});

router.post("/auth/register", (req, res) => {
    const { username, password } = req.body;
    let erros = [];

    if (!username || typeof username === undefined || username === null) {
        erros.push({ text: "Username inválido!" });
    } else if (!password || typeof password === undefined || password === null) {
        erros.push({ text: "Senha inválida" });
    } else {
        db.query('SELECT username FROM users WHERE username = ?', [username], async (error, results) => {
            if (error) {
                console.log(error);
                res.status(500).json({ message: 'Erro ao verificar usuário', success: false });
            }

            if (results.length > 0) {
                return res.render('register', { message: "Usuário já existe", success: false });
            } else {
                const hashedPassword = await bcrypt.hash(password, 8);
                db.query('INSERT INTO users SET ?', { username: username, password: hashedPassword }, (error, result) => {
                    if (error) {
                        console.log(error);
                        res.status(500).json({ message: 'Erro ao registrar usuário', success: false });
                    } else {
                        return res.render('register', { message: "Usuário registrado com sucesso", success: true });
                    }
                });
            }
        });
    }

    if (erros.length > 0) {
        res.render('register', { erros });
    }
});

router.post("/auth/login", (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], async (error, results) => {
        if (error) {
            console.log(error);
            res.status(500).json({ message: 'Erro ao verificar usuário', success: false });
        }

        if (results.length === 0 || !results) {
            return res.render('login', { message: "Usuário não encontrado", success: false });
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '1h' });
            res.cookie('token', token, { httpOnly: true });
            return res.render('private', {tkn: true, username:user.username});
        } else {
            return res.render('login', { message: "Senha incorreta", success: false });
        }
    });
});
function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.render('negative');

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.status(403).send('Token inválido');
        req.user = user;
        next();
    });
}

router.get('/profile', authenticateToken, (req, res) => {
    db.query('SELECT * FROM users WHERE id = ?', [req.user.id], (err, results) => {
        if (err) return res.status(500).send('Erro no servidor');
        if (results.length === 0 || !results ) return res.status(404).send('Usuário não encontrado');

        const user = results[0];
        res.render('private', {
            id: user.id,
            username: user.username
        });
    });
});

router.post('/logout', (req, res) => {
    res.clearCookie('token'); 
    res.redirect('/'); 
    tkn = false;
});



////////////////////////////
router.get('/reserva', authenticateToken, (req, res) =>{
    res.render('reserva')
})



router.post('/reservar', authenticateToken, (req, res) => {
    const { data, qtd} = req.body;
    const userId = req.user.id; // Obtém o ID do usuário autenticado
    if (!moment(data, 'YYYY-MM-DD').isValid()) {
        return res.render('reserva', { message: "Você precisa selecionar uma data válida", success: false });
    }
    db.query('SELECT * FROM reservation WHERE datas = ? AND user_id = ?', [data, userId], (err, results) => {
        
        if (err) return  res.render('reserva', {message: "Tente novamente", success: false});

        
        //console.log(data, "==============", results)
        if (results.length > 0) {
            return res.render('reserva', {message: "Você já fez uma reserva para essa data", success: false});
        }
        if (!qtd || typeof qtd === undefined || qtd === null ) {
            return res.render('reserva', {message: "Você precisa selecionar o tipo de mesa", success: false})};
            // Horário está disponível, faça a reserva
        db.query('INSERT INTO reservation (user_id, datas, ttype) VALUES (?, ?, ?)', [userId, data, qtd], (err, result) => {
                if (err) return res.status(500).send('Erro ao realizar reserva.' + err);
                console.log(data)



                res.render('reserva', {message: "Reserva feita com sucesso", success: true});
            });
        
    });
});


router.post('/showreservations', authenticateToken, (req, res) =>{
    const userId = req.user.id;
    db.query('SELECT reservation.datas, reservation.user_id, reservation.ttype FROM reservation INNER JOIN users ON reservation.user_id = users.id  WHERE reservation.user_id = ? AND DATE(reservation.datas) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 2 DAY ) order by reservation.datas;',[userId], (err, result) =>{
        if (err){ 
            console.log(err);
            return res.status(500).send('Erro ao buscar reservas');
        }

        res.json(result); // Envia os dados das reservas para o cliente
    });
});

function showreservations() {
    fetch('/showreservations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({}) // Corpo vazio, pois não há dados adicionais necessários
    })
    .then(response => response.json())
    .then(data => {
        
        const dates = data.map(reserva => reserva.datas);
        
        document.getElementById('showOverlay').addEventListener('click', function() {
            var overlay = document.getElementById('overlay');
            
            if (!overlay) {
              overlay = document.createElement('div');
              overlay.id = 'overlay';
              
              var overlayContent = document.createElement('div');
              overlayContent.id = 'overlayContent';
              overlayContent.style.padding= '5% 10%';
              overlay.style.marginTop= '1%';
              overlayContent.classList.add('vida');
              overlay.appendChild(overlayContent);
              var titulo = document.createElement('h3')
              titulo.classList.add('card-title');
              titulo.textContent= "Minhas reservas:";
              titulo.style.textAlign= "left";
              overlayContent.appendChild(titulo);
              
              dates.forEach(date => {
                const dia= parseInt(date.slice(8,10));
                const mes= date.slice(5,7);
              /* BUTTON BOOTSTRAP */
              var card = document.createElement('div');
              card.classList.add('card');
              card.classList.add('card-title');
              card.style.cssText='width: 18rem;'
              card.style.padding= '15px'
              card.textContent= `Data: `
              var cardText= document.createElement('h5');
              
              cardText.textContent= `${dia-1}/${mes}`;
              card.appendChild(cardText)
              overlayContent.appendChild(card);
                });
              
              
              var closeButton = document.createElement('button');
              closeButton.classList.add("btn-close");
              closeButton.id = 'closeButton';
              closeButton.addEventListener('click', function() {
                overlay.style.display = 'none';
              });
              overlayContent.appendChild(closeButton);
              
              document.getElementById('overlayContainer').appendChild(overlay);
            }
            
            overlay.style.display = 'block'; // Exibe o overlay
          });
    })
    .catch(error => console.error('Erro ao buscar reservas:', error));
}


router.post('/deliver', (req, res) => {
    res.render('delivery')
});




////////////////////////////




router.use((req, res) => {
    res.status(404).render('notFound'); // Renderiza a página de erro 404
});

module.exports = showreservations;
module.exports = router;
