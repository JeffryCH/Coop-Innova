<?php
require_once 'database_config.php';
header('Content-Type: application/json');
$conexion = DatabaseConfig::getConnection();
if (!$conexion) {
    echo json_encode(['success' => false, 'error' => 'Error de conexión a la base de datos']);
    exit;
}
$result = $conexion->query("SELECT id, nombre, usuario FROM usuarios");
$usuarios = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $usuarios[] = $row;
    }
}
$conexion->close();
echo json_encode(['success' => true, 'usuarios' => $usuarios]);
