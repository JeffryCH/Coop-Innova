<?php
include 'conexion_registro.php';

if (isset($_POST["nombre"]) && isset($_POST["usuario"]) && isset($_POST["password"]) && isset($_POST["rol"])) {
    $nombre = $_POST["nombre"];
    $usuario = $_POST["usuario"];
    $passwordPlano = $_POST["password"];
    $rol = $_POST["rol"];

    // Usar la conexión centralizada
    $conexion = DatabaseConfig::getConnection();
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
        echo "¡Usuario registrado exitosamente!";
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