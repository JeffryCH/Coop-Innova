<?php
// API para listar solicitudes de crédito y actualizar su estado
require_once 'database_config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $conexion = DatabaseConfig::getConnection();
    if (!$conexion) {
        echo json_encode(['success' => false, 'error' => 'Error de conexión a la base de datos']);
        exit;
    }
    $pendientes = [];
    $historial = [];
    $result = $conexion->query("SELECT c.id, u.nombre AS cliente, c.monto, c.estado, c.fecha FROM creditos c JOIN usuarios u ON c.usuario_id = u.id ORDER BY c.fecha DESC");
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            if ($row['estado'] === 'pendiente') {
                $pendientes[] = $row;
            } else {
                $historial[] = $row;
            }
        }
    }
    $conexion->close();
    echo json_encode(['success' => true, 'creditos' => $pendientes, 'historial' => $historial]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
    $accion = isset($_POST['accion']) ? $_POST['accion'] : '';
    if ($id > 0 && in_array($accion, ['aprobar', 'denegar'])) {
        $conexion = DatabaseConfig::getConnection();
        if (!$conexion) {
            echo json_encode(['success' => false, 'error' => 'Error de conexión a la base de datos']);
            exit;
        }
        $nuevoEstado = $accion === 'aprobar' ? 'aprobado' : 'rechazado';
        $sql = $conexion->prepare("UPDATE creditos SET estado = ? WHERE id = ?");
        $sql->bind_param('si', $nuevoEstado, $id);
        $exito = $sql->execute();

        // Si se aprueba, acreditar el monto en ahorros y registrar movimiento
        if ($exito && $accion === 'aprobar') {
            $res = $conexion->query("SELECT usuario_id, monto FROM creditos WHERE id = $id LIMIT 1");
            if ($res && $row = $res->fetch_assoc()) {
                $usuario_id = $row['usuario_id'];
                $monto = $row['monto'];
                $conexion->query("INSERT INTO ahorros (usuario_id, monto) VALUES ($usuario_id, $monto)");
                $tipo = 'credito';
                $fecha = date('Y-m-d H:i:s');
                $conexion->query("INSERT INTO movimientos (usuario_id, tipo, monto, fecha) VALUES ($usuario_id, '$tipo', $monto, '$fecha')");
            }
        }
        $conexion->close();
        echo json_encode(['success' => $exito, 'estado' => $nuevoEstado]);
        exit;
    }
    echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
    exit;
}

echo json_encode(['success' => false, 'error' => 'Método no permitido']);
?>