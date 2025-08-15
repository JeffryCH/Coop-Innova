<?php
/**
 * Configuración de base de datos para Coop-Innova
 * Este archivo centraliza las configuraciones de conexión
 */

class DatabaseConfig
{
    const HOST = "localhost";
    const DATABASE = "coop_innova";

    // Credenciales en orden de prioridad (se probará la primera, luego la segunda)
    private static $credenciales = [
        ['user' => 'root', 'password' => ''],      // Tu configuración
        ['user' => 'root', 'password' => '']     // Configuración del compañero
    ];

    /**
     * Obtiene una conexión a la base de datos
     * Intenta múltiples credenciales hasta encontrar una que funcione
     */
    public static function getConnection($incluir_database = true)
    {
        $database = $incluir_database ? self::DATABASE : null;

        foreach (self::$credenciales as $cred) {
            $conexion = new mysqli(self::HOST, $cred['user'], $cred['password'], $database);

            if (!$conexion->connect_error) {
                return $conexion; // Conexión exitosa
            }
        }

        return false; // No se pudo conectar con ninguna credencial
    }

    /**
     * Obtiene información de la conexión exitosa
     */
    public static function getConnectionInfo()
    {
        foreach (self::$credenciales as $cred) {
            $conexion = new mysqli(self::HOST, $cred['user'], $cred['password']);

            if (!$conexion->connect_error) {
                $conexion->close();
                return [
                    'host' => self::HOST,
                    'user' => $cred['user'],
                    'database' => self::DATABASE
                ];
            }
        }

        return false;
    }
}
?>