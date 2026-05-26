import {ccaa} from "./data/ccaa.js";

function mostrarComunidades(listaATomar = ccaa, orden) {
    let listaOrden = [...listaATomar];
    if (orden === "nombre") {
        listaOrden.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
    if (orden === "poblacion") {
        listaOrden.sort((a, b) => a.poblacion_total - b.poblacion_total);
    }

    return listaOrden.map(comunidad => `
        <tr data-nombre="${comunidad.nombre}">
            <td>${comunidad.nombre}</td>
            <td>${comunidad.poblacion_total.toLocaleString()}</td>
        </tr>
    `).join("");
}


document.addEventListener("DOMContentLoaded", event => {
    const tabla = document.querySelector("tbody");
    const orden = document.querySelector("#orden");

    const inputCcAa = document.querySelector("#ccaa");
    const inputCapital = document.querySelector("#capital");
    const inputPresidente = document.querySelector("#presidente");
    const inputProvincias = document.querySelector("#provincias");
    const btnGuardar = document.querySelector("#btn-guardar");

    function actualizarTabla() {
        let valor = orden.value;
        tabla.innerHTML = mostrarComunidades(ccaa, valor);
    }

    actualizarTabla();

    orden.addEventListener("change", actualizarTabla);

    tabla.addEventListener("click", (e) => {
      const fila = e.target.closest("tr");

      if (!fila) return;

      const ccaaSelect = fila.dataset.nombre;
      const comunidad = ccaa.find(c => c.nombre === ccaaSelect);

      if (comunidad) {
          inputCcAa.value = comunidad.nombre;
          inputCapital.value = comunidad.capital;
          inputPresidente.value = comunidad.presidente;

          inputProvincias.value = comunidad.provincias.map(p => p.nombre).join("\n");

          btnGuardar.disabled = false;

          document.querySelectorAll("tr").forEach(tr => tr.classList.remove("seleccionada"));
          fila.classList.add("seleccionada");

      }

    });

})

