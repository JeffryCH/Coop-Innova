<?php
echo "<h2>🔍 Prueba de Conexión a Base de Datos - Coop-Innova</h2>";

$host = "localhost";
$base_datos = "coop_innova";

// Función para intentar conexión con múltiples credenciales
function conectarBaseDatos($base_datos = null)
{
    $host = "localhost";

    // Intentar múltiples configuraciones de usuario/contraseña
    $credenciales = [
        ['user' => 'root', 'password' => ''],      // Primera opción
        ['user' => 'root', 'password' => '']     // Segunda opción (compañero)
    ];

    foreach ($credenciales as $cred) {
        $conexion = new mysqli($host, $cred['user'], $cred['password'], $base_datos);

        if (!$conexion->connect_error) {
            echo "✅ Conexión exitosa con usuario: <strong>{$cred['user']}</strong><br>";
            return $conexion; // Conexión exitosa
        } else {
            echo "❌ Intento fallido con usuario '{$cred['user']}': {$conexion->connect_error}<br>";
        }
    }

    return false; // No se pudo conectar con ninguna credencial
}

try {
    // Intentar conexión
    $conexion = conectarBaseDatos($base_datos);

    if (!$conexion) {
        throw new Exception("No se pudo conectar con ninguna de las credenciales disponibles");
    }

    echo "✅ <strong>Conexión exitosa a la base de datos '$base_datos'</strong><br><br>";

    // Verificar si las tablas existen
    $tablas = ['usuarios', 'movimientos', 'creditos', 'ahorros'];

    foreach ($tablas as $tabla) {
        $result = $conexion->query("SHOW TABLES LIKE '$tabla'");
        if ($result && $result->num_rows > 0) {
            echo "✅ Tabla '$tabla' existe<br>";

            // Contar registros
            $count_result = $conexion->query("SELECT COUNT(*) as total FROM $tabla");
            if ($count_result) {
                $count = $count_result->fetch_assoc();
                echo "&nbsp;&nbsp;&nbsp;📊 Registros: {$count['total']}<br>";
            }
        } else {
            echo "❌ Tabla '$tabla' NO existe<br>";
        }
    }

    echo "<br><h3>👥 Usuarios registrados:</h3>";
    $sql = "SELECT id, nombre, usuario, rol FROM usuarios";
    $resultado = $conexion->query($sql);

    if ($resultado && $resultado->num_rows > 0) {
        echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
        echo "<tr><th>ID</th><th>Nombre</th><th>Usuario</th><th>Rol</th></tr>";
        while ($fila = $resultado->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . $fila["id"] . "</td>";
            echo "<td>" . $fila["nombre"] . "</td>";
            echo "<td>" . $fila["usuario"] . "</td>";
            echo "<td>" . $fila["rol"] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "No hay usuarios registrados.";
    }

    $conexion->close();

} catch (Exception $e) {
    echo "❌ <strong>Error:</strong> " . $e->getMessage() . "<br>";
    echo "<br><h3>🔧 Posibles soluciones:</h3>";
    echo "<ul>";
    echo "<li>Verificar que MySQL esté corriendo</li>";
    echo "<li>Verificar credenciales de conexión (usuario: root, password: kev123)</li>";
    echo "<li>Crear la base de datos 'coop_innova' si no existe</li>";
    echo "<li>Ejecutar el script SQL para crear las tablas</li>";
    echo "</ul>";
}
?>