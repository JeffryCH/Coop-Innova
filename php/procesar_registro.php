<?php
include 'conexion_registro.php';

if (isset($_POST["nombre"]) && isset($_POST["usuario"]) && isset($_POST["password"]) && isset($_POST["rol"])) {

    // Función para intentar conexión con múltiples credenciales
    function conectarBaseDatos()
    {
        $host = "localhost";
        $base_datos = "coop_innova";

        // Intentar múltiples configuraciones de usuario/contraseña
        $credenciales = [
            ['user' => 'root', 'password' => 'root'],      // Primera opción
            ['user' => 'root', 'password' => 'kev123']     // Segunda opción (compañero)
        ];

        foreach ($credenciales as $cred) {
            $conexion = new mysqli($host, $cred['user'], $cred['password'], $base_datos);

            if (!$conexion->connect_error) {
                return $conexion; // Conexión exitosa
            }
        }

        return false; // No se pudo conectar con ninguna credencial
    }

    $nombre = $_POST["nombre"];
    $usuario = $_POST["usuario"];
    $passwordPlano = $_POST["password"];
    $rol = $_POST["rol"];

    // Conectar usando la función que prueba múltiples credenciales
    $conexion = conectarBaseDatos();

    // Verificar conexión
    if (!$conexion) {
        die("Error de conexión: No se pudo conectar con ninguna de las credenciales disponibles");
    }

    // Encriptar contraseña antes de guardar
    $passwordHash = password_hash($passwordPlano, PASSWORD_DEFAULT);

    // Preparar la consulta
    $sql = $conexion->prepare("INSERT INTO usuarios (nombre, usuario, password, rol) VALUES (?, ?, ?, ?)");

    // Preparar los parámetros
    $sql->bind_param("ssss", $nombre, $usuario, $passwordHash, $rol);

    // Ejecutar la inserción
    if ($sql->execute()) {
        echo "¡Usuario registrado exitosamente!<br>";
    } else {
        if ($conexion->errno === 1062) {
            echo "El nombre de usuario ya existe.";
        } else {
            echo "Error al registrar el usuario: " . $sql->error;
        }
    }

    // Cerrar conexión
    $conexion->close();

} else {
    echo "Datos incompletos.";
}
?>