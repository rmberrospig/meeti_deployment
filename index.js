const express = require('express');
const expressLayout = require('express-ejs-layouts');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const router = require('./routers');
const passport = require('./config/passport');

const db = require('./config/db');
require('./models/Usuarios');
require('./models/Categorias');
require('./models/Comentarios');
require('./models/Grupos');
require('./models/Meeti');
db.sync().then(() => console.log('DB Conectada')).catch((error) => console.log(error)) ;

require('dotenv').config({
    path: 'variables.env'
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//Habilitar EJS como template engine
app.use(expressLayout);
app.set('view engine', 'ejs');

//Ubicacion vistas
app.set('views', path.join(__dirname, './views'));

//Archivos estáticos
app.use(express.static('public'));

//Habilitar cookie parser
app.use(cookieParser());

//Crear sesión
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false
}));

//Inicializar passport
app.use(passport.initialize());
app.use(passport.session());

//Agrega flash message
app.use(flash());

//Middleware
app.use((req, res, next) => {
    res.locals.usuario = {...req.user} || null;
    res.locals.mensajes = req.flash();
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();
    next();
});


//Routing
app.use('/', router());

//Agregar el puerto y host
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 5000;
app.listen(port, host, () => {
    console.log(`El servidor esta funcionando en el puerto: ${port}`);
});