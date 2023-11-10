const { check, validationResult } = require('express-validator');
const enviarEmail = require('../handlers/emails');

const Usuario = require('../models/Usuarios');
const Usuarios = require('../models/Usuarios');


const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

const configuracionMulter = {
    limits: { filesize: 100000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname+'/../public/uploads/perfiles/')
        },
        filename: (req, file , next) => {
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension}`)
        }
    }),
    fileFilter(req, file, next) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            next(null, true);
        } else {
            next(new Error('Formato no válido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error) {
        if(error){
            if(error instanceof multer.MulterError) {
                if(error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande');
                } else {
                    req.flash('error', error.message);
                }
            } else if(error.hasOwnProperty('message')) {
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        } else {
            next();
        }
    })
}

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu Cuenta'
    });
}

exports.crearNuevaCuenta = async(req, res) => {
    const usuario = req.body;

    //check('email').isEmail().withMessage('');
    await check('confirmar').notEmpty().withMessage('El password confirmado no puede ir vacio').run(req);
    await check('confirmar').equals(req.body.password).withMessage('El password es diferente').run(req);

    const erroresExpress = validationResult(req);

    try {
        const nuevoUsuario = await Usuario.create(usuario);

        //Url de confirmación
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;

        //Enviar email de confirmación
        await enviarEmail.enviar({
            usuario,
            url,
            subject: 'Confirma tu cuenta de Meeti',
            archivo: 'confirmar-cuenta'
        })
        
        req.flash('exito', 'Hemos enviado un E-mail, confirma tu cuenta');
        res.redirect('/iniciar-sesion');

    } catch (error) {
        const erroresSequelize = error.errors.map(err => err.message);
        const errExp = erroresExpress.errors.map(err => err.msg);
        const listaErrores = [...erroresSequelize, ...errExp];


        req.flash('error', listaErrores);
        res.redirect('/crear-cuenta');
    }
    

}

exports.formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesion'
    });
}

exports.confirmarCuenta = async(req, res, next) => {
    //Verificar que el usuario exista
    const usuario = await Usuario.findOne({
        where: { email: req.params.correo }
    });

    if(!usuario) {
        req.flash('error','No existe esa cuenta');
        res.redirect('/crear-cuenta');
        return next();
    }

    usuario.activo = 1;
    await usuario.save();

    req.flash('exito','La cuenta se ha confirmado, ya puedes iniciar sesión');
    res.redirect('/iniciar-sesion');

    
}

exports.formEditarPerfil = async(req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('editar-perfil', {
        nombrePagina: 'Editar Perfil',
        usuario
    });
}

exports.editarPerfil = async(req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    check('nombre').trim().run(req);
    check('email').trim().run(req);

    //Leer datos del form
    const { nombre, descripcion, email } = req.body;

    usuario.nombre = nombre;
    usuario.descripcion = descripcion;
    usuario.email = email;

    await usuario.save();
    req.flash('exito','Cambios Guardados Correctamente');
    res.redirect('/administracion');
}

exports.formCambiarPassword = (req, res) => {
    res.render('cambiar-password', {
        nombrePagina: 'Cambiar Password'
    });
}

exports.cambiarPassword = async(req, res, next) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    //Verificar el password anterior es correcto
    if(!usuario.validarPassword(req.body.anterior)) {
        req.flash('error','El password actual es incorrecto');
        res.redirect('/administracion');
        return next();
    }

    //Si el password es correcto, hashear el nuevo
    const hash = usuario.hashPassword(req.body.nuevo);
    usuario.password = hash;

    //Guardar en BD
    await usuario.save();

    //Redireccionar
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('exito','Password Modificado Correctamente, vuelve a iniciar sesión');
        res.redirect('/iniciar-sesion');
    });
    
}

exports.formSubirImagenPerfil = async(req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('imagen-perfil', {
        nombrePagina: 'Subir Imagen Perfil',
        usuario
    });
}

//Guarda la nueva imagen, elimina la anterior
exports.guardarImagenPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    //Si hay imagen anterior eliminarla
    if(req.file && usuario.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/perfiles/${usuario.imagen}`;

        fs.unlink(imagenAnteriorPath, (error) => {
            if(error) {
                console.log(error);
            }
            return;
        });
    }

    //Almacenar nueva imagen
    if(req.file) {
        usuario.imagen = req.file.filename;
    }

    //Almacenar en la BD y redireccionar
    await usuario.save();
    req.flash('exito', 'Cambios Almacenados Correctamente');
    res.redirect('/administracion');
    
}