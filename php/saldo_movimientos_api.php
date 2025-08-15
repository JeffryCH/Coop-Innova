<?php
// API para obtener saldo y movimientos del usuario actual
require_once 'database_config.php';
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
    echo json_encode(['success' => false, 'error' => 'No autenticado']);
    exit;
}

$id_usuario = $_SESSION['user']['id'];
$conexion = DatabaseConfig::getConnection();
if (!$conexion) {
    echo json_encode(['success' => false, 'error' => 'Error de conexión a la base de datos']);
    exit;
}

// Obtener saldo
$resSaldo = $conexion->query("SELECT IFNULL(SUM(monto),0) AS saldo FROM ahorros WHERE usuario_id = $id_usuario");
$saldo = 0;
if ($resSaldo && $row = $resSaldo->fetch_assoc()) {
    $saldo = $row['saldo'];
}

// Obtener movimientos
$resMov = $conexion->query("SELECT m.tipo, m.monto, m.fecha, 
    CASE WHEN m.tipo = 'credito' THEN c.estado ELSE NULL END AS estado
    FROM movimientos m 
    LEFT JOIN creditos c ON m.tipo = 'credito' AND m.usuario_id = c.usuario_id AND m.monto = c.monto AND DATE(m.fecha) = DATE(c.fecha)
    WHERE m.usuario_id = $id_usuario 
    ORDER BY m.fecha DESC LIMIT 50");
$movimientos = [];
if ($resMov) {
    while ($row = $resMov->fetch_assoc()) {
        $movimientos[] = $row;
    }
}
$conexion->close();
echo json_encode(['success' => true, 'saldo' => $saldo, 'movimientos' => $movimientos]);
