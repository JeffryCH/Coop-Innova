<?php
// API para registrar solicitud de crédito
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

$monto = isset($_POST['monto']) ? floatval($_POST['monto']) : 0;
if ($monto < 1000) {
    echo json_encode(['success' => false, 'error' => 'Monto mínimo: ₡1000']);
    exit;
}

$id_usuario = $conexion->real_escape_string($user['id']);
$monto_sql = $conexion->real_escape_string($monto);
$fecha = date('Y-m-d H:i:s');

$sql = "INSERT INTO solicitudes_credito (usuario_id, monto, fecha, estado) VALUES ($id_usuario, $monto_sql, '$fecha', 'pendiente')";
$result = $conexion->query($sql);

if ($result) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Error al registrar solicitud']);
}
$conexion->close();
