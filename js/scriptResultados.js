//-----------------------------Script para tabla de resultados-------------------------------------
// Cargar tabla de resultados al iniciar
document.addEventListener('DOMContentLoaded', cargarTabla);

// Función para cargar la tabla de resultados
function cargarTabla() {
    const tbody = document.getElementById('tablaBody');
    const resultados = JSON.parse(sessionStorage.getItem("resultados")) || [];

    tbody.innerHTML = ""; 

    if (resultados.length === 0) {
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

    resultados.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td style="font-weight:bold;">${r.empresa}</td>
        <td>${r.nombre}</td>
        <td class="premio-col">🎁 ${r.descripcion || r.premio}</td>
    `;
    tbody.appendChild(tr);
    });
}

// Función para limpiar datos de sessionStorage
function limpiarDatos() {
    if(confirm("¿Estás seguro de borrar todos los resultados guardados?")) {
        sessionStorage.removeItem("resultados");
        location.reload();
    }
}

// Función para exportar resultados a Excel
function exportarExcel() {
    const resultados = JSON.parse(sessionStorage.getItem("resultados")) || [];
    if (resultados.length === 0) {
        alert("No hay resultados para exportar.");
        return;
    }

    // Convertir a hoja de Excel
    const hoja = XLSX.utils.json_to_sheet(resultados);

    // Crear libro
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Resultados");

    // Descargar archivo
    XLSX.writeFile(libro, "resultados_sorteo.xlsx");
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