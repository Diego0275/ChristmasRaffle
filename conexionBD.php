<?php
$servername = "localhost";
$user = "root";
$password = "";
$dbname = "sorteo";

$conn = new mysqli($servername, $user, $password, $dbname);

if($conn->connect_error){
    die("Conexión fallida: " . $conn->connect_error);
}

$conn->set_charset("utf8");
?>