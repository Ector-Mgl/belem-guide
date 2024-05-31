const express = require('express');
const path = require('path');
const rout= require("./routes/routes.js")
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const cookieParser = require('cookie-parser')
/// CONFIG
const app = express();
app.use(cookieParser());
app.use('/assets', express.static(__dirname +'/assets' ))
app.use("/css", express.static(path.join(__dirname, './css/')));
app.use('/js', express.static(path.join(__dirname, './js/')))
app.use('/routes', express.static(path.join(__dirname, './routes/')))
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set('view engine', 'hbs');
const publicDir = path.join(__dirname, './public');
app.use(express.static(publicDir));
///
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
////
const LocalStrategy = require('passport-local').Strategy;


app.use(session({
    secret: 'nodeusado',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize()); // Inicializa o passport
app.use(passport.session()); // Usa sessões do passport
app.use(flash());



////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

  
const secretKey = 'fen*$fne28$b2'
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  (username, password, done) => {
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
      if (err) return done(err);
      if (results.length === 0) {
        return done(null, false, { message: 'Usuário não encontrado' });
      }

      const user = results[0];

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) return done(err);
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Senha incorreta' });
        }
      });
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) return done(err);
    done(null, results[0]);
  });
});

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////



app.use('/', rout);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});
module.exports = app;
