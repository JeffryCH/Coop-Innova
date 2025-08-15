<?php
// API para depósitos: lista usuarios y realiza depósito
require_once 'database_config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $conexion = DatabaseConfig::getConnection();
    if (!$conexion) {
        echo json_encode(['success' => false, 'error' => 'Error de conexión a la base de datos']);
        exit;
    }
    $result = $conexion->query("SELECT id, nombre, usuario FROM usuarios ORDER BY nombre ASC");
    $usuarios = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $usuarios[] = $row;
        }
    }
    $conexion->close();
    echo json_encode(['success' => true, 'usuarios' => $usuarios]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario_id = isset($_POST['usuario_id']) ? intval($_POST['usuario_id']) : 0;
    $monto = isset($_POST['monto']) ? floatval($_POST['monto']) : 0;
    if ($usuario_id > 0 && $monto > 0) {
        $conexion = DatabaseConfig::getConnection();
        if (!$conexion) {
            echo json_encode(['success' => false, 'error' => 'Error de conexión a la base de datos']);
            exit;
        }
        // Acreditar en ahorros
        $conexion->query("INSERT INTO ahorros (usuario_id, monto) VALUES ($usuario_id, $monto)");
        // Registrar movimiento
        $tipo = 'deposito';
        $fecha = date('Y-m-d H:i:s');
        $conexion->query("INSERT INTO movimientos (usuario_id, tipo, monto, fecha) VALUES ($usuario_id, '$tipo', $monto, '$fecha')");
        $conexion->close();
        echo json_encode(['success' => true]);
        exit;
    }
    echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
    exit;
}

echo json_encode(['success' => false, 'error' => 'Método no permitido']);
?>