<?php
// Archivo para manejar el registro desde el formulario HTML
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener datos del formulario
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        // Si no viene JSON, intentar con POST normal
        $input = $_POST;
    }

    if (isset($input["nombre"]) && isset($input["usuario"]) && isset($input["password"]) && isset($input["rol"])) {

        // Función para intentar conexión con múltiples credenciales
        function conectarBaseDatos()
        {
            $host = "localhost";
            $base_datos = "coop_innova";

            // Intentar múltiples configuraciones de usuario/contraseña
            $credenciales = [
                ['user' => 'root', 'password' => ''],      // Primera opción
                ['user' => 'root', 'password' => '']     // Segunda opción (compañero)
            ];

            foreach ($credenciales as $cred) {
                $conexion = new mysqli($host, $cred['user'], $cred['password'], $base_datos);

                if (!$conexion->connect_error) {
                    return $conexion; // Conexión exitosa
                }
            }

            return false; // No se pudo conectar con ninguna credencial
        }

        // Configuración de base de datos
        $host = "localhost";
        $user = "root";
        $password = "";
        $base_datos = "coop_innova";

        $nombre = $input["nombre"];
        $usuario = $input["usuario"];
        $passwordPlano = $input["password"];
        $rol = $input["rol"];

        try {
            // Conectar a la base de datos usando múltiples credenciales
            $conexion = conectarBaseDatos();

            if (!$conexion) {
                throw new Exception("No se pudo conectar con ninguna de las credenciales disponibles");
            }

            // Encriptar contraseña
            $passwordHash = password_hash($passwordPlano, PASSWORD_DEFAULT);

            // Preparar consulta
            $sql = $conexion->prepare("INSERT INTO usuarios (nombre, usuario, password, rol) VALUES (?, ?, ?, ?)");
            $sql->bind_param("ssss", $nombre, $usuario, $passwordHash, $rol);

            // Ejecutar inserción
            if ($sql->execute()) {
                echo json_encode([
                    "success" => true,
                    "message" => "¡Usuario registrado exitosamente!",
                    "user_id" => $conexion->insert_id
                ]);
            } else {
                if ($conexion->errno === 1062) {
                    echo json_encode([
                        "success" => false,
                        "message" => "El nombre de usuario ya existe."
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "message" => "Error al registrar el usuario: " . $sql->error
                    ]);
                }
            }

            $conexion->close();

        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => "Error de conexión: " . $e->getMessage()
            ]);
        }

    } else {
        echo json_encode([
            "success" => false,
            "message" => "Datos incompletos. Se requieren: nombre, usuario, password y rol."
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Método no permitido. Use POST."
    ]);
}
?>