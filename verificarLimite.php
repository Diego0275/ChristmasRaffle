<?php
include "conexionBD.php";

$sql = "SELECT COUNT(*) AS total FROM resultadosw";
$result = $conn->query($sql);

if ($result) {
    $row = $result->fetch_assoc();
    echo $row['total'];
} else {
    echo "ERROR";
}

$conn->close();
?>
