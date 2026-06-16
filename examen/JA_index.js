// variables globales
let filtroTexto = "";
let filtroGenero = "Todos";
let totalFestivalesFijo = 0;
let appContainer;
let listaFestivalesGlobal = []; // Guardamos los datos para poder filtrar en cualquier momento

document.addEventListener("DOMContentLoaded", () => {
    appContainer = document.getElementById("app");
    cargarFestivales();
});

// funciones de carga e inicializacion

async function cargarFestivales() {
    appContainer.innerHTML = `<p class="loading-message">Cargando los datos de los festivales, por favor espera...</p>`;
    try {
        const respuesta = await fetch("JA_festivales.json");
        if (!respuesta.ok) throw new Error(`Error al acceder al archivo (Código: ${respuesta.status})`);

        listaFestivalesGlobal = await respuesta.json();
        totalFestivalesFijo = listaFestivalesGlobal.length;

        inicializarAplicacion();
    } catch (error) {
        appContainer.innerHTML = `
            <div class="error-message">
                <p>No se pudieron cargar los festivales.</p>
                <small>Detalle del error: ${error.message}</small>
            </div>
        `;
    }
}

function inicializarAplicacion() {
    // Generamos la estructura base de la pagina
    appContainer.innerHTML = `
        <div class="filtros-container" id="seccion-filtros"></div>
            <p class="festivales-contador" id="elemento-contador"></p>
        <div class="festivales-container" id="contenedor-tarjetas"></div>
    `;

    // Una vez hecha la estructura, creamos los componentes dinámicos
    cargarFiltros();
    filtrarYMostrar();
}

// funciones de filtrado y renderizado

function cargarFiltros() {
    const contenedorFiltros = document.getElementById("seccion-filtros");

    // Extraemos los géneros únicos de todo el JSON
    const todosLosGeneros = listaFestivalesGlobal.flatMap(f => f.generos || []);
    const generosUnicos = [...new Set(todosLosGeneros)].sort((a, b) => a.localeCompare(b));
    const listaGeneros = ["Todos", ...generosUnicos];

    // creamos los géneros
    const botonesHTML = listaGeneros.map(genero => {
        const claseActivo = genero === filtroGenero ? "active" : "";
        const textoFormateado = genero.charAt(0).toUpperCase() + genero.slice(1);
        return `<button class="btn-genero ${claseActivo}" data-genero="${genero}">${textoFormateado}</button>`;
    }).join("");

    // añadimos el buscador y los botones generados en la sección de filtros
    contenedorFiltros.innerHTML = `
        <input type="text" id="buscador-input" class="buscador-input" placeholder="Buscar por nombre de festival o ciudad..." value="${filtroTexto}">
        <div class="botones-genero">${botonesHTML}</div>
    `;

    // eventos para filtros
    const buscador = document.getElementById("buscador-input");
    buscador.addEventListener("input", (e) => {
        filtroTexto = e.target.value.toLowerCase().trim();
        filtrarYMostrar();
    });

    const botones = contenedorFiltros.querySelectorAll(".btn-genero");
    botones.forEach(boton => {
        boton.addEventListener("click", () => {
            // Quitamos la clase activa al botón anterior y se la ponemos al pulsado
            contenedorFiltros.querySelector(".btn-genero.active")?.classList.remove("active");
            boton.classList.add("active");

            // Actualizamos el estado del filtro y volvemos a cargar
            filtroGenero = boton.getAttribute("data-genero");
            filtrarYMostrar();
        });
    });
}

function filtrarYMostrar() {
    const contenedorTarjetas = document.getElementById("contenedor-tarjetas");
    const elementoContador = document.getElementById("elemento-contador");

    // Aplicamos los filtros sobre el array global
    const festivalesFiltrados = listaFestivalesGlobal.filter(festival => {
        const coincideTexto = festival.nombre.toLowerCase().includes(filtroTexto) ||
            festival.ciudad.toLowerCase().includes(filtroTexto);

        const coincideGenero = filtroGenero === "Todos" ||
            (festival.generos && festival.generos.includes(filtroGenero));

        return coincideTexto && coincideGenero;
    });

    // Actualizamos el texto del contador
    elementoContador.innerHTML = `Se muestran ${festivalesFiltrados.length} de ${totalFestivalesFijo} festivales`;

    // Si no hay resultados, mostramos el mensaje vacío
    if (festivalesFiltrados.length === 0) {
        contenedorTarjetas.innerHTML = `
            <div class="no-results">
                <p>No hay festivales que coincidan con los criterios de búsqueda.</p>
            </div>
        `;
        return;
    }

    // Mapeamos y unimos el HTML de cada tarjeta
    contenedorTarjetas.innerHTML = festivalesFiltrados.map((festival, index) => {
        return generarTarjeta(festival, index);
    }).join("");

    // asignación de eventos a tarjetas (validar y guardar)
    festivalesFiltrados.forEach((festival, index) => {
        const inputDirector = document.getElementById(`input-director-${index}`);
        const botonGuardar = document.getElementById(`btn-guardar-${index}`);
        const mensajeValidacion = document.getElementById(`msg-val-${index}`);

        if (inputDirector && botonGuardar && mensajeValidacion) {

            // Evento al escribir en el input
            inputDirector.addEventListener("input", () => {
                const valorActual = inputDirector.value.trim();
                const tieneNumeros = /\d/.test(valorActual);

                mensajeValidacion.innerHTML = "";
                mensajeValidacion.className = "mensaje-validacion";

                if (tieneNumeros) {
                    mensajeValidacion.innerHTML = "⚠️ El nombre no puede contener números";
                    mensajeValidacion.classList.add("msg-error");
                    botonGuardar.disabled = true;
                } else if (valorActual === "") {
                    botonGuardar.disabled = true;
                } else {
                    botonGuardar.disabled = (valorActual === festival.director);
                }
            });

            // Evento al pulsar Guardar
            botonGuardar.addEventListener("mousedown", (e) => {
                // Evitamos que el input pierda el foco antes de tiempo y salte el blur
                e.preventDefault();

                const nuevoDirector = inputDirector.value.trim();
                festival.director = nuevoDirector;
                botonGuardar.disabled = true;

                mensajeValidacion.innerHTML = "✓ Guardado correctamente";
                mensajeValidacion.className = "mensaje-validacion msg-exito";

                // Devolvemos el foco al input o lo quitamos limpiamente
                inputDirector.blur();

                setTimeout(() => {
                    if (mensajeValidacion.classList.contains("msg-exito")) {
                        mensajeValidacion.innerHTML = "";
                        mensajeValidacion.classList.remove("msg-exito");
                    }
                }, 3000);
            });

            // Evento al salir que muestre el director guardado
            inputDirector.addEventListener("blur", () => {
                const valorActual = inputDirector.value.trim();

                // Si al salir del input, el valor actual NO coincide con el de memoria,
                // significa que hay cambios sin guardar (o texto inválido).
                // volvemos al original
                if (valorActual !== festival.director) {
                    inputDirector.value = festival.director;

                    // Limpiamos los mensajes de error/advertencia visuales
                    mensajeValidacion.innerHTML = "";
                    mensajeValidacion.className = "mensaje-validacion";
                    botonGuardar.disabled = true;
                }
            });
        }
    });
}

function generarTarjeta(festival, index) {
    // Formateador de moneda
    const formateadorPrecio = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0
    });

    const precioFormateado = formateadorPrecio.format(festival.precio_entrada);

    // Cálculo del total de artistas
    let totalArtistas = 0;
    if (festival.escenarios && Array.isArray(festival.escenarios)) {
        totalArtistas = festival.escenarios.reduce((acumulador, escenario) => {
            const artistasEnEscenario = escenario.artistas ? escenario.artistas.length : 0;
            return acumulador + artistasEnEscenario;
        }, 0);
    }

    // Formateo de género dentro de la tarjeta
    const generosHTML = festival.generos
        ? festival.generos.map(g => `<span class="festival-badge">${g.charAt(0).toUpperCase() + g.slice(1)}</span>`).join("")
        : "";

    // Formateo los escenarios
    const escenariosHTML = festival.escenarios && Array.isArray(festival.escenarios)
        ? festival.escenarios.map(escenario => `<p>${escenario.nombre.toUpperCase()}</p>`).join("")
        : "<p>SIN ESCENARIOS REGISTRADOS</p>";

    // mostramos toda la estructura
    return `
        <article class="festival-card">
            <div class="tarjeta-seccion-principal">
                <h2>${festival.nombre}</h2>
                <p class="festival-meta">${festival.ciudad} · ${festival.mes}</p>
                <div class="festival-precio-artistas">
                    <span class="festival-precio">${precioFormateado}</span>
                    <span class="festival-artistas">${totalArtistas} artistas</span>
                </div>
                <div class="festival-badges-container">${generosHTML}</div>
            </div>

            <div class="tarjeta-seccion-escenarios">
                ${escenariosHTML}
            </div>

            <div class="director-section">
                <label>DIRECTOR/A</label>
                <div class="director-input-container">
                    <input type="text" id="input-director-${index}" class="director-input" value="${festival.director}">
                    <button id="btn-guardar-${index}" class="btn-guardar" disabled>Guardar</button>
                </div>
                <span id="msg-val-${index}" class="mensaje-validacion"></span>
            </div>
        </article>
    `;
}