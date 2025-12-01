//-----------------------------Script para tabla de resultados-------------------------------------
// Cargar tabla de resultados al iniciar
document.addEventListener('DOMContentLoaded', cargarTablaW);
document.addEventListener('DOMContentLoaded', cargarTablaL);

// Función para cargar la tabla de resultados
function cargarTablaW() {
//----------------------------- Código anterior usando localStorage -------------------------------------
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

    resultadosW.forEach((r, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${r.empresa}</td>
        <td>${r.id}</td>
        <td>${r.nombre}</td>
        <td class="premio-col">${r.descripcion}</td>
        <td class="premio-col">${r.premio}</td>
        <td><button onclick="eliminarRegistroW(${index})">BORRAR</button></td>
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
                    <td>${r.empresa}</td>
                    <td>${r.id}</td>
                    <td>${r.nombre}</td>
                    <td class="premio-col">${r.descripcion}</td>
                    <td class="premio-col">${r.premio}</td>
                    <td><button onclick="eliminarRegistroW(${r.id})">BORRAR</button></td>
                `;
                tbody.appendChild(tr);
            });

        })
        .catch(err => console.error("Error cargando BD:", err));
}

// Función para cargar la tabla de resultados
function cargarTablaL() {
    const tbody = document.getElementById('tablaBodyL');

    fetch("cargarTablaL.php")
        .then(res => res.json())
        .then(resultadosL => {

            tbody.innerHTML = ""; 

            if (resultadosL.length === 0) {
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

            resultadosL.forEach((r) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${r.empresa}</td>
                    <td>${r.id}</td>
                    <td>${r.nombre}</td>
                    <td class="premio-col">${r.descripcion}</td>
                    <td><button onclick="eliminarRegistroL(${r.id})">BORRAR</button></td>
                `;
                tbody.appendChild(tr);
            });

        })
        .catch(err => console.error("Error cargando BD:", err));
}

function eliminarRegistroW(id) {
    let premios = JSON.parse(localStorage.getItem("premios")) || [];
    let resultadosW = JSON.parse(localStorage.getItem("resultadosW")) || [];

    const index = resultadosW.findIndex(r => r.id == id);

    if (index === -1) {
        console.error("No se encontró el registro en localStorage");
        return;
    }

    const eliminado = resultadosW.splice(index, 1)[0];

    const recuperado = {
        id: eliminado.premio,
        nombre: eliminado.descripcion
    };

    premios.unshift(recuperado);

    localStorage.setItem("resultadosW", JSON.stringify(resultadosW));
    localStorage.setItem("premios", JSON.stringify(premios));

    cargarTablaW();

    // --- Eliminar también de la BD ---
    const fd = new FormData();
    fd.append("id", id);

    fetch("eliminarResultadosW.php", {
        method: "POST",
        body: fd
    })
    .then(res => res.text())  
    .then(r => {
        if (r === "OK") cargarTablaW();
    });
}


function eliminarRegistroL(id) {
    let premios = JSON.parse(localStorage.getItem("premios")) || [];
    let resultadosL = JSON.parse(localStorage.getItem("resultadosL")) || [];

    const index = resultadosL.findIndex(r => r.id == id);

    if (index === -1) {
        console.error("No se encontró el registro en localStorage");
        return;
    }

    const eliminado = resultadosL.splice(index, 1)[0];

    const recuperado = {
        id: eliminado.premio,
        nombre: eliminado.descripcion
    };

    premios.unshift(recuperado);

    localStorage.setItem("resultadosL", JSON.stringify(resultadosL));
    localStorage.setItem("premios", JSON.stringify(premios));

    cargarTablaL();

    // --- Eliminar también de la BD ---
    const fd = new FormData();
    fd.append("id", id);

    fetch("eliminarResultadosL.php", {
        method: "POST",
        body: fd
    })
    .then(res => res.text())  
    .then(r => {
        if (r === "OK") cargarTablaL();
    });
}


// Función para limpiar datos de localStorage
function limpiarDatos() {
    if(confirm("¿Estás seguro de borrar todos los resultados guardados?")) {
        localStorage.removeItem("resultadosW");
        localStorage.removeItem("resultadosL");
        location.reload();
    }
}

// Función para exportar resultados a Excel
function exportarExcelW() {
    const resultadosW = JSON.parse(localStorage.getItem("resultadosW")) || [];
    if (resultadosW.length === 0) {
        alert("No hay resultados para exportar.");
        return;
    }

    // Convertir a hoja de Excel
    const hoja = XLSX.utils.json_to_sheet(resultadosW);

    // Crear libro
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "ResultadosW");

    // Descargar archivo
    XLSX.writeFile(libro, "resultadosGanadores.xlsx");
}

// Función para exportar resultados a Excel
function exportarExcelL() {
    const resultadosL = JSON.parse(localStorage.getItem("resultadosL")) || [];
    if (resultadosL.length === 0) {
        alert("No hay resultados para exportar.");
        return;
    }

    // Convertir a hoja de Excel
    const hoja = XLSX.utils.json_to_sheet(resultadosL);

    // Crear libro
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "ResultadosL");

    // Descargar archivo
    XLSX.writeFile(libro, "resultadosNoGanadores.xlsx");
}

//-----------------------------Script para importar Excel-------------------------------------
// Manejar carga de archivo Excel
document.addEventListener("DOMContentLoaded", () => {

    const input = document.getElementById("inputExcel");
    if (!input) {
        console.error("❌ No existe un elemento con ID 'inputExcel' en el HTML");
        return;
    }

    input.addEventListener("change", function (e) {
        const archivo = e.target.files[0];
        if (!archivo) return;

        const lector = new FileReader();

        lector.onload = function (event) {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            const primeraHoja = workbook.SheetNames[0];
            const hoja = workbook.Sheets[primeraHoja];

            const filas = XLSX.utils.sheet_to_json(hoja, { defval: "" });

            if (filas.length === 0) {
                alert("El archivo está vacío");
                return;
            }

            const columnas = Object.keys(filas[0]).map(c => c.toLowerCase().trim());

            let jsonFinal = null;

            // Detectar archivo de empleados
            if (columnas.includes("empresa") && columnas.includes("id") && columnas.includes("nombre")) {
                const empleados = filas.map(fila => ({
                    empresa: fila.empresa?.toString().trim().toUpperCase() || "",
                    id: parseInt(fila.id) || 0,
                    nombre: fila.nombre?.toString().trim() || ""
                }));
                jsonFinal = { empleados };
            }

            // Detectar archivo de premios
            else if (columnas.includes("id") && columnas.includes("nombre") && !columnas.includes("empresa")) {
                const premios = filas.map(fila => ({
                    id: parseInt(fila.id) || 0,
                    nombre: fila.nombre?.toString().trim() || ""
                }));
                jsonFinal = { premios };
            }

            else {
                alert("El archivo Excel no coincide con ninguna estructura válida.\n\nEstructuras soportadas:\n- empleados: empresa, id, nombre\n- premios: id, nombre");
                return;
            }

            const nombreBase = archivo.name.replace(/\.[^/.]+$/, "");
            descargarJSON(jsonFinal, nombreBase + ".json");
        };

        lector.readAsArrayBuffer(archivo);
    });
});

// Función para descargar objeto como archivo JSON
function descargarJSON(obj, nombreArchivo) {
    const jsonString = JSON.stringify(obj, null, 4);
    const blob = new Blob([jsonString], { type: "application/json" });

    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(blob);
    enlace.download = nombreArchivo;
    enlace.click();
}

setInterval(cargarTablaW, 1000);
setInterval(cargarTablaL, 1000);