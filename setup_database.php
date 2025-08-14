<?php
echo "<h2>🔧 Configurador de Base de Datos - Coop-Innova</h2>";

$host = "localhost";
$base_datos = "coop_innova";

// Función para intentar conexión con múltiples credenciales
function conectarServidor()
{
    $host = "localhost";

    // Intentar múltiples configuraciones de usuario/contraseña
    $credenciales = [
        ['user' => 'root', 'password' => 'root'],      // Primera opción
        ['user' => 'root', 'password' => 'kev123']     // Segunda opción (compañero)
    ];

    foreach ($credenciales as $cred) {
        $conexion = new mysqli($host, $cred['user'], $cred['password']);

        if (!$conexion->connect_error) {
            echo "✅ Conexión exitosa al servidor con usuario: <strong>{$cred['user']}</strong><br>";
            return $conexion; // Conexión exitosa
        } else {
            echo "❌ Intento fallido con usuario '{$cred['user']}': {$conexion->connect_error}<br>";
        }
    }

    return false; // No se pudo conectar con ninguna credencial
}

try {
    // Primero conectar sin especificar base de datos para crearla si no existe
    $conexion = conectarServidor();

    if (!$conexion) {
        throw new Exception("No se pudo conectar al servidor MySQL con ninguna de las credenciales disponibles");
    }

    // Crear base de datos si no existe
    $sql_create_db = "CREATE DATABASE IF NOT EXISTS $base_datos";
    if ($conexion->query($sql_create_db)) {
        echo "✅ Base de datos '$base_datos' creada/verificada<br>";
    } else {
        throw new Exception("Error al crear la base de datos: " . $conexion->error);
    }

    // Seleccionar la base de datos
    $conexion->select_db($base_datos);
    echo "✅ Base de datos '$base_datos' seleccionada<br><br>";

    // Crear tablas
    $sql_usuarios = "CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100),
        usuario VARCHAR(50) UNIQUE,
        password VARCHAR(255),
        rol ENUM('asociado','admin') NOT NULL
    )";

    $sql_movimientos = "CREATE TABLE IF NOT EXISTS movimientos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT,
        tipo ENUM('deposito','retiro','credito','pago','transferencia'),
        monto DECIMAL(10,2),
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )";

    $sql_creditos = "CREATE TABLE IF NOT EXISTS creditos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT,
        monto DECIMAL(10,2),
        estado ENUM('pendiente','aprobado','rechazado'),
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )";

    $sql_ahorros = "CREATE TABLE IF NOT EXISTS ahorros (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT,
        monto DECIMAL(10,2),
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )";

    // Ejecutar creación de tablas
    $tablas = [
        'usuarios' => $sql_usuarios,
        'movimientos' => $sql_movimientos,
        'creditos' => $sql_creditos,
        'ahorros' => $sql_ahorros
    ];

    foreach ($tablas as $nombre => $sql) {
        if ($conexion->query($sql)) {
            echo "✅ Tabla '$nombre' creada/verificada<br>";
        } else {
            echo "❌ Error al crear tabla '$nombre': " . $conexion->error . "<br>";
        }
    }

    echo "<br><h3>📝 Insertando datos de ejemplo...</h3>";

    // Verificar si ya hay usuarios
    $check_usuarios = $conexion->query("SELECT COUNT(*) as total FROM usuarios");
    $count = $check_usuarios->fetch_assoc();

    if ($count['total'] == 0) {
        // Insertar usuarios de ejemplo
        $usuarios_ejemplo = [
            ['Admin General', 'admin1', password_hash('admin123', PASSWORD_DEFAULT), 'admin'],
            ['Leidy Salgado', 'leidys', password_hash('lady123', PASSWORD_DEFAULT), 'asociado'],
            ['Fabian Gonzalez', 'fabiangonzalez', password_hash('fabian123', PASSWORD_DEFAULT), 'asociado']
        ];

        $stmt = $conexion->prepare("INSERT INTO usuarios (nombre, usuario, password, rol) VALUES (?, ?, ?, ?)");

        foreach ($usuarios_ejemplo as $usuario) {
            $stmt->bind_param("ssss", $usuario[0], $usuario[1], $usuario[2], $usuario[3]);
            if ($stmt->execute()) {
                echo "✅ Usuario '{$usuario[1]}' insertado<br>";
            } else {
                echo "❌ Error al insertar usuario '{$usuario[1]}': " . $stmt->error . "<br>";
            }
        }

        // Insertar datos de ejemplo en otras tablas
        $conexion->query("INSERT INTO ahorros (usuario_id, monto) VALUES (2, 150000.00), (3, 275000.00)");
        $conexion->query("INSERT INTO creditos (usuario_id, monto, estado) VALUES (2, 5000.00, 'pendiente'), (3, 3000.00, 'aprobado')");
        $conexion->query("INSERT INTO movimientos (usuario_id, tipo, monto) VALUES 
            (2, 'deposito', 1000.00), (2, 'retiro', 200.00), (2, 'credito', 5000.00), (2, 'pago', 250.00),
            (3, 'deposito', 1500.00), (3, 'retiro', 250.00), (3, 'credito', 3000.00), (3, 'pago', 1000.00)");

        echo "✅ Datos de ejemplo insertados<br>";
    } else {
        echo "ℹ️ Ya existen usuarios en la base de datos ($count[total] usuarios)<br>";
    }

    echo "<br><h3>🎉 ¡Configuración completada exitosamente!</h3>";
    echo "<p>Puedes probar la conexión visitando: <a href='test_connection.php'>test_connection.php</a></p>";

    $conexion->close();

} catch (Exception $e) {
    echo "❌ <strong>Error:</strong> " . $e->getMessage() . "<br>";
}
?>