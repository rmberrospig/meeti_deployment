const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');
const usuarioController = require('../controllers/usuarioController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const gruposController = require('../controllers/gruposController');
const meetiController = require('../controllers/meetiController');

const meetiControllerFE = require('../controllers/frontend/meetiControllerFE');
const comentariosControllerFE = require('../controllers/frontend/comentariosControllerFE');
const usuarioControllerFE = require('../controllers/frontend/usuarioControllerFE');
const gruposControllerFE = require('../controllers/frontend/gruposControllerFE');
const busquedaControllerFE = require('../controllers/frontend/busquedaControllerFE');

module.exports = function() {

    /*AREA PUBLICA*/

    router.get('/', homeController.home);

    //Muestra un meeti
    router.get('/meeti/:slug', meetiControllerFE.mostrarMeeti );

    //Confirmar asistencia a meeti
    router.post('/confirmar-asistencia/:slug', meetiControllerFE.confirmarAsistencia);

    //Muestra asistentes al meeti
    router.get('/asistentes/:slug', meetiControllerFE.mostrarAsistentes);

    //Agrega comentarios en el meeti
    router.post('/meeti/:id', comentariosControllerFE.agregarComentario);

    //Elimina comentarios en el meeti
    router.post('/eliminar-comentario', comentariosControllerFE.eliminarComentario);

    //Muestra perfiles en FE
    router.get('/usuario/:id', usuarioControllerFE.mostrarUsuario);

    //Muestra grupos en FE
    router.get('/grupos/:id', gruposControllerFE.mostrarGrupo);

    //Muestra Meetis por categorias
    router.get('/categoria/:categoria', meetiControllerFE.mostrarCategoria);

    //busqueda
    router.get('/busqueda', busquedaControllerFE.resultadosBusqueda);

    //Crear y Confirmar Cuenta
    router.get('/crear-cuenta', usuarioController.formCrearCuenta);
    router.post('/crear-cuenta', usuarioController.crearNuevaCuenta);
    router.get('/confirmar-cuenta/:correo', usuarioController.confirmarCuenta);

    //Iniciar Sesion
    router.get('/iniciar-sesion', usuarioController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);

    //Cerrar Sesion
    router.get('/cerrar-sesion', authController.usuarioAutenticado, authController.cerrarSesion);

    /*AREA PRIVADA*/

    //Panel de Adminsitración
    router.get('/administracion', authController.usuarioAutenticado ,adminController.panelAdministracion);

    //Nuevos Grupos
    router.get('/nuevo-grupo', authController.usuarioAutenticado, gruposController.formNuevoGrupo);
    router.post('/nuevo-grupo', authController.usuarioAutenticado, gruposController.subirImagen, gruposController.crearGrupo);

    //Editar Grupos
    router.get('/editar-grupo/:grupoId', authController.usuarioAutenticado, gruposController.formEditarGrupo);
    router.post('/editar-grupo/:grupoId', authController.usuarioAutenticado, gruposController.editarGrupo);

    //Editar la imagen del grupo
    router.get('/imagen-grupo/:grupoId', authController.usuarioAutenticado, gruposController.formEditarImagen);
    router.post('/imagen-grupo/:grupoId', authController.usuarioAutenticado, gruposController.subirImagen, gruposController.editarImagen);

    //Eliminar Grupos
    router.get('/eliminar-grupo/:grupoId', authController.usuarioAutenticado, gruposController.formEliminarGrupo);
    router.post('/eliminar-grupo/:grupoId', authController.usuarioAutenticado, gruposController.eliminarGrupo)

    //Nuevos Meetis
    router.get('/nuevo-meeti', authController.usuarioAutenticado, meetiController.formNuevoMeeti);
    router.post('/nuevo-meeti', authController.usuarioAutenticado, meetiController.sanitizarMeeti, meetiController.crearMeeti);

    //Editar Meetis
    router.get('/editar-meeti/:id', authController.usuarioAutenticado, meetiController.formEditarMeeti);
    router.post('/editar-meeti/:id', authController.usuarioAutenticado, meetiController.editarMeeti);

    //Eliminar Meetis
    router.get('/eliminar-meeti/:id', authController.usuarioAutenticado, meetiController.formEliminarMeeti);
    router.post('/eliminar-meeti/:id', authController.usuarioAutenticado, meetiController.eliminarMeeti);

    //Editar Información de perfil
    router.get('/editar-perfil', authController.usuarioAutenticado, usuarioController.formEditarPerfil);
    router.post('/editar-perfil', authController.usuarioAutenticado, usuarioController.editarPerfil);

    //Modifica el password
    router.get('/cambiar-password', authController.usuarioAutenticado, usuarioController.formCambiarPassword);
    router.post('/cambiar-password', authController.usuarioAutenticado, usuarioController.cambiarPassword);

    //Imagenes de perfil
    router.get('/imagen-perfil',authController.usuarioAutenticado, usuarioController.formSubirImagenPerfil);
    router.post('/imagen-perfil',authController.usuarioAutenticado, usuarioController.subirImagen ,usuarioController.guardarImagenPerfil);

    return router;
}