<?php
// Script de prueba para depurar conexión a la base de datos
require_once 'database_config.php';

$credenciales = DatabaseConfig::getEnvCredenciales();
$host = DatabaseConfig::HOST;
$db = DatabaseConfig::DATABASE;

foreach ($credenciales as $i => $cred) {
    echo "<h3>Probando conexión #" . ($i + 1) . ":</h3>";
    echo "Usuario: {$cred['user']}<br>";
    echo "Password: " . ($cred['password'] ? '***' : '(vacía)') . "<br>";
    echo "Puerto: {$cred['port']}<br>";
    $conn = @new mysqli($host, $cred['user'], $cred['password'], $db, $cred['port']);
    if ($conn->connect_error) {
        echo "<span style='color:red'>Error: {$conn->connect_error}</span><br>";
    } else {
        echo "<span style='color:green'>¡Conexión exitosa!</span><br>";
        $result = $conn->query("SHOW TABLES;");
        if ($result) {
            echo "Tablas:<br><ul>";
            while ($row = $result->fetch_array()) {
                echo "<li>{$row[0]}</li>";
            }
            echo "</ul>";
        }
        $conn->close();
    }
    echo "<hr>";
}
?>