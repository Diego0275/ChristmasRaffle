<?php
include "conexionBD.php";

$res = $conn->query("SELECT * FROM resultadosL ORDER BY reg DESC");

$lista = [];

while ($row = $res->fetch_assoc()) {
    $lista[] = $row;
}

echo json_encode($lista);
?>  