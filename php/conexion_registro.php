<?php
// conexion.php
require_once 'database_config.php';

// Obtener conexión usando la configuración centralizada
$conexion = DatabaseConfig::getConnection();

if (!$conexion) {
    $info = DatabaseConfig::getConnectionInfo();
    if ($info) {
        die("Conexión fallida: La base de datos '{$info['database']}' no existe o no es accesible. Host: {$info['host']}, User: {$info['user']}");
    } else {
        die("Conexión fallida: No se pudo conectar con ninguna de las credenciales configuradas");
    }
}


// // ********** SELECT: Listar usuarios **********
// echo "******* SELECT Usuarios *******<br>";

// $sql = "SELECT id, nombre, usuario, rol FROM usuarios";
// $resultado = $conexion->query($sql);

// if ($resultado->num_rows > 0) {
//     while ($fila = $resultado->fetch_assoc()) {
//         echo "ID: " . $fila["id"] . "<br>";
//         echo "Nombre: " . $fila["nombre"] . "<br>";
//         echo "Usuario: " . $fila["usuario"] . "<br>";
//         echo "Rol: " . $fila["rol"] . "<br><hr>";
//     }
// } else {
//     echo "No hay usuarios registrados.<br>";
// }

// // ********** INSERT: Insertar nuevo usuario **********
// echo "******* INSERT Usuario *******<br>";

// $nombreUsuario = "Carlos Mora";
// $usuario = "carlosm";
// $passwordPlano = "carlos123";
// $rol = "asociado";

// // Hashear la contraseña antes de insertar
// $passwordHash = password_hash($passwordPlano, PASSWORD_DEFAULT);

// $sqlInsert = $conexion->prepare("INSERT INTO usuarios (nombre, usuario, password, rol) VALUES (?, ?, ?, ?)");
// $sqlInsert->bind_param("ssss", $nombreUsuario, $usuario, $passwordHash, $rol);

// if ($sqlInsert->execute()) {
//     echo "Nuevo usuario registrado exitosamente.<br>";
// } else {
//     echo "Error al insertar usuario: " . $sqlInsert->error . "<br>";
// }

// // ********** UPDATE: Actualizar rol de usuario **********
// echo "******* UPDATE Usuario *******<br>";

// $idActualizar = 2;  // ID de usuario que quieres actualizar
// $nuevoRol = "admin";

// $sqlUpdate = $conexion->prepare("UPDATE usuarios SET rol = ? WHERE id = ?");
// $sqlUpdate->bind_param("si", $nuevoRol, $idActualizar);

// if ($sqlUpdate->execute()) {
//     echo "Usuario actualizado exitosamente.<br>";
// } else {
//     echo "Error al actualizar usuario: " . $sqlUpdate->error . "<br>";
// }

// // ********** DELETE: Eliminar usuario **********
// echo "******* DELETE Usuario *******<br>";

// $idEliminar = 3; // ID de usuario a eliminar

// $sqlDelete = $conexion->prepare("DELETE FROM usuarios WHERE id = ?");
// $sqlDelete->bind_param("i", $idEliminar);

// if ($sqlDelete->execute()) {
//     echo "Usuario eliminado exitosamente.<br>";
// } else {
//     echo "Error al eliminar usuario: " . $sqlDelete->error . "<br>";
// }

// // Cerrar conexiones preparadas
// $sqlInsert->close();
// $sqlUpdate->close();
// $sqlDelete->close();
// $conexion->close();
?>