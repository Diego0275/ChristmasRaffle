//-----------------------------Script para sorteo-------------------------------------
// Función para cargar JSON desde archivo
async function cargarJSON(ruta) {
    const respuesta = await fetch(ruta);
    return respuesta.json();
}

// Inicializa datos en localStorage si no existen
async function inicializarDatos() {
    if (!localStorage.getItem("empleados")) {
        const premiosIniciales = await cargarJSON("empleados.json");
        localStorage.setItem("empleados", JSON.stringify(premiosIniciales.empleados));
    }

    if (!localStorage.getItem("premios")) {
        const premiosIniciales = await cargarJSON("premios.json");
        localStorage.setItem("premios", JSON.stringify(premiosIniciales.premios));
    }

    if (!localStorage.getItem("resultadosW")) {
        localStorage.setItem("resultadosW", JSON.stringify([]));
    }

    if (!localStorage.getItem("resultadosL")) {
        localStorage.setItem("resultadosL", JSON.stringify([]));
    }
}

// Función para iniciar el sorteo con animación
async function participar() {
    const id = parseInt(document.getElementById("idEmpleado").value);
    const empresa = document.getElementById("empresa").value.trim().toUpperCase();

    // Validación visual rápida antes de animar
    if (!empresa || !id) {
            mostrarMensaje("Por favor completa todos los campos");
            return;
    }

    try {
        await inicializarDatos();
        
        let empleados = JSON.parse(localStorage.getItem("empleados"));
        let premios = JSON.parse(localStorage.getItem("premios"));
        let resultadosW = JSON.parse(localStorage.getItem("resultadosW"));
        let resultadosL = JSON.parse(localStorage.getItem("resultadosL"));

        // Buscar el empleado
        const empleado = empleados.find(e => e.id === id && e.empresa === empresa);

        if (empleado) {
            // Verificar si ya ganó
            if (resultadosW.some(r => r.id == id && r.empresa == empresa) || resultadosL.some(s => s.id == id && s.empresa == empresa)) {
                mostrarMensaje("Este empleado ya participó en el sorteo.");
            } else {
                // Verificar si hay premios disponibles
                if (!premios || premios.length === 0) {
                        mostrarMensaje("¡Ya se acabaron los premios! 😱");
                        return;
                }

                // Selección de premio
                const premioIndex = Math.floor(Math.random() * premios.length);
                const premio = premios[premioIndex];
                
                const nuevoResultadoW = {
                    empresa,
                    id: empleado.id,
                    nombre: empleado.nombre,
                    premio: premio.id,
                    descripcion: premio.nombre
                };

                const nuevoResultadoL = {
                    empresa,
                    id: empleado.id,
                    nombre: empleado.nombre,
                    premio: premio.id,
                    descripcion: premio.nombre
                };

                if(premio.id != ""){
                    // Guardar resultado
                    resultadosW.unshift(nuevoResultadoW);
                    localStorage.setItem("resultadosW", JSON.stringify(resultadosW));

                    // Eliminar premio usado
                    premios.splice(premioIndex, 1);
                    localStorage.setItem("premios", JSON.stringify(premios));

                    const loader = document.getElementById('loaderOverlay');
                    loader.classList.add('active');

                    const audio = document.getElementById("audioLoader");
                    if(audio) {
                        audio.currentTime = 0;
                        audio.play().catch(e => console.log("Audio bloqueado por navegador"));
                    }

                    // Esperar animación y luego ejecutar lógica
                    setTimeout(() => {
                        loader.classList.remove('active');
                        mostrarGanador(empleado.nombre, premio.nombre);
                    }, 7000);

                    const fd = new FormData();
                    fd.append("empresa", empresa);
                    fd.append("id", empleado.id);
                    fd.append("nombre", empleado.nombre);
                    fd.append("descripcion", premio.nombre);
                    fd.append("premio", premio.id);         

                    fetch("guardarResultadosW.php", {
                        method: "POST",
                        body: fd
                    })
                    .then(res => res.text())
                    .then(r => {
                        console.log("Respuesta del servidor:", r);
                    })
                    .catch(err => console.log("Error en fetch:", err));


                } else {
                    // Guardar resultado
                    resultadosL.unshift(nuevoResultadoL);
                    localStorage.setItem("resultadosL", JSON.stringify(resultadosL));

                    premios.splice(premioIndex, 1);
                    localStorage.setItem("premios", JSON.stringify(premios));

                    const loader = document.getElementById('loaderOverlay');
                    loader.classList.add('active');

                    const audio = document.getElementById("audioLoader");
                    if(audio) {
                        audio.currentTime = 0;
                        audio.play().catch(e => console.log("Audio bloqueado por navegador"));
                    }

                    // Esperar animación y luego ejecutar lógica
                    setTimeout(() => {
                        loader.classList.remove('active');
                        mostrarNoGanador(empleado.nombre, premio.nombre);
                    }, 7000);

                    const fd = new FormData();
                    fd.append("empresa", empresa);
                    fd.append("id", empleado.id);
                    fd.append("nombre", empleado.nombre);
                    fd.append("descripcion", premio.nombre);
                    fd.append("premio", premio.id);         

                    fetch("guardarResultadosL.php", {
                        method: "POST",
                        body: fd
                    })
                    .then(res => res.text())
                    .then(r => {
                        console.log("Respuesta del servidor:", r);
                    })
                    .catch(err => console.log("Error en fetch:", err));
                }

                document.getElementById("empresa").value = "";
                document.getElementById("idEmpleado").value = "";
                document.getElementById("nombreEmpleado").value = "";
            }   
        } else {
            mostrarMensaje("No se encontró ningún empleado con esos datos.");
        }
    } catch (error) {
        console.error("Error:", error); 
        mostrarMensaje("Ocurrió un error al procesar los datos.");
    }
}

