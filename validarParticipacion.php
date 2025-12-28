<?php
include "conexionBD.php"; 

$empresa = $_POST["empresa"] ?? null;
$id = $_POST["id"] ?? null;

// --- VERIFICACIÓN 1: Tabla resultadosw ---
$sqlW = "SELECT count(*) as total FROM resultadosw WHERE empresa = ? AND id = ?";
$stmtW = $conn->prepare($sqlW);

if (!$stmtW) {
    die("Error SQL en resultadosw: " . $conn->error);
}

$stmtW->bind_param("si", $empresa, $id);
$stmtW->execute();
$resultW = $stmtW->get_result();
$dataW = $resultW->fetch_assoc();
$stmtW->close();

if ($dataW['total'] > 0) {
    echo "PARTICIPO";
    $conn->close();
    exit; 
}

// --- VERIFICACIÓN 2: Tabla resultadosl ---
$sqlL = "SELECT count(*) as total FROM resultadosl WHERE empresa = ? AND id = ?";
$stmtL = $conn->prepare($sqlL);

if (!$stmtL) {
    die("Error SQL en resultadosl: " . $conn->error);
}

$stmtL->bind_param("si", $empresa, $id);
$stmtL->execute();
$resultL = $stmtL->get_result();
$dataL = $resultL->fetch_assoc();
$stmtL->close();

if ($dataL['total'] > 0) {
    echo "PARTICIPO";
} else {
    echo "NO PARTICIPO";
}

$conn->close();
?>