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
    private static $credenciales = null;

    // Cargar credenciales desde .env si existe
    private static function loadEnvCredenciales()
    {
        $envPath = __DIR__ . '/../.env';
        $credenciales = [];
        if (file_exists($envPath)) {
            $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            $envs = [];
            foreach ($lines as $line) {
                if (strpos($line, 'DB_USER_') === 0) {
                    $num = substr($line, 8, 1);
                    $envs[$num]['user'] = substr($line, 10);
                }
                if (strpos($line, 'DB_PASSWORD_') === 0) {
                    $num = substr($line, 12, 1);
                    $envs[$num]['password'] = substr($line, 14);
                }
                if (strpos($line, 'DB_PORT_') === 0) {
                    $num = substr($line, 8, 1);
                    $envs[$num]['port'] = substr($line, 10);
                }
            }
            foreach ($envs as $env) {
                $credenciales[] = [
                    'user' => $env['user'] ?? 'root',
                    'password' => $env['password'] ?? '',
                    'port' => $env['port'] ?? 3306
                ];
            }
        }
        // Si no hay credenciales en .env, usar las por defecto
        if (empty($credenciales)) {
            $credenciales = [
                ['user' => 'root', 'password' => '', 'port' => 3306],
                ['user' => 'root', 'password' => '', 'port' => 3306]
            ];
        }
        return $credenciales;
    }

    /**
     * Obtiene una conexión a la base de datos
     * Intenta múltiples credenciales hasta encontrar una que funcione
     */
    public static function getConnection($incluir_database = true)
    {
        if (self::$credenciales === null) {
            self::$credenciales = self::loadEnvCredenciales();
        }
        $database = $incluir_database ? self::DATABASE : null;
        foreach (self::$credenciales as $cred) {
            $conexion = new mysqli(self::HOST, $cred['user'], $cred['password'], $database, $cred['port']);
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
        if (self::$credenciales === null) {
            self::$credenciales = self::loadEnvCredenciales();
        }
        foreach (self::$credenciales as $cred) {
            $conexion = new mysqli(self::HOST, $cred['user'], $cred['password'], null, $cred['port']);
            if (!$conexion->connect_error) {
                $conexion->close();
                return [
                    'host' => self::HOST,
                    'user' => $cred['user'],
                    'database' => self::DATABASE,
                    'port' => $cred['port']
                ];
            }
        }
        return false;
    }

    // Método público para obtener credenciales del .env
    public static function getEnvCredenciales()
    {
        return self::loadEnvCredenciales();
    }
}
?>