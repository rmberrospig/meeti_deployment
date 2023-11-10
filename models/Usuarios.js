const Sequilize = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcrypt-nodejs');
const Sequelize = require('sequelize');

const Usuarios = db.define('usuarios', {
    id: {
        type: Sequilize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: Sequilize.STRING(60),
    imagen: Sequilize.STRING(60),
    descripcion: Sequelize.TEXT,
    email: {
        type: Sequilize.STRING(30),
        allowNull: false,
        validate: {
            isEmail: { msg: 'Agrega un correo válido' }
        },
        unique: {
            args: true,
            msg: 'Usuario ya registrado'
        }
    },
    password: {
        type: Sequilize.STRING(60),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'El password no puede ir vacio' }
        }
    },
    activo: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    token: Sequilize.STRING,
    expireToken: Sequelize.DATE

}, {
    hooks: {
        beforeCreate(usuario) {
            usuario.password = Usuarios.prototype.hashPassword(usuario.password);
        }
    }
});

//Método para comparar password
Usuarios.prototype.validarPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}
Usuarios.prototype.hashPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

module.exports = Usuarios;