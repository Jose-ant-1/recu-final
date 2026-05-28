import {ccaa} from "./data/ccaa.js";

function mostrarComunidades(listaATomar = ccaa, orden) {
    let listaOrden = [...listaATomar];
    if (orden === "nombre") {
        listaOrden.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
    if (orden === "poblacion") {
        listaOrden.sort((a, b) => b.poblacion_total - a.poblacion_total);
    }

    return listaOrden.map(comunidad => `
        <tr data-nombre="${comunidad.nombre}">
            <td>${comunidad.nombre}</td>
            <td>${comunidad.poblacion_total.toLocaleString()}</td>
        </tr>
    `).join("");
}

function guardarPresidente(nombreCcaa, presidente) {
    const comunidad =ccaa.find(c => c.nombre === nombreCcaa);
    if (comunidad) {
        comunidad.presidente = presidente;
        return true;
    }
    return false;
}

document.addEventListener("DOMContentLoaded", event => {
    const tabla = document.querySelector("tbody");
    const orden = document.querySelector("#orden");
    const errorMensaje = document.querySelector("#error-presidente");

    const inputCcAa = document.querySelector("#ccaa");
    const inputCapital = document.querySelector("#capital");
    const inputPresidente = document.querySelector("#presidente");
    const inputProvincias = document.querySelector("#provincias");
    const btnGuardar = document.querySelector("#btn-guardar");

    function resetFormulario() {
        inputCcAa.value = "";
        inputCapital.value = "";
        inputPresidente.value = "";
        inputProvincias.value = "";
        btnGuardar.disabled = true; // Desactivamos el botón
        inputPresidente.style.borderColor = "#ccc"; // Reseteamos el color de borde
    }

    resetFormulario();

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
          validar()
      }

    });

    function validar() {
        const valor = inputPresidente.value.trim();
        if (valor === "") {
            btnGuardar.disabled = true;
            inputPresidente.style.borderColor = "red";
            errorMensaje.style.display = "block"; // Muestra el mensaje
            return false;
        } else {
            btnGuardar.disabled = false;
            inputPresidente.style.borderColor = "#ccc";
            errorMensaje.style.display = "none"; // Oculta el mensaje
            return true;
        }
    }

    inputPresidente.addEventListener("input", validar);

    btnGuardar.addEventListener("click", (e) => {
        const nombreCcaa = inputCcAa.value;
        const nuevoPresidente = inputPresidente.value;

        if (validar()) {
            if (guardarPresidente(nombreCcaa, nuevoPresidente)) {
                mostrarMensajeExito();
            }
        }

    })

    function mostrarMensajeExito() {
        const mensajeAnterior = document.querySelector(".mensaje-exito");
        if (mensajeAnterior) {
            mensajeAnterior.remove();
        }

        const mensaje = document.createElement("div");
        mensaje.textContent = "Presidente actualizado correctamente";
        mensaje.className = "mensaje-exito";
        mensaje.style.color = "green";
        mensaje.style.marginTop = "10px";

        document.querySelector(".seccion-formulario").appendChild(mensaje);

        setTimeout(() => {
            if (mensaje.parentNode) {
                mensaje.remove();
            }
        }, 4000);
    }


})

