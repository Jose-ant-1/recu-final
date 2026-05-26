import  {ccaa} from "./data/ccaa.js";


function mostrarComunidades(listaATomar = ccaa, orden) {
    let listaOrden = [...listaATomar];
    if (orden === "nombre") {
        listaOrden.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
    if (orden === "poblacion") {
        listaOrden.sort((a, b) => a.poblacion_total - b.poblacion_total);
    }

    return listaOrden.map(comunidad => `
        <tr>
        <td>${comunidad.nombre}</td>
        <td>${comunidad.poblacion_total.toLocaleString()}</td>
        </tr>
    `).join("");


}

document.addEventListener("DOMContentLoaded", event => {
    const tabla = document.querySelector("tbody");
    const orden = document.querySelector("#orden").value;
    console.log(orden)
    tabla.innerHTML = mostrarComunidades(ccaa, orden);

    document.addEventListener("change", tabla.innerHTML = mostrarComunidades(ccaa, orden))



})

