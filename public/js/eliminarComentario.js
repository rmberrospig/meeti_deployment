import axios from 'axios';
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', () => {
    const formEliminar = document.querySelectorAll('.eliminar-comentario');

    if(formEliminar.length > 0) {
        formEliminar.forEach(form => {
            form.addEventListener('submit', eliminarComentario);
        });
    }
});

function eliminarComentario(e) {
    e.preventDefault();

    Swal.fire({
        title: "Eliminar Comentario",
        text: "Un comentario eliminado no puede ser recuperado!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, borrar!",
        cancelButtonText: 'Cancelar'
    }).then((result) => {

        if (result.isConfirmed) {

            //tomar id
            const comentarioId = this.children[0].value;

            //crear el objeto
            const datos = {
                comentarioId
            }

            //invocar axios
            axios.post(this.action, datos).then(respuesta => {
                console.log(respuesta);

                Swal.fire({
                    title: "Eliminado!",
                    text: respuesta.data,
                    icon: "success"
                });

                this.parentElement.parentElement.remove();
            }).catch(error => {
                if(error.response.status === 403 || error.response.status === 404) {
                    Swal.fire({
                        title: "Error",
                        text: error.response.data,
                        icon: "error"
                    });
                }
            });

            
        }
    });
    
    
}