import {datosUE} from "./data/uecountries.js";

const ESTILO_BOOSTRAP = 'd-inline-flex align-items-center gap-1 border border-secondary rounded px-2 py-1 me-1 mb-1';
const mediaPoblacion = datosUE.reduce((suma, pais) => suma + pais.poblacion_nacional, 0) / datosUE.length;

function obtenerIdiomasUnicos(soloOficiales = false) {
    const setIdiomas = new Set();
    datosUE.forEach(pais => {
        if (pais.idiomas.oficial) {
            pais.idiomas.oficial.split(', ').forEach(i => setIdiomas.add(i.trim().toLowerCase()));
        }
        if (!soloOficiales && pais.idiomas.otros_idiomas) {
            pais.idiomas.otros_idiomas.split(', ').forEach(i => setIdiomas.add(i.trim().toLowerCase()));
        }
    });
    return Array.from(setIdiomas).sort();
}

function mostrarRadioIdiomas() {
    const idiomas = obtenerIdiomasUnicos();

    return idiomas.map(idioma => {

        return `
            <div class="${ESTILO_BOOSTRAP} idioma-box">
                <input class="form-check-input m-0" type="radio" id="${idioma}" name="idioma" value="${idioma}">
                <label class="form-check-label m-0" for="${idioma}">${idioma}</label>
            </div>
        `;
    }).join('');
}

function mostrarDatosTabla(datos) {
    const datosOrdenados = [...datos].sort((a, b) => b.poblacion_nacional - a.poblacion_nacional);

    return datosOrdenados.map(pais => {
        const fechaFormateada = new Date(pais.fecha_adhesion).toLocaleDateString('es-ES');
        const poblacionFormateada = pais.poblacion_nacional.toLocaleString('es-ES');

        const esMonarquia = pais.regimen_politico.tipo.toLowerCase().includes("monarquía");

        const claseDestacado = pais.poblacion_nacional > mediaPoblacion ? 'class="destacado"' : '';

        return `
            <tr ${claseDestacado}>
                <td>${pais.pais} ${esMonarquia ? '👑' : ''}</td>
                <td>${pais.capital}</td>
                <td>${poblacionFormateada}</td>
                <td>${fechaFormateada}</td>
            </tr>
        `;

    }).join('');
}

function filtrarPaises(idiomaSeleccionado, soloOficiales) {
    if (idiomaSeleccionado === "ninguno") return datosUE;

    return datosUE.filter(pais => {
        const esOficial = pais.idiomas.oficial?.toLowerCase().split(', ').includes(idiomaSeleccionado);

        if (soloOficiales) {
            return esOficial;
        } else {
            const esOtros = pais.idiomas.otros_idiomas?.toLowerCase().split(', ').includes(idiomaSeleccionado);
            return esOficial || esOtros;
        }
    });
}

function mostrarTotalPoblacion() {
    let total = datosUE.reduce((suma, pais) => suma + pais.poblacion_nacional, 0);
    return `<br>(${total.toLocaleString('es-ES')} total UE)`;
}

function actualizarBadge(datosFiltrados = datosUE, idioma = "ninguno", soloOficiales = false) {
    const badge = document.querySelector("#badge-informacion");
    const totalPaisesFiltrados = datosFiltrados.length;

    if (idioma === "ninguno") {
        badge.innerHTML = `Se muestran los ${totalPaisesFiltrados} países de la UE`;
    } else {

        const tipoIdioma = soloOficiales ? "oficial" : "oficial o no oficial";

        badge.innerHTML = `Filtrado por: "${idioma}" (${tipoIdioma}) (${totalPaisesFiltrados} de 27)`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const radioContenedor = document.querySelector("#radio-contenedor");
    const tabla = document.querySelector("tbody");
    const totalPoblacion = document.querySelector('#totalPoblacion');
    const divIdiomasGeneral = document.querySelector("#idiomas");

    radioContenedor.innerHTML += mostrarRadioIdiomas();
    totalPoblacion.innerHTML = mostrarTotalPoblacion();

    tabla.innerHTML = mostrarDatosTabla(datosUE);

    actualizarBadge();

    divIdiomasGeneral.addEventListener("change", () => {
        const idiomaSelect = document.querySelector('input[name="idioma"]:checked').value;
        const oficiales = document.querySelector('#oficiales').checked;

        const datosFiltrado = filtrarPaises(idiomaSelect, oficiales);

        tabla.innerHTML = mostrarDatosTabla(datosFiltrado);

        actualizarBadge(datosFiltrado, idiomaSelect, oficiales);
    });
});