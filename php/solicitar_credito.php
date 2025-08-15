<?php
// API para registrar solicitud de crédito
require_once 'database_config.php';
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
    echo json_encode(['success' => false, 'error' => 'Debes iniciar sesión para solicitar un crédito']);
    exit;
}

$monto = isset($_POST['monto']) ? floatval($_POST['monto']) : 0;
if ($monto < 1000) {
    echo json_encode(['success' => false, 'error' => 'Monto mínimo: ₡1000']);
    exit;
}

$conexion = DatabaseConfig::getConnection();
if (!$conexion) {
    echo json_encode(['success' => false, 'error' => 'Error de conexión a la base de datos']);
    exit;
}

$id_usuario = $conexion->real_escape_string($_SESSION['user']['id']);
$monto_sql = $conexion->real_escape_string($monto);
$sql = "INSERT INTO creditos (usuario_id, monto, estado) VALUES ($id_usuario, $monto_sql, 'pendiente')";
$result = $conexion->query($sql);

if ($result) {
    // Registrar en ahorros
    $conexion->query("INSERT INTO ahorros (usuario_id, monto) VALUES ($id_usuario, $monto_sql)");
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'No se pudo guardar la solicitud']);
}

$conexion->close();
?>