<?php
session_start();
require_once 'database_config.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
    echo json_encode(['success' => false, 'error' => 'No autenticado']);
    exit;
}

$conexion = DatabaseConfig::getConnection();
if (!$conexion) {
    echo json_encode(['success' => false, 'error' => 'Error de conexión a la base de datos']);
    exit;
}

$id_usuario = $conexion->real_escape_string($_SESSION['user']['id']);
$sql = "SELECT monto, estado, fecha FROM creditos WHERE usuario_id = $id_usuario ORDER BY fecha DESC";
$result = $conexion->query($sql);

$creditos = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $creditos[] = $row;
    }
}
$conexion->close();
echo json_encode(['success' => true, 'creditos' => $creditos]);
