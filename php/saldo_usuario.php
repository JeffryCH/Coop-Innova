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
// El saldo es la suma de todos los montos en ahorros
$sql = "SELECT IFNULL(SUM(monto),0) AS saldo FROM ahorros WHERE usuario_id = $id_usuario";
$result = $conexion->query($sql);
$saldo = 0;
if ($result && $row = $result->fetch_assoc()) {
    $saldo = $row['saldo'];
}
$conexion->close();
echo json_encode(['success' => true, 'saldo' => $saldo]);
