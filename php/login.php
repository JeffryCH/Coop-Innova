<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/conexion_registro.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

$usuario = isset($_POST['usuario']) ? trim($_POST['usuario']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';

if ($usuario === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Usuario y contraseña son requeridos']);
    exit;
}

try {
    // Usar la conexión centralizada de DatabaseConfig
    if (!isset($conexion) || !$conexion) {
        // Fallback si no existe $conexion desde conexion_registro.php
        $host = 'localhost';
        $db = 'coop_innova';
        $credenciales = [
            ['user' => 'root', 'password' => ''],
            ['user' => 'root', 'password' => '']
        ];
        foreach ($credenciales as $cred) {
            $conexion = @new mysqli($host, $cred['user'], $cred['password'], $db);
            if (!$conexion->connect_error)
                break;
        }
    }

    if (!$conexion || $conexion->connect_error) {
        throw new Exception('Sin conexión a base de datos');
    }

    $stmt = $conexion->prepare('SELECT id, nombre, usuario, password, rol FROM usuarios WHERE usuario = ? LIMIT 1');
    $stmt->bind_param('s', $usuario);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $result->num_rows === 1) {
        $row = $result->fetch_assoc();
        if (password_verify($password, $row['password'])) {
            // Guardar en sesión
            $_SESSION['user'] = [
                'id' => (int) $row['id'],
                'nombre' => $row['nombre'],
                'usuario' => $row['usuario'],
                'rol' => $row['rol']
            ];
            echo json_encode(['success' => true, 'message' => 'Inicio de sesión exitoso', 'user' => $_SESSION['user']]);
            exit;
        }
    }

    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Usuario o contraseña incorrectos']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error del servidor', 'error' => $e->getMessage()]);
}
