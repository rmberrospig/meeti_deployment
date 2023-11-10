const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');
const { check, validationResult } = require('express-validator');

const { v4 : uuidv4 } = require('uuid');

const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

const configuracionMulter = {
    limits: { filesize: 100000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname+'/../public/uploads/grupos/')
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

exports.formNuevoGrupo = async (req, res) => {
    const categorias = await Categorias.findAll();

    res.render('nuevo-grupo', {
        nombrePagina: 'Crea un nuevo Grupo',
        categorias
    });
}

exports.crearGrupo = async(req, res) => {

     //Sanitizar
    await check('nombre').trim().escape().run(req);
    await check('url').trim().escape().run(req);

     //Validar
    //await check('nombre').notEmpty().withMessage('El Nombre es Obligatorio').run(req);
    //await check('url').notEmpty().withMessage('El URL es Obligatorio').run(req);

    const erroresExpress = validationResult(req);

    const grupo = req.body;
    grupo.usuarioId = req.user.id;
    grupo.categoriaId = req.body.categoria;
    if(req.file) {
        grupo.imagen = req.file.filename;
    }
    console.log(grupo);

    grupo.id = uuidv4();

    try {
        await Grupos.create(grupo);
        req.flash('exito', 'Se ha creado el Grupo Correctamente');
        res.redirect('/administracion');
    } catch (error) {
        console.log(error);

        const erroresSequelize = error.errors.map(err => err.message);
        const errExp = erroresExpress.errors.map(err => err.msg);
        const listaErrores = [...erroresSequelize, ...errExp];

        req.flash('error', listaErrores);
        res.redirect('/nuevo-grupo');
    }
    
}

exports.formEditarGrupo = async (req, res) => {
    
    
const consultas = [];
consultas.push(Grupos.findByPk(req.params.grupoId));
consultas.push(Categorias.findAll());

//Promise con await
const [grupo, categorias] = await Promise.all(consultas);
grupo.url = decodeURI(grupo.url).replaceAll('&#x2F;','/');

    res.render('editar-grupo', {
        nombrePagina: `Editar Grupo: ${grupo.nombre}`,
        grupo,
        categorias
    });
}

exports.editarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } });

    if(!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    const { nombre, descripcion, categoriaId, url } = req.body;
    
    grupo.nombre = nombre;
    grupo.descripcion = descripcion;
    grupo.categoriaId = categoriaId;
    grupo.url = url;

    await grupo.save();
    req.flash('exito', 'Cambios realizados correctamente');
    res.redirect('/administracion');
}

exports.formEditarImagen = async (req, res) => {
    const grupo = await Grupos.findByPk(req.params.grupoId);
    
    res.render('imagen-grupo',{
        nombrePagina: `Editar Imagen Grupo : ${grupo.nombre}`,
        grupo
    });
}

exports.editarImagen = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } });

    if(!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    if(req.file && grupo.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;

        fs.unlink(imagenAnteriorPath, (error) => {
            if(error) {
                console.log(error);
            }
            return;
        });
    }

    if(req.file) {
        grupo.imagen = req.file.filename;
    }

    await grupo.save();
    req.flash('exito', 'Cambios realizados correctamente');
    res.redirect('/administracion');
}

exports.formEliminarGrupo = async(req, res, next) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } });

    if(!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    res.render('eliminar-grupo', {
        nombrePagina: `ELiminar Grupo: ${grupo.nombre}`
    });
}

exports.eliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } });

    if(!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    if(grupo.imagen) {
        const imagenPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;

        fs.unlink(imagenPath, (error) => {
            if(error) {
                console.log(error);
            }
            return;
        });
    }

    await Grupos.destroy({
        where: {
            id: req.params.grupoId
        }
    });

    req.flash('exito', 'Grupo Eliminado');
    res.redirect('/administracion');
}