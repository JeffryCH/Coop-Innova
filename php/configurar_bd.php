<?php
// configurar_bd.php
// Formulario para configurar credenciales de la base de datos y guardarlas en .env
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $envPath = __DIR__ . '/../.env';
    $envContent = "";
    for ($i = 1; $i <= 2; $i++) {
        $user = isset($_POST["db_user_$i"]) ? trim($_POST["db_user_$i"]) : '';
        $password = isset($_POST["db_password_$i"]) ? trim($_POST["db_password_$i"]) : '';
        $port = isset($_POST["db_port_$i"]) ? trim($_POST["db_port_$i"]) : '3306';
        if ($user !== '') {
            $envContent .= "DB_USER_$i=$user\nDB_PASSWORD_$i=$password\nDB_PORT_$i=$port\n";
        }
    }
    file_put_contents($envPath, $envContent);
    echo "<p>¡Credenciales guardadas correctamente!</p>";
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Configurar Base de Datos</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
        }

        form {
            max-width: 400px;
            margin: auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 8px;
        }

        label {
            display: block;
            margin-bottom: 8px;
        }

        input[type="text"],
        input[type="password"] {
            width: 100%;
            padding: 8px;
            margin-bottom: 16px;
        }

        button {
            padding: 10px 20px;
            background: #007bff;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        button:hover {
            background: #0056b3;
        }
    </style>
</head>

<body>
    <h2>Configurar Acceso a la Base de Datos</h2>
    <form method="post">
        <h3>Configuración 1 (por ejemplo, Workbench)</h3>
        <label for="db_user_1">Usuario de la BD:</label>
        <input type="text" id="db_user_1" name="db_user_1" required>
        <label for="db_password_1">Contraseña de la BD:</label>
        <input type="password" id="db_password_1" name="db_password_1">
        <label for="db_port_1">Puerto MySQL:</label>
        <input type="text" id="db_port_1" name="db_port_1" value="3306">
        <hr>
        <h3>Configuración 2 (por ejemplo, XAMPP)</h3>
        <label for="db_user_2">Usuario de la BD:</label>
        <input type="text" id="db_user_2" name="db_user_2">
        <label for="db_password_2">Contraseña de la BD:</label>
        <input type="password" id="db_password_2" name="db_password_2">
        <label for="db_port_2">Puerto MySQL:</label>
        <input type="text" id="db_port_2" name="db_port_2" value="3307">
        <button type="submit">Guardar</button>
    </form>
</body>

</html>