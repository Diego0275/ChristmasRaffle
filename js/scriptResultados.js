//-----------------------------Script para tabla de resultados-------------------------------------
// Cargar tabla de resultados al iniciar
document.addEventListener('DOMContentLoaded', cargarTablaW);
document.addEventListener('DOMContentLoaded', cargarTablaL);

// Función para cargar la tabla de resultados
function cargarTablaW() {
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
                `;

                const btn = document.createElement("button");
                btn.className = "btn-delete";
                btn.textContent = "🗑️";
                btn.onclick = () => eliminarRegistroW(r.nombre);

                const tdBtn = document.createElement("td");
                tdBtn.appendChild(btn);

                tr.appendChild(tdBtn);
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error("Error cargando BD:", err));
}

// Función para cargar la tabla de resultados de no ganadores
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
                `;

                const btn = document.createElement("button");
                btn.className = "btn-delete";
                btn.textContent = "🗑️";
                btn.onclick = () => eliminarRegistroL(r.nombre);

                const tdBtn = document.createElement("td");
                tdBtn.appendChild(btn);

                tr.appendChild(tdBtn);
                tbody.appendChild(tr);
            });

        })
        .catch(err => console.error("Error cargando BD:", err));
}

function eliminarRegistroW(nombre) {
    let resultadosW = JSON.parse(localStorage.getItem("resultadosW")) || [];

    const index = resultadosW.findIndex(r => r.nombre == nombre);
    resultadosW.splice(index, 1)[0];
    localStorage.setItem("resultadosW", JSON.stringify(resultadosW));


    console.log("Llamada a eliminarRegistroW:", nombre);

    // --- Eliminar también de la BD ---
    const fd = new FormData();
    fd.append("nombre", nombre);

    fetch("eliminarResultadosW.php", {
        method: "POST",
        body: fd
    })
    .then(res => res.text())  
    .then(r => {
        if (r === "OK") cargarTablaW();
    });

}


function eliminarRegistroL(nombre) {
    let resultadosL = JSON.parse(localStorage.getItem("resultadosL")) || [];

    const index = resultadosL.findIndex(r => r.nombre == nombre);
    resultadosL.splice(index, 1)[0];
    localStorage.setItem("resultadosL", JSON.stringify(resultadosL));
    console.log("Llamada a eliminarRegistroL:", nombre);

    // --- Eliminar también de la BD ---
    const fd = new FormData();
    fd.append("nombre", nombre);

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
        localStorage.removeItem("premios");
        localStorage.removeItem("empleados");
        location.reload();
    }

    const fd = new FormData();

    fetch("eliminarTodo.php", {
        method: "POST",
        body: fd
    })
    .then(res => res.text())  
    .then(r => {
        if (r === "OK") cargarTablaL();
        if (r === "OK") cargarTablaW();
    });
}

//-----------------------------Script para importar Excel-------------------------------------
// Manejar carga de archivo Excel
document.addEventListener("DOMContentLoaded", () => {

    const input = document.getElementById("inputExcel");
    if (!input) {
        console.error("No existe un elemento con ID 'inputExcel'");
        return;
    }

    input.addEventListener("change", function (e) {
        const archivo = e.target.files[0];
        if (!archivo) return;

        const lector = new FileReader();

        lector.onload = function (event) {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            const hoja = workbook.Sheets[workbook.SheetNames[0]];
            const filasOriginales = XLSX.utils.sheet_to_json(hoja, { defval: "" });

            if (filasOriginales.length === 0) {
                alert("El archivo está vacío");
                return;
            }

            const filas = filasOriginales.map(fila => {
                const f = {};
                for (let key in fila) {
                    f[key.toLowerCase().trim()] = fila[key];
                }
                return f;
            });

            const columnas = Object.keys(filas[0]);

            let jsonFinal = null;


            //Detecta archivo de empleados
            if (columnas.includes("empresa") && columnas.includes("id") && columnas.includes("nombre")) {

                const empleados = filas.map(f => ({
                    empresa: f.empresa.toString().trim().toUpperCase(),   
                    id: parseInt(f.id) || 0,                              
                    nombre: capitalizarNombre(f.nombre.toString().trim()) 
                }));

                jsonFinal = { empleados };
            }

            //Detecta archivo de premios
            else if (columnas.includes("id") && columnas.includes("nombre") && !columnas.includes("empresa")) {

                const premios = filas.map(f => ({
                    id: parseInt(f.id) || 0,
                    nombre: f.nombre.toString().trim()
                }));

                jsonFinal = { premios };
            }

            else {
                alert(
                    "El archivo Excel no coincide con una estructura válida.\n\n" +
                    "Estructuras soportadas:\n" +
                    "- empleados: empresa, id, nombre\n" +
                    "- premios: id, nombre"
                );
                return;
            }

            const nombreBase = archivo.name.replace(/\.[^/.]+$/, "");
            guardarArchivo(nombreBase + ".json", jsonFinal);
            input.value = "";
        };

        lector.readAsArrayBuffer(archivo);
    });

});

function capitalizarNombre(nombre) {
    return nombre
        .toLowerCase()
        .replace(/\b\w/g, letra => letra.toUpperCase());
}

function guardarArchivo(nombre, jsonData) {
    fetch("guardarJSON.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            archivo: nombre,
            contenido: jsonData
        })
    })
    .then(r => r.text())
    .then(resp => {
        console.log(resp);
        alert("Archivo guardado exitosamente en el servidor.");
    });
}

setInterval(cargarTablaW, 1000);
setInterval(cargarTablaL, 1000);