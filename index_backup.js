const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const DatabaseSetup = require('.        console.log(`🚀 URL Principal: http://localhost:${PORT}`);
        console.log(`📁 Directorio: ${__dirname}`);
        console.log('\n📋 PÁGINAS DISPONIBLES:');
        console.log(`   🏠 Inicio: http://localhost:${PORT}/`);
        console.log(`   📝 Registro: http://localhost:${PORT}/registro.html`);
        console.log(`   💰 Movimientos: http://localhost:${PORT}/movimientos.html`);
        console.log(`   👤 Perfil: http://localhost:${PORT}/ver_perfil.html`);
        console.log(`   💳 Crédito: http://localhost:${PORT}/solicitar_credito.html`);
        console.log(`   📞 Contacto: http://localhost:${PORT}/contacto.html`);
        console.log('\n🔌 APIS DISPONIBLES:');
        console.log(`   💱 Tipo de Cambio: http://localhost:${PORT}/api/tipo-cambio`);
        console.log(`   📊 Estado Sistema: http://localhost:${PORT}/api/status`);
        if (serviceManager.services.python) {
            console.log(`   🐍 API Python: http://localhost:5000/api/tipo-cambio-popular`);
        }
        console.log('\n✨ ¡Coop-Innova está completamente listo!');setup');
const ServiceManager = require('./service-manager');

const PORT = process.env.PORT || 3000;

// Inicializar gestor de servicios
const serviceManager = new ServiceManager();

// Función para obtener el tipo MIME basado en la extensión del archivo
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'text/plain';
}

// Función para manejar rutas API
function handleAPIRoutes(req, res, pathname) {
    if (pathname === '/api/tipo-cambio') {
        const tipoCambio = serviceManager.getTipoCambio();
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end(JSON.stringify(tipoCambio));
        return true;
    }
    
    if (pathname === '/api/status') {
        const status = {
            server: 'running',
            timestamp: new Date().toISOString(),
            services: serviceManager.getTipoCambio().services,
            database: 'connected' // Podríamos verificar esto también
        };
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify(status));
        return true;
    }
    
    return false;
}

// Función para inicializar la base de datos
async function initializeDatabase() {
    console.log('\n🔧 Iniciando verificación de base de datos...');
    const dbSetup = new DatabaseSetup();
    const success = await dbSetup.setupComplete();
    
    if (success) {
        console.log('✅ Base de datos lista para usar\n');
    } else {
        console.log('⚠️ Continuando sin configuración completa de BD\n');
    }
    
    return success;
}

// Crear el servidor HTTP
const server = http.createServer((req, res) => {
    let pathname = url.parse(req.url).pathname;
    
    // Manejar rutas de API primero
    if (pathname.startsWith('/api/')) {
        if (handleAPIRoutes(req, res, pathname)) {
            return; // La API manejó la solicitud
        }
    }
    
    // Si la ruta es '/', servir index.html
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Construir la ruta completa del archivo
    const filePath = path.join(__dirname, pathname);
    
    // Verificar si el archivo existe
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // Archivo no encontrado
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end('<h1>404 - Página no encontrada</h1><p>Ruta solicitada: ' + pathname + '</p>');
            return;
        }
        
        // Leer y servir el archivo
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/html'});
                res.end('<h1>500 - Error interno del servidor</h1>');
                return;
            }
            
            // Establecer el tipo de contenido correcto
            const mimeType = getMimeType(filePath);
            res.writeHead(200, {'Content-Type': mimeType});
            res.end(data);
        });
    });
});

// Función principal para iniciar la aplicación
async function startApplication() {
    console.log('\n🚀 INICIANDO COOP-INNOVA');
    console.log('=' .repeat(50));
    
    // 1. Configurar base de datos
    await initializeDatabase();
    
    // 2. Inicializar servicios de tipo de cambio
    await serviceManager.initializeServices();
    
    // 3. Configurar manejo de señales para limpieza
    process.on('SIGINT', () => {
        console.log('\n🛑 Deteniendo servicios...');
        serviceManager.cleanup();
        process.exit(0);
    });
    
    process.on('SIGTERM', () => {
        console.log('\n🛑 Deteniendo servicios...');
        serviceManager.cleanup();
        process.exit(0);
    });
    
    // 4. Iniciar el servidor HTTP
    server.listen(PORT, () => {
        console.log('\n🌐 SERVIDOR WEB INICIADO');
        console.log('=' .repeat(30));
        console.log(`🚀 URL: http://localhost:${PORT}`);
        console.log(`📁 Directorio: ${__dirname}`);
        console.log('\n📋 PÁGINAS DISPONIBLES:');
        console.log(`   🏠 Inicio: http://localhost:${PORT}/`);
        console.log(`   📝 Registro: http://localhost:${PORT}/registro.html`);
        console.log(`   � Movimientos: http://localhost:${PORT}/movimientos.html`);
        console.log(`   👤 Perfil: http://localhost:${PORT}/ver_perfil.html`);
        console.log(`   💳 Crédito: http://localhost:${PORT}/solicitar_credito.html`);
        console.log(`   📞 Contacto: http://localhost:${PORT}/contacto.html`);
        console.log('\n✨ ¡Coop-Innova está listo para usar!');
        console.log('=' .repeat(50));
    });
}

// Iniciar la aplicación
startApplication().catch(error => {
    console.error('❌ Error al iniciar la aplicación:', error);
    process.exit(1);
});