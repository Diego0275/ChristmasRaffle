<?php
include "conexionBD.php";

$premio = $_POST["premio"] ?? null;

if (!$premio) {
    echo "ERROR: Faltan datos";
    exit;
}

$sqlW = "SELECT count(*) as total FROM resultadosw WHERE premio = ?";
$stmtW = $conn->prepare($sqlW);

if (!$stmtW) {
    die("Error SQL en resultadosw: " . $conn->error);
}

$stmtW->bind_param("i", $premio);
$stmtW->execute();
$dataW = $stmtW->get_result()->fetch_assoc();
$stmtW->close();

if ($dataW['total'] > 0) {
    echo "REPETIDO";
} else {
    echo "NO REPETIDO";
}

$conn->close();
?>