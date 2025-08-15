<?php
session_start();
require_once 'database_config.php';
header('Content-Type: application/json');

// Manejo de errores para mostrar JSON en vez de HTML
set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => "Error interno: $errstr ($errfile:$errline)"]);
    exit;
});
set_exception_handler(function ($e) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => "Excepción: " . $e->getMessage()]);
    exit;
});

if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
    echo json_encode(['success' => false, 'error' => 'No autenticado']);
    exit;
}

$tipo = isset($_POST['tipo']) ? $_POST['tipo'] : '';
$monto = isset($_POST['monto']) ? floatval($_POST['monto']) : 0;
$id_usuario = $_SESSION['user']['id'];

if ($monto <= 0) {
    echo json_encode(['success' => false, 'error' => 'Monto inválido']);
    exit;
}

$conexion = DatabaseConfig::getConnection();
if (!$conexion) {
    echo json_encode(['success' => false, 'error' => 'Error de conexión a la base de datos']);
    exit;
}

// Verificar saldo para retiros, transferencias y pagos
if (in_array($tipo, ['retiro', 'transferencia', 'pago_servicio'])) {
    $sql = "SELECT IFNULL(SUM(monto),0) AS saldo FROM ahorros WHERE usuario_id = $id_usuario";
    $result = $conexion->query($sql);
    $saldo = 0;
    if ($result && $row = $result->fetch_assoc()) {
        $saldo = $row['saldo'];
    }
    if ($saldo < $monto) {
        echo json_encode(['success' => false, 'error' => 'Sin saldo suficiente']);
        $conexion->close();
        exit;
    }
}

// Insertar movimiento
$tipo_bd = $tipo;
if ($tipo === 'pago_servicio')
    $tipo_bd = 'pago';

if ($tipo === 'transferencia') {
    $id_destino = isset($_POST['cuenta_destino']) ? intval($_POST['cuenta_destino']) : 0;
    if ($id_destino <= 0) {
        echo json_encode(['success' => false, 'error' => 'Selecciona una cuenta destino válida.']);
        $conexion->close();
        exit;
    }
    if ($id_destino == $id_usuario) {
        echo json_encode(['success' => false, 'error' => 'No puedes transferir a tu propia cuenta.']);
        $conexion->close();
        exit;
    }
    // Verificar que el usuario destino existe
    $resDest = $conexion->query("SELECT id FROM usuarios WHERE id = $id_destino");
    if (!$resDest || $resDest->num_rows === 0) {
        echo json_encode(['success' => false, 'error' => 'La cuenta destino no existe.']);
        $conexion->close();
        exit;
    }
    // Rebaja al origen
    $sql1 = "INSERT INTO movimientos (usuario_id, tipo, monto) VALUES ($id_usuario, 'transferencia', $monto)";
    $ok1 = $conexion->query($sql1);
    $conexion->query("INSERT INTO ahorros (usuario_id, monto) VALUES ($id_usuario, -$monto)");
    // Acredita al destino
    $sql2 = "INSERT INTO movimientos (usuario_id, tipo, monto) VALUES ($id_destino, 'transferencia', $monto)";
    $ok2 = $conexion->query($sql2);
    $conexion->query("INSERT INTO ahorros (usuario_id, monto) VALUES ($id_destino, $monto)");
    $conexion->close();
    if ($ok1 && $ok2) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'No se pudo registrar la transferencia en la base de datos.']);
    }
    exit;
}

// Actualizar ahorros y registrar movimiento
if ($result) {
    $fecha = date('Y-m-d H:i:s');
    if (in_array($tipo_bd, ['deposito', 'credito'])) {
        $conexion->query("INSERT INTO ahorros (usuario_id, monto) VALUES ($id_usuario, $monto)");
        $conexion->query("INSERT INTO movimientos (usuario_id, tipo, monto, fecha) VALUES ($id_usuario, '$tipo_bd', $monto, '$fecha')");
    } else if (in_array($tipo_bd, ['retiro', 'pago'])) {
        $conexion->query("INSERT INTO ahorros (usuario_id, monto) VALUES ($id_usuario, -$monto)");
        $conexion->query("INSERT INTO movimientos (usuario_id, tipo, monto, fecha) VALUES ($id_usuario, '$tipo_bd', -$monto, '$fecha')");
    }
}

$conexion->close();
if ($result) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'No se pudo registrar el movimiento']);
}
