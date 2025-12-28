<?php
include "conexionBD.php";

$nombre = $_POST['nombre'];

$stmt = $conn->prepare("DELETE FROM resultadosl WHERE nombre=?");
$stmt->bind_param("s", $nombre);
$stmt->execute();

echo "OK";
?>