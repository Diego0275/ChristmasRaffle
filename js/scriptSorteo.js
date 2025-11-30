//-----------------------------Script para sorteo-------------------------------------
// Función para cargar JSON desde archivo
async function cargarJSON(ruta) {
    const respuesta = await fetch(ruta);
    return respuesta.json();
}

// Inicializa datos en sessionStorage si no existen
async function inicializarDatos() {
    if (!sessionStorage.getItem("premios")) {
        const premiosIniciales = await cargarJSON("premios.json");
        sessionStorage.setItem("premios", JSON.stringify(premiosIniciales.premios));
    }

    if (!sessionStorage.getItem("resultados")) {
        sessionStorage.setItem("resultados", JSON.stringify([]));
    }
}

// Función para iniciar el sorteo con animación
async function participar() {
    const id = parseInt(document.getElementById("idEmpleado").value);
    const empresa = document.getElementById("empresa").value.trim().toUpperCase();
    const errorDiv = document.getElementById("resultado");
    errorDiv.textContent = ""; // Limpiar errores previos

    // Validación visual rápida antes de animar
    if (!empresa || !id) {
            mostrarRepetido("Por favor completa todos los campos");
            return;
    }

    try {
        await inicializarDatos();
        const data = await cargarJSON("empleados.json");
        const empleados = data.empleados;
        
        let premios = JSON.parse(sessionStorage.getItem("premios"));
        let resultados = JSON.parse(sessionStorage.getItem("resultados"));

        // Buscar el empleado
        const empleado = empleados.find(e => e.id === id && e.empresa === empresa);

        if (empleado) {
            // Verificar si ya ganó
            if (resultados.some(r => r.id == id && r.empresa == empresa)) {
                mostrarRepetido("Este empleado ya participó en el sorteo.");
            } else {
                // Verificar si hay premios disponibles
                if (!premios || premios.length === 0) {
                        mostrarRepetido("¡Ya se acabaron los premios! 😱");
                        return;
                }

                // Selección de premio
                const premioIndex = Math.floor(Math.random() * premios.length);
                const premio = premios[premioIndex];
                
                const nuevoResultado = {
                    empresa,
                    id: empleado.id,
                    nombre: empleado.nombre,
                    premio: premio.id,
                    descripcion: premio.nombre
                };

                // Guardar resultado
                resultados.push(nuevoResultado);
                sessionStorage.setItem("resultados", JSON.stringify(resultados));

                // Eliminar premio usado
                premios.splice(premioIndex, 1);
                sessionStorage.setItem("premios", JSON.stringify(premios));

                const loader = document.getElementById('loaderOverlay');
                loader.classList.add('active');

                // Esperar animación (500ms) y luego ejecutar lógica
                setTimeout(() => {
                    loader.classList.remove('active');
                    mostrarGanador(empleado.nombre, premio.nombre);
                }, 5000);
            }   
        } else {
            // Usamos el modal de error en lugar de solo texto plano
            mostrarRepetido("No se encontró ningún empleado con esos datos.");
        }
    } catch (error) {
        console.error("Error:", error);
        mostrarRepetido("Ocurrió un error al procesar los datos.");
    }
}

function validarEmpresa() {
    const input = document.getElementById('empresa');
    let valor = input.value.toUpperCase();

    // Permite solo P o T, solo 1 carácter
    if (!["P", "T"].includes(valor) && valor !== "") {
        input.value = "";
        valor.textContent = "Solo se permite la letra P o T.";
    } else {
        valor.textContent = "";
        input.value = valor; // convierte a mayúscula
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
function mostrarRepetido(mensajePersonalizado) {
    const modal = document.getElementById("modalRepetido");
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

inicializarDatos();