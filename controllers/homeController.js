const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');
const Meeti = require('../models/Meeti');
const moment = require('moment');
const Sequilize = require('sequelize');
const Usuarios = require('../models/Usuarios');
const Op = Sequilize.Op;

exports.home = async (req, res) => {

    //Promise para consultas en el home
    const consultas = [];
    consultas.push(Categorias.findAll({}));
    consultas.push(Meeti.findAll({
        attributes: ['slug','titulo','fecha','hora'],
        where: {
            fecha: { [Op.gte]: moment(new Date()).format("YYYY-MM-DD") }
        },
        limit: 3,
        order: [
            ['fecha','ASC']
        ],
        include: [
            {
                model: Grupos,
                attributes: ['imagen']
            },
            {
                model: Usuarios,
                attributes: ['nombre','imagen']
            }
        ]
    }));

    //Extraer y pasar categorias a la vista
    const[ categorias, meetis ] = await Promise.all(consultas);

    console.log(meetis);
    console.log(meetis.length);

    res.render('home', {
        nombrePagina: 'Inicio',
        categorias,
        meetis,
        moment
    });
}