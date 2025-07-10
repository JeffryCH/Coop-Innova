# Proyecto MCP Server

Este proyecto está configurado para usar Node.js, integrarse con GitHub y conectarse a una base de datos MySQL (usuario root, contraseña root, puerto 3306).

## Configuración de MySQL
- Usuario: root
- Contraseña: root
- Puerto: 3306

## Integración con GitHub
- Utiliza un token personal (recomendado: variable de entorno para mayor seguridad).

## Requisitos
- Node.js
- MySQL Server
- Git

## Instalación
1. Instala las dependencias:
   ```sh
   npm install
   ```
2. Configura las variables de entorno para el token de GitHub y la conexión a MySQL.

## Uso
- Ejecuta el servidor MCP:
   ```sh
   npm start
   ```

## Notas
- No almacenes el token de GitHub en archivos de texto plano.
- Usa MySQL Workbench para administrar la base de datos.
