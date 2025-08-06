# 🏦 Coop-Innova

Sistema web para cooperativa de ahorros y créditos con configuración automática de base de datos y API de tipo de cambio integrada.

## 🚀 Inicio Rápido

### Configuración Automática Completa
```bash
npm start
```
Este comando:
- ✅ Verifica y configura la base de datos MySQL automáticamente
- ✅ Crea las tablas necesarias si no existen
- ✅ Inserta datos de ejemplo si la BD está vacía
- ✅ **NUEVO**: Configura automáticamente la API de tipo de cambio
- ✅ **NUEVO**: Inicia API Python si está disponible (Flask en puerto 5000)
- ✅ **NUEVO**: API Node.js como respaldo (siempre disponible)
- ✅ Inicia el servidor web en http://localhost:3000

### 🔄 Credenciales de Base de Datos
El sistema prueba automáticamente estas credenciales en orden:
1. **Usuario:** `root` | **Contraseña:** `root` (predeterminada)
2. **Usuario:** `root` | **Contraseña:** `kev123` (respaldo)

### 💱 API de Tipo de Cambio
**Automáticamente configurada** - Obtiene tipos de cambio del Banco Popular desde el BCCR:
- 🐍 **API Python** (Puerto 5000) - Si Python está instalado
- 🟢 **API Node.js** (Puerto 3000) - Siempre disponible como respaldo
- 📊 **Actualización automática** cada 30 minutos
- � **Datos simulados** si falla la conexión al BCCR

## �📋 Comandos Disponibles

```bash
# 🚀 Iniciar servidor completo (BD + APIs + Web)
npm start

# 🔧 Configurar solo la base de datos (sin servidor)
npm run setup-db

# 🧪 Probar conexión a la base de datos
npm run test-db

# 💱 Probar API de tipo de cambio
npm run test-api

# 🔄 Reiniciar completamente la base de datos (⚠️ elimina todos los datos)
npm run reset-db

# 🐍 Ejecutar solo API Python (requiere Python + dependencias)
npm run python-api
```

## 🌐 URLs y APIs Disponibles

### Páginas Web
- 🏠 **Inicio**: http://localhost:3000/
- 📝 **Registro**: http://localhost:3000/registro.html
- 💰 **Movimientos**: http://localhost:3000/movimientos.html
- � **Perfil**: http://localhost:3000/ver_perfil.html
- 💳 **Solicitar Crédito**: http://localhost:3000/solicitar_credito.html
- 📞 **Contacto**: http://localhost:3000/contacto.html

### 🔌 APIs REST
- 💱 **Tipo de Cambio**: `GET http://localhost:3000/api/tipo-cambio`
- 📊 **Estado del Sistema**: `GET http://localhost:3000/api/status`
- 🐍 **API Python** (si disponible): `GET http://localhost:5000/api/tipo-cambio-popular`

### Ejemplo de respuesta API tipo de cambio:
```json
{
  "data": {
    "compra": 500.00,
    "venta": 514.00,
    "banco": "Banco Popular y de Desarrollo Comunal",
    "fecha": "2025-08-06T21:45:41.000Z",
    "timestamp": 1723033541000
  },
  "lastUpdate": "2025-08-06T21:45:41.000Z",
  "services": {
    "python": "stopped",
    "nodejs": "running"
  }
}
```

## �🗄️ Estructura de Base de Datos

### Tablas Creadas Automáticamente:
- **usuarios**: Gestión de usuarios y administradores
- **movimientos**: Registro de transacciones
- **creditos**: Solicitudes y estado de créditos
- **ahorros**: Cuentas de ahorro de usuarios

### Usuarios de Ejemplo:
- **admin1** (Administrador) - Contraseña: `admin123`
- **leidys** (Asociado) - Contraseña: `lady123`
- **fabiangonzalez** (Asociado) - Contraseña: `fabian123`

## 🔧 Requisitos del Sistema

### Obligatorios:
- **Node.js** (versión 14 o superior)
- **MySQL** (versión 5.7 o superior)
- **Credenciales de MySQL**: root/root o root/kev123

### Opcionales (para API Python):
- **Python** (cualquier versión)
- **Dependencias Python**: `flask`, `requests`, `beautifulsoup4`, `flask-cors`

## 🛠️ Configuración Detallada

### Instalación Automática de Python (si disponible):
El sistema intentará automáticamente:
1. Detectar Python en el sistema
2. Instalar dependencias necesarias: `pip install flask requests beautifulsoup4 flask-cors`
3. Iniciar API Flask en puerto 5000
4. Si falla, usará API Node.js como respaldo

### Configuración Manual de Python:
```bash
# 1. Verificar Python
python --version
# o
python3 --version

# 2. Instalar dependencias
pip install flask requests beautifulsoup4 flask-cors

# 3. Probar API Python
npm run python-api
```

## 📊 Monitoreo del Sistema

### Logs Detallados al Iniciar:
```
🚀 INICIANDO COOP-INNOVA
═══════════════════════
✅ Base de datos configurada
✅ API Node.js iniciada
⚠️ Python no disponible
✅ Servidor web iniciado en puerto 3000
```

### API de Estado:
- **URL**: `http://localhost:3000/api/status`
- **Información**: Estado de servicios, base de datos, timestamp

## 🔄 Tecnologías

### Backend:
- **Node.js** con servidor HTTP nativo
- **MySQL** con mysql2 driver
- **Python Flask** (opcional)
- **Web Scraping**: Cheerio (Node.js) + BeautifulSoup (Python)

### Frontend:
- **HTML5, CSS3, Bootstrap 5**
- **jQuery** para formularios
- **PHP** para procesamiento de formularios

### APIs Externas:
- **BCCR** (Banco Central de Costa Rica) para tipos de cambio
- **Banco Popular** datos específicos

## 📝 Características Avanzadas

### 🔥 Nuevas Características:
- ✅ **API de tipo de cambio automática** con respaldo dual (Python + Node.js)
- ✅ **Actualización automática** cada 30 minutos
- ✅ **Datos simulados** como respaldo si falla BCCR
- ✅ **Configuración automática** de Python si está disponible
- ✅ **Limpieza automática** de procesos al cerrar
- ✅ **APIs REST** para integración con frontend

### �️ Características de Estabilidad:
- ✅ Configuración automática de base de datos
- ✅ Múltiples credenciales de respaldo
- ✅ Verificación de integridad de datos
- ✅ Manejo de errores graceful
- ✅ Servidor web integrado
- ✅ Compatibilidad multi-entorno

---

**🎉 ¡Todo está completamente automatizado! Solo ejecuta `npm start` y tendrás:**
- 🗄️ Base de datos MySQL configurada
- 💱 API de tipo de cambio funcionando
- 🌐 Servidor web completo
- 🔌 APIs REST listas para usar

**Desarrollado para Coop-Innova** 🏦

Este proyecto está configurado para usar Node.js, integrarse con GitHub y conectarse a una base de datos MySQL (usuario root, contraseña root, puerto 3306).

## Configuración de MySQL
- Usuario: root
- Contraseña: root
- Puerto: 3306 (local no esta disponible para internet bajo ip privada de Conexiones Metropolitanas)

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
