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
        if (isAjax()) {
            header('Content-Type: application/json');
            echo json_encode(["success" => false, "error" => "Error de conexión: No se pudo conectar con ninguna de las credenciales disponibles"]);
        } else {
            die("Error de conexión: No se pudo conectar con ninguna de las credenciales disponibles");
        }
        exit;
    }

    // Encriptar contraseña antes de guardar
    $passwordHash = password_hash($passwordPlano, PASSWORD_DEFAULT);

    // Preparar la consulta
    $sql = $conexion->prepare("INSERT INTO usuarios (nombre, usuario, password, rol) VALUES (?, ?, ?, ?)");

    // Preparar los parámetros
    $sql->bind_param("ssss", $nombre, $usuario, $passwordHash, $rol);

    // Ejecutar la inserción
    if ($sql->execute()) {
        if (isAjax()) {
            header('Content-Type: application/json');
            echo json_encode(["success" => true, "message" => "¡Usuario registrado exitosamente!"]);
        } else {
            echo "¡Usuario registrado exitosamente!";
        }
    } else {
        if ($conexion->errno === 1062) {
            $msg = "El nombre de usuario ya existe.";
        } else {
            $msg = "Error al registrar el usuario: " . $sql->error;
        }
        if (isAjax()) {
            header('Content-Type: application/json');
            echo json_encode(["success" => false, "error" => $msg]);
        } else {
            echo $msg;
        }
    }

    // Cerrar conexión
    $conexion->close();

} else {
    if (isAjax()) {
        header('Content-Type: application/json');
        echo json_encode(["success" => false, "error" => "Datos incompletos."]);
    } else {
        echo "Datos incompletos.";
    }
}

// Función para detectar si la petición es AJAX/fetch
function isAjax()
{
    return (
        (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') ||
        (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false)
    );
}
?>