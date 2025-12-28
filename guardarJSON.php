<?php
$data = json_decode(file_get_contents("php://input"), true);

$archivo = $data["archivo"];
$contenido = json_encode($data["contenido"], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

// Carpeta donde se guardarán los JSON
$ruta = "json/" . $archivo;

// Crear carpeta si no existe
if (!file_exists("json")) {
    mkdir("json", 0777, true);
}

// Guardar archivo
file_put_contents($ruta, $contenido);

echo "OK: Guardado en " . $ruta;
?>
