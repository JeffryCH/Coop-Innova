<?php
// Prueba para verificar lectura del archivo .env y credenciales detectadas
require_once 'database_config.php';
header('Content-Type: text/plain');

$envPath = __DIR__ . '/../.env';
echo "Ruta .env: $envPath\n";
echo "Existe .env: " . (file_exists($envPath) ? 'Sí' : 'No') . "\n";

$credenciales = DatabaseConfig::getEnvCredenciales();
echo "Credenciales detectadas:\n";
foreach ($credenciales as $i => $cred) {
    echo "#" . ($i + 1) . ": Usuario={$cred['user']}, Password=" . ($cred['password'] ? '***' : '(vacía)') . ", Puerto={$cred['port']}\n";
}
?>