const Grupos = require('../models/Grupos');
const Meeti = require('../models/Meeti');
const { check, validationResult } = require('express-validator');

const { v4 : uuidv4 } = require('uuid');


exports.formNuevoMeeti = async (req, res) => {

    const grupos = await Grupos.findAll({ where: { usuarioId: req.user.id } });

    res.render('nuevo-meeti', {
        nombrePagina: 'Crear Nuevo Meeti',
        grupos
    });
}

exports.crearMeeti = async (req, res) => {
    const meeti = req.body;
    meeti.usuarioId = req.user.id;
    //Almacena ubicación con POINT
    const point = { type: 'Point', coordinates: [parseFloat(req.body.lat), parseFloat(req.body.lng)]};
    meeti.ubicacion = point;

    if(req.body.cupo === '') {
        meeti.cupo = 0;
    }

    meeti.id = uuidv4();

    try{
        await Meeti.create(meeti);
        req.flash('exito', 'Se ha creado el Meeti Correctamente');
        res.redirect('/administracion');

    }catch(error) {
        console.log(error);
        const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-meeti');
    }
}

exports.sanitizarMeeti = (req, res, next) => {
     //Sanitizar
    check('titulo').trim().escape().run(req);
    check('invitado').trim().escape().run(req);
    check('cupo').trim().escape().run(req);
    check('fecha').trim().escape().run(req);
    check('hora').trim().escape().run(req);
    check('direccion').trim().escape().run(req);
    check('ciudad').trim().escape().run(req);
    check('estado').trim().escape().run(req);
    check('pais').trim().escape().run(req);
    check('lng').trim().escape().run(req);
    check('lat').trim().escape().run(req);
    check('grupoId').trim().escape().run(req);

    next();
}

exports.formEditarMeeti = async (req, res) => {
    const consultas = [];

    consultas.push(Grupos.findAll({ where: { usuarioId: req.user.id }}));
    consultas.push(Meeti.findByPk(req.params.id));

    const [grupos, meeti] = await Promise.all(consultas);

    if(!grupos || !meeti) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    res.render('editar-meeti', {
        nombrePagina: `Editar Meeti: ${meeti.titulo}`,
        grupos,
        meeti
    });
}

exports.editarMeeti = async(req, res, next) => {
    const meeti = await Meeti.findOne({ where: { id: req.params.id, usuarioId: req.user.id }});

    if(!meeti) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    const { grupoId, titulo, invitado, fecha, hora, cupo, descripcion, direccion, ciudad, estado, pais, lat, lng } = req.body;

    meeti.grupoId = grupoId;
    meeti.titulo = titulo;
    meeti.invitado = invitado;
    meeti.fecha = fecha;
    meeti.hora = hora;
    meeti.cupo = cupo;
    meeti.descripcion = descripcion;
    meeti.direccion = direccion;
    meeti.estado = estado;
    meeti.pais = pais;

    //Asignar
    const point = { type: 'Point', coordinates: [parseFloat(req.body.lat), parseFloat(req.body.lng)]};
    meeti.ubicacion = point;

    await meeti.save();
    req.flash('exito', 'Cambios Guardados Correctamente');
    res.redirect('/administracion');

}

exports.formEliminarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({ where: { id: req.params.id, usuarioId: req.user.id }});

    if(!meeti) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    res.render('eliminar-meeti', {
        nombrePagina: `Eliminar Meeti: ${meeti.titulo}`
    });
}

exports.eliminarMeeti = async (req, res) => {
    const meeti = await Meeti.findOne({ where: { id: req.params.id, usuarioId: req.user.id }});

    if(!meeti) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
    }

    await Meeti.destroy({ where: { id: req.params.id }});
    req.flash('exito', 'Meeti Eliminado Correctamente');
    res.redirect('/administracion');
}