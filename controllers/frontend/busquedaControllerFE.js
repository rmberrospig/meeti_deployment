const Meeti = require('../../models/Meeti');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');

exports.resultadosBusqueda = async(req, res) => {

    const { categoria, titulo, ciudad, pais } = req.query;

    let query;

    if(categoria === ''){
        query = '';
    } else {
        query = {
            categoriaId: { [Op.eq]: categoria  }
        }
    }

    console.log(query);

    const meetis = await Meeti.findAll({
        where: {
            titulo: { [Op.iLike]: '%' + titulo+ '%' },
            ciudad: { [Op.iLike]: '%' + ciudad+ '%' },
            pais: { [Op.like]: '%' + pais+ '%' }
        },
        include: [
            {
                model: Grupos,
                where: query
            },
            {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    });

    res.render('busqueda', {
        nombrePagina: 'Resultados Búsqueda',
        meetis,
        moment
    });

}