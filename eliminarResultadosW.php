<?php
include "conexionBD.php";

$nombre = $_POST['nombre'];

$stmt = $conn->prepare("DELETE FROM resultadosw WHERE nombre=?");
$stmt->bind_param("s", $nombre);
$stmt->execute();

//var_dump($_POST);

echo "OK";
?>