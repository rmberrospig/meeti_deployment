import { OpenStreetMapProvider } from "leaflet-geosearch";
import asistencia from './asistencia';
import eliminarComentario from './eliminarComentario';

(function(){
    const lat = document.querySelector('#lat')?.value || -11.99171027547065;
    const lng = document.querySelector('#lng')?.value || -77.08935320377351;
    const direccion = document.querySelector('#direccion')?.value || '';
    const mapa = L.map('mapa').setView([lat, lng ], 16);
    let markers = new L.FeatureGroup().addTo(mapa);
    let marker;

    //Utilizando Provider y Geocoder
    const geocodeService = L.esri.Geocoding.geocodeService();

    //Colocar PIN en edición
    if(lat && lng) {
        marker = new L.marker([lat, lng], {
            draggable: true,
            autoPan: true
        }).addTo(mapa)
        .bindPopup(direccion)
        .openPopup();

        markers.addLayer(marker);

        //Detectar movimiento marker
        marker.on('moveend', function(e) {
            marker = e.target;
            const posicion = marker.getLatLng();
            mapa.panTo(new L.LatLng(posicion.lat, posicion.lng));

            //Reverse Geocoding
            geocodeService.reverse().latlng(posicion, 16).run(function(error, result) {
                llenarInputs(result);
                //Asigna valores al marker
                marker.bindPopup(result.address.LongLabel);
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapa);

        //Buscar la direccion
        const buscador = document.querySelector('#formbuscador');
        buscador.addEventListener('input', buscarDireccion);
    });


    const buscarDireccion = (e) => {
        if(e.target.value.length > 8) {

            //Si existe un PIN limpiarlo
            markers.clearLayers();

            
            const provider = new OpenStreetMapProvider();
            provider.search({ query: e.target.value }).then((resultado) => {
                geocodeService.reverse().latlng(resultado[0].bounds[0], 16).run(function(error, result) {
                    llenarInputs(result);
                    mapa.setView(resultado[0].bounds[0], 16)
                    marker = new L.marker(resultado[0].bounds[0], {
                        draggable: true,
                        autoPan: true
                    }).addTo(mapa)
                    .bindPopup(resultado[0].label)
                    .openPopup();

                    markers.addLayer(marker);

                    //Detectar movimiento marker
                    marker.on('moveend', function(e) {
                        marker = e.target;
                        const posicion = marker.getLatLng();
                        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng));

                        //Reverse Geocoding
                        geocodeService.reverse().latlng(posicion, 16).run(function(error, result) {
                            llenarInputs(result);
                            //Asigna valores al marker
                            marker.bindPopup(result.address.LongLabel);
                        });
                    });
                });

            });
        }
    }

    const llenarInputs = (resultado) => {
        console.log(resultado);
        document.querySelector('#direccion').value = resultado.address.Address || '';
        document.querySelector('#ciudad').value = resultado.address.City || '';
        document.querySelector('#estado').value = resultado.address.Region || '';
        document.querySelector('#pais').value = resultado.address.CountryCode || '';
        document.querySelector('#lat').value = resultado.latlng.lat || '';
        document.querySelector('#lng').value = resultado.latlng.lng || '';
    }



})()