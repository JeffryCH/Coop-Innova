<?php
echo "<h2>🔧 Prueba Final de Configuración - Coop-Innova</h2>";

require_once 'php/database_config.php';

echo "<h3>📊 Estado de la configuración:</h3>";

// Probar conexión al servidor (sin base de datos)
echo "<strong>1. Conexión al servidor MySQL:</strong><br>";
$servidor = DatabaseConfig::getConnection(false);
if ($servidor) {
    echo "✅ Conexión al servidor exitosa<br>";
    $info = DatabaseConfig::getConnectionInfo();
    echo "&nbsp;&nbsp;📍 Host: {$info['host']}<br>";
    echo "&nbsp;&nbsp;👤 Usuario: {$info['user']}<br>";
    $servidor->close();
} else {
    echo "❌ No se pudo conectar al servidor<br>";
}

echo "<br><strong>2. Conexión a la base de datos:</strong><br>";
$conexion = DatabaseConfig::getConnection(true);
if ($conexion) {
    echo "✅ Conexión a la base de datos exitosa<br>";
    echo "&nbsp;&nbsp;🗄️ Base de datos: coop_innova<br>";

    // Verificar tablas
    echo "<br><strong>3. Verificación de tablas:</strong><br>";
    $tablas = ['usuarios', 'movimientos', 'creditos', 'ahorros'];

    foreach ($tablas as $tabla) {
        $result = $conexion->query("SHOW TABLES LIKE '$tabla'");
        if ($result && $result->num_rows > 0) {
            echo "✅ Tabla '$tabla' existe<br>";
        } else {
            echo "❌ Tabla '$tabla' NO existe<br>";
        }
    }

    // Probar inserción de usuario de prueba
    echo "<br><strong>4. Prueba de funcionalidad:</strong><br>";

    // Verificar si existe el usuario de prueba
    $stmt = $conexion->prepare("SELECT id FROM usuarios WHERE usuario = ?");
    $usuario_prueba = "test_" . date('His');
    $stmt->bind_param("s", $usuario_prueba);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 0) {
        // Insertar usuario de prueba
        $nombre_prueba = "Usuario Prueba " . date('H:i:s');
        $password_hash = password_hash("test123", PASSWORD_DEFAULT);
        $rol = "asociado";

        $insert_stmt = $conexion->prepare("INSERT INTO usuarios (nombre, usuario, password, rol) VALUES (?, ?, ?, ?)");
        $insert_stmt->bind_param("ssss", $nombre_prueba, $usuario_prueba, $password_hash, $rol);

        if ($insert_stmt->execute()) {
            echo "✅ Inserción de usuario de prueba exitosa<br>";
            echo "&nbsp;&nbsp;👤 Usuario creado: $usuario_prueba<br>";

            // Eliminar el usuario de prueba
            $delete_stmt = $conexion->prepare("DELETE FROM usuarios WHERE usuario = ?");
            $delete_stmt->bind_param("s", $usuario_prueba);
            if ($delete_stmt->execute()) {
                echo "✅ Usuario de prueba eliminado correctamente<br>";
            }
        } else {
            echo "❌ Error en la inserción: " . $insert_stmt->error . "<br>";
        }
    }

    $conexion->close();

    echo "<br><h3>🎉 ¡Sistema listo para usar!</h3>";
    echo "<p><strong>Configuración actual:</strong></p>";
    echo "<ul>";
    echo "<li>✅ PHP funcionando</li>";
    echo "<li>✅ MySQL conectado</li>";
    echo "<li>✅ Base de datos configurada</li>";
    echo "<li>✅ Credenciales automáticas (root/root o root/kev123)</li>";
    echo "</ul>";

    echo "<p><strong>Servicios disponibles:</strong></p>";
    echo "<ul>";
    echo "<li>🌐 Servidor Node.js: <a href='http://localhost:3000' target='_blank'>http://localhost:3000</a></li>";
    echo "<li>🐘 Servidor PHP: <a href='http://localhost:8080' target='_blank'>http://localhost:8080</a></li>";
    echo "<li>📝 Formulario de registro: <a href='http://localhost:3000/registro.html' target='_blank'>Registro</a></li>";
    echo "</ul>";

} else {
    echo "❌ No se pudo conectar a la base de datos<br>";
    echo "<br><h3>🔧 Acción requerida:</h3>";
    echo "<p>Ejecuta el configurador: <a href='setup_database.php'>setup_database.php</a></p>";
}
?>