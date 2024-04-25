const express = require('express');
const path = require('path');
const rout= require("./routes/routes.js")
const app = express();

app.use('/assets', express.static(__dirname +'/assets' ))
app.use("/css", express.static(path.join(__dirname, './css/')));
app.use('/js', express.static(path.join(__dirname, './js/')))

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('view engine', 'hbs');
const publicDir = path.join(__dirname, './public');
app.use(express.static(publicDir));
app.use('/', rout);




const session = require("express-session");
const flash = require("connect-flash");
app.use(session({
    secret: "nodeusado",
    resave: true, 
    saveUninitialized: true
}))

app.use(flash())
app.use((req, res, next)    =>  {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    next();
})










const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});
module.exports = app;
