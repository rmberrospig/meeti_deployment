const passport = require("passport");

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

//Revisa si esta autenticado o no
exports.usuarioAutenticado = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }

    return res.redirect('/iniciar-sesion');
}

//Cerrar Sesión
exports.cerrarSesion = (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('correcto','Cerraste sesión correctamente');
        res.redirect('/iniciar-sesion');
    });
}