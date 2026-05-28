import {datosUE} from "./data/uecountries.js"


function tomarIdiomas(listaPaises = datosUE) {
    const idiomas = new Set();
    listaPaises.forEach(pais => {

        idiomas.add(pais.idiomas.oficial);
        if (pais.idiomas.otros_idiomas) {
            const otros = pais.idiomas.otros_idiomas.split(',').map(idioma => idioma.trim());
            otros.forEach(otro => idiomas.add(otro));
        }

    })
    return Array.from(idiomas).sort();

}

function mostrarIdiomas() {
    let idiomas = tomarIdiomas(datosUE);
    return idiomas.map(idioma =>
        `
        <input id="${idioma}" type="radio"></input>
        <label for="${idioma}">${idioma}</label>
    `).join('');
}

document.addEventListener("DOMContentLoaded", () => {
    const divIdiomas = document.querySelector("#idiomas");
    const checOficial = document.querySelector("#oficiales");

    divIdiomas.innerHTML += mostrarIdiomas();


})