function mostrarNombre() {
    const id = parseInt(document.getElementById("idEmpleado").value);
    const empresa = document.getElementById("empresa").value.trim().toUpperCase();

    let empleados = JSON.parse(localStorage.getItem("empleados"));

    const empleado = empleados.find(e => e.id === id && e.empresa === empresa);

    if (empleado) {
        document.getElementById("nombreEmpleado").value = empleado.nombre;
    } else {
        document.getElementById("nombreEmpleado").value = "";
    }
}

function validarEmpresa() {
    const input = document.getElementById('empresa');
    let valor = input.value.trim().toUpperCase();

    // Permite solo P o T, solo 1 carácter
    if (!["P", "T"].includes(valor) && valor !== "") {
        input.value = "";
        valor.textContent = "Solo se permite la letra P o T.";
    } else {
        if (valor === "P"){
            valor.textContent = "";
            input.value = "PROMÉDICA"
        } else if (valor === "T") {
            valor.textContent = "";
            input.value = "TEQUILERA"
        }
    }
}

// Función para mostrar modal de ganador
function mostrarGanador(nombre, premio) {
    const modal = document.getElementById("modalGanador");
    const audio = document.getElementById("audioCelebracion");
    const textoContainer = document.getElementById("modalTexto1");

    textoContainer.innerHTML = `
        <strong>${nombre}</strong> ganó:<br>
        <span class="premio-destacado">${premio}</span> 🎁
    `;

    // Mostrar modal
    modal.classList.add("active");

    // Reproducir sonido
    if(audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log("Audio bloqueado por navegador"));
    }

    // Cerrar automáticamente después de un tiempo
    setTimeout(() => {
        setTimeout(() => {
            modal.classList.remove("active"); // Oculta modal nuevamente
        }, 500);
    }, 5000);
}

// Función para mostrar modal de repetido o error
function mostrarMensaje(mensajePersonalizado) {
    const modal = document.getElementById("modalMensaje");
    const texto = document.getElementById("modalTexto2");

    // Usar mensaje personalizado si existe, sino el default
    if (mensajePersonalizado) {
        texto.innerHTML = `<strong>${mensajePersonalizado}</strong>`;
    } else {
        texto.innerHTML = `<strong>Este empleado ya participó en el sorteo.</strong>`;
    }

    modal.classList.add("active");

    // Cerrar automáticamente después de un tiempo
    setTimeout(() => {
        setTimeout(() => {
            modal.classList.remove("active"); // Oculta modal nuevamente
        }, 500);
    }, 2000);
}

// Función para mostrar modal de NO ganador
function mostrarNoGanador(nombre, premio) {
    const modal = document.getElementById("modalNoGanador");
    const audio = document.getElementById("audioLose");
    const textoContainer = document.getElementById("modalTexto3");

    textoContainer.innerHTML = `
        <strong>${nombre}</strong> ganó:<br>
        <span class="premio-destacado">${premio}</span>
    `;

    // Mostrar modal
    modal.classList.add("active");

    // Reproducir sonido
    if(audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log("Audio bloqueado por navegador"));
    }

    // Cerrar automáticamente después de un tiempo
    setTimeout(() => {
        setTimeout(() => {
            modal.classList.remove("active"); // Oculta modal nuevamente
        }, 500);
    }, 5000);
}

//-----------------------------Script para tabla de resultados-------------------------------------
// Cargar tabla de resultados al iniciar
document.addEventListener('DOMContentLoaded', cargarTabla);

// Función para cargar la tabla de resultados
function cargarTabla() {
/*
    const tbody = document.getElementById('tablaBodyW');
    const resultadosW = JSON.parse(localStorage.getItem("resultadosW")) || [];

    tbody.innerHTML = ""; 

    if (resultadosW.length === 0) {
    tbody.innerHTML = `
        <tr>
        <td colspan="4" align="center" class="empty-msg">
            Aún no hay ganadores registrados. <br> 
            ¡Ve al sorteo para empezar!
        </td>
        </tr>
    `;
    return;
    }

    resultadosW.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td style="font-weight: bold;">${r.empresa}</td>
        <td style="font-weight: bold;">${r.nombre}</td>
        <td class="premio-col">${r.descripcion}</td>
    `;
    tbody.appendChild(tr);
    });
*/
    const tbody = document.getElementById('tablaBodyW');

    fetch("cargarTablaW.php")
        .then(res => res.json())
        .then(resultadosW => {

            tbody.innerHTML = ""; 

            if (resultadosW.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" align="center" class="empty-msg"> 
                            Aún no hay ganadores registrados. <br> 
                            ¡Ve al sorteo para empezar!
                        </td>
                    </tr>
                `;
                return;
            }

            resultadosW.forEach((r) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="font-weight: bold;">${r.empresa}</td>
                    <td style="font-weight: bold;">${r.nombre}</td>
                    <td class="premio-col">${r.descripcion}</td>
                `;
                tbody.appendChild(tr);
            });

        })
    .catch(err => console.error("Error cargando BD:", err));

}


inicializarDatos();

setInterval(cargarTabla, 1000);