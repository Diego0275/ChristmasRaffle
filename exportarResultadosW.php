<?php
include "conexionBD.php";
// Nombre del archivo
$filename = "resultadosGanadores" . date("Y-m-d") . ".csv";

header("Content-Type: text/csv; charset=UTF-8");
header("Content-Disposition: attachment; filename=$filename");

// Forzar que Excel abra correctamente acentos
echo "\xEF\xBB\xBF";

$output = fopen("php://output", "w");

// Encabezados
fputcsv($output, array("Empresa", "No. Empleado", "Nombre", "Premio", "Descripcion"));

$sql = "SELECT empresa, id, nombre, premio, descripcion FROM resultadosw";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        fputcsv($output, $row);
    }
}

fclose($output);
$conn->close();
exit();
?>