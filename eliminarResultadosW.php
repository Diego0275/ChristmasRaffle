<?php
include "conexionBD.php";

$id = $_POST['id'];

$stmt = $conn->prepare("DELETE FROM resultadosw WHERE id=?");
$stmt->bind_param("i", $id);
$stmt->execute();

echo "OK";
?>