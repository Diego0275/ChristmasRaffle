//-----------------------------Script para sorteo-------------------------------------
// Función para cargar JSON desde archivo
async function cargarJSON(ruta) {
    const respuesta = await fetch(ruta);
    return respuesta.json();
}

// Inicializa datos en localStorage si no existen
async function inicializarDatos() {
    if (!localStorage.getItem("empleados")) {
        const premiosIniciales = await cargarJSON("json/empleados.json");
        let empleados = premiosIniciales.empleados;
        empleados= mezclarPremios(empleados);
        localStorage.setItem("empleados", JSON.stringify(premiosIniciales.empleados));
    }

    if (!localStorage.getItem("premios")) {
        const premiosIniciales = await cargarJSON("json/premios.json");
        localStorage.setItem("premios", JSON.stringify(premiosIniciales.premios));
    }
/*
    if (!localStorage.getItem("premios")) {
        const premiosInicialesR = await cargarJSON("premios.json");
        const premiosInicialesG = await cargarJSON("premiosG.json");
        let premiosCombinados = [
            ...premiosInicialesR.premios,
            ...premiosInicialesG.premios
        ];
        premiosCombinados = mezclarPremios(premiosCombinados);
        localStorage.setItem("premios", JSON.stringify(premiosCombinados));
    }
*/
    if (!localStorage.getItem("resultadosW")) {
        localStorage.setItem("resultadosW", JSON.stringify([]));
    }

    if (!localStorage.getItem("resultadosL")) {
        localStorage.setItem("resultadosL", JSON.stringify([]));
    }
}

function mezclarPremios(array) {
    let i = array.length;
    while (i > 0) {
        const j = Math.floor(Math.random() * i);
        i--;
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function iniciarSorteo() {
    await inicializarDatos(); 
    
    const empleados = JSON.parse(localStorage.getItem("empleados")) || [];
    const resultadosW = JSON.parse(localStorage.getItem("resultadosW")) || [];
    const resultadosL = JSON.parse(localStorage.getItem("resultadosW")) || [];
    const premios = JSON.parse(localStorage.getItem("premios")) || [];

    if (premios.length === 0) {
        mostrarMensaje("No hay premios para iniciar el sorteo automático.");
        return;
    }

    // Filtrar candidatos que NO han ganado
    const candidatos = empleados.filter(e => 
        !resultadosW.some(r => r.id === e.id && r.empresa === e.empresa)
    );

    let noGanadores = empleados.slice(premios.length);
    resultadosL.push(...noGanadores);
    localStorage.setItem("resultadosL", JSON.stringify(resultadosL));
    for (const per of resultadosL ) {
        const fd = new FormData();
        fd.append("empresa", per.empresa);
        fd.append("id", per.id);
        fd.append("nombre", per.nombre);
        fd.append("descripcion", per.descripcion);
        fd.append("premio", per.premio);         

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

    let premioIndex = 0;
    // --- BUCLE PRINCIPAL ---
    for (const emp of candidatos) {
        if (premioIndex == premios.length) {
            mostrarMensaje("¡Sorteo finalizado!");
            break;
        }

        const exito = await participar(emp.id, emp.empresa, premioIndex);

        if (exito) {
            await new Promise(r => setTimeout(r, 13000));
        } else {
            await new Promise(r => setTimeout(r, 13000));
        }
        premioIndex++;

        cargarTabla();
    }
}

async function participar(id, empresa, premioIndex) {
    try {
        await inicializarDatos();
        
        let empleados = JSON.parse(localStorage.getItem("empleados"));
        let premios = JSON.parse(localStorage.getItem("premios"));
        let resultadosW = JSON.parse(localStorage.getItem("resultadosW"));
        let resultadosL = JSON.parse(localStorage.getItem("resultadosL"));

        const respLimite = await fetch("verificarLimite.php");
        const totalLimite = await respLimite.text();
        if (parseInt(totalLimite) == premios.length) {
            mostrarMensaje("¡Se alcanzó el límite de ganadores! <br> Sorteo finalizado.");
            return; 
        } else {
            console.log("Aun hay premios disponibles");
            // Buscar el empleado
            const empleado = empleados.find(e => e.id === id && e.empresa === empresa);

            if (empleado) {
                // Verificar si ya ganó
                if (resultadosW.some(r => r.id == id && r.empresa == empresa) || resultadosL.some(s => s.id == id && s.empresa == empresa)) {
                    mostrarMensaje("Este empleado ya participó.");
                } else {
                    const formData = new FormData();
                    formData.append('id', id);
                    formData.append('empresa', empresa);

                    const respValidacion = await fetch('validarParticipacion.php', {
                        method: 'POST',
                        body: formData
                    });

                    const statusTexto = await respValidacion.text();

                    if (statusTexto.trim() === 'PARTICIPO') {
                        mostrarMensaje("Este empleado ya participó.");
                        return;
                    } else if (statusTexto.trim() === 'NO PARTICIPO') {
                        console.log("Empleado no ha participado, puede continuar.");
                        
                        if (!premios || premios.length === 0) {
                            mostrarMensaje("¡Ya se acabaron los premios! 😱");
                            return;
                        }

                        const premio = premios[premioIndex];
                        console.log(`Premio seleccionado: ${premio.nombre} (ID: ${premio.id})`);

                        const fdPremio = new FormData();
                        fdPremio.append('premio', premio.id);

                        const respPremio = await fetch('validarPremio.php', { method: 'POST', body: fdPremio });
                        const statusPremio = await respPremio.text();

                        if (statusPremio.trim() === 'REPETIDO') {
                            console.log(`El premio ${premio.nombre} ya fue ganado. Re-sorteando...`);
                            return participar(); 
                        }
                        
                        const nuevoResultadoW = {
                            empresa,
                            id: empleado.id,
                            nombre: empleado.nombre,
                            premio: premio.id,
                            descripcion: premio.nombre
                        };
                        // Guardar resultado
                        resultadosW.unshift(nuevoResultadoW);
                        localStorage.setItem("resultadosW", JSON.stringify(resultadosW));

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
                            mostrarGanador(empleado.nombre, premio.id);
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
                    }
                }   
            } else {
                mostrarMensaje("No se encontró ningún empleado con esos datos.");
            }
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
    if (!["P", "D", "A"].includes(valor) && valor !== "") {
        input.value = "";
        valor.textContent = "Solo se permite la letra P o D o A.";
    } else {
        if (valor === "P"){
            valor.textContent = "";
            input.value = "PROMEDICA"
        } else if (valor === "D") {
            valor.textContent = "";
            input.value = "DESTILADORA"
        } else if (valor === "A") {
            valor.textContent = "";
            input.value = "AGAVES"
        }
    }
}

// Función para mostrar modal de ganador
function mostrarGanador(nombre, descripcion) {
    const modal = document.getElementById("modalGanador");
    const audio = document.getElementById("audioCelebracion");
    const textoContainer = document.getElementById("modalTexto1");

    textoContainer.innerHTML = `
        <strong>${nombre}</strong> ganó:<br>
        <span class="premio-destacado">${descripcion}</span> 🎁
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

    leerModal();

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

function leerModal() {
    const texto = document.getElementById("modalContenido").innerText;

    const speech = new SpeechSynthesisUtterance(texto);
    speech.lang = "es-MX"; // Ajusta el idioma
    speech.rate = 1.0;     // Velocidad
    speech.pitch = 1.0;    // Tono

    speechSynthesis.speak(speech);
}

//-----------------------------Script para tabla de resultados-------------------------------------
// Cargar tabla de resultados al iniciar
document.addEventListener('DOMContentLoaded', cargarTabla);

// Función para cargar la tabla de resultados
function cargarTabla() {
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
                    <td class="premio-col">${r.premio}</td>
                `;
                tbody.appendChild(tr);
            });

        })
    .catch(err => console.error("Error cargando BD:", err));

}


document.addEventListener("DOMContentLoaded", () => {
    
    const inputs = Array.from(document.querySelectorAll("input, select, textarea"));
    const boton = document.getElementById("btn-Participar");

    document.addEventListener("keydown", (e) => {

        if (e.code === "Enter") {
            e.preventDefault();

            const active = document.activeElement;
            const index = inputs.indexOf(active);

            if (index !== -1 && index < inputs.length - 1) {
                //Si está en un input y NO es el último → pasar al siguiente
                inputs[index + 1].focus();
            } else {
                //Si está en el último input o en el botón → activar el botón
                boton.click();
            }
        }
    });
});

inicializarDatos();