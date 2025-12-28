<?php
include "conexionBD.php";

$stmt = $conn->prepare("DELETE FROM resultadosl");
$stmq = $conn->prepare("DELETE FROM resultadosw");
$stmt->execute();
$stmq->execute();

echo "OK";
?>