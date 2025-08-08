<?php
// API para obtener movimientos del usuario actual
require_once 'database_config.php';
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'error' => 'No autenticado']);
    exit;
}

$user = $_SESSION['user'];
$conexion = DatabaseConfig::getConnection();
if (!$conexion) {
    echo json_encode(['success' => false, 'error' => 'Error de conexión a la base de datos']);
    exit;
}

$id_usuario = $conexion->real_escape_string($user['id']);
$sql = "SELECT tipo, monto, fecha FROM movimientos WHERE usuario_id = $id_usuario ORDER BY fecha DESC LIMIT 10";
$result = $conexion->query($sql);

if (!$result) {
    echo json_encode(['success' => false, 'error' => 'Error en la consulta']);
    exit;
}

$movimientos = [];
while ($row = $result->fetch_assoc()) {
    $movimientos[] = $row;
}

$conexion->close();
echo json_encode(['success' => true, 'movimientos' => $movimientos]);
