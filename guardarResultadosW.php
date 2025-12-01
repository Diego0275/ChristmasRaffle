<?php
include "conexionBD.php";

$empresa = $_POST["empresa"] ?? null;
$id = $_POST["id"] ?? null;
$nombre = $_POST["nombre"] ?? null;
$descripcion = $_POST["descripcion"] ?? null;
$premio = $_POST["premio"] ?? null;

if (!$empresa || !$id || !$nombre || !$descripcion || !$premio) {
    echo "ERROR: Faltan datos";
    exit;
}

$stmt = $conn->prepare(
    "INSERT INTO resultadosw (empresa, id, nombre, descripcion, premio)
     VALUES (?, ?, ?, ?, ?)"
);

$stmt->bind_param("sisss", $empresa, $id, $nombre, $descripcion, $premio);

if ($stmt->execute()) {
    echo "OK";
} else {
    echo "ERROR SQL: " . $conn->error;
}
?>