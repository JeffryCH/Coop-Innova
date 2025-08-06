<?php
include 'conexion_registro.php';

if (isset($_POST["nombre"]) && isset($_POST["usuario"]) && isset($_POST["password"]) && isset($_POST["rol"])) {

    // Conexión a la base de datos
    $host = "localhost"; 
    $user = "root";
    $password = "kev123"; // <-- ajusta si es diferente
    $base_datos = "coop_innova";

    $nombre = $_POST["nombre"];
    $usuario = $_POST["usuario"];
    $passwordPlano = $_POST["password"];
    $rol = $_POST["rol"];

    // Conectar
    $conexion = new mysqli($host, $user, $password, $base_datos);

    // Verificar conexión
    if ($conexion->connect_error) {
        die("Error de conexión: " . $conexion->connect_error);
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
