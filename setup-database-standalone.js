#!/usr/bin/env node

const DatabaseSetup = require('./database-setup');

async function runSetup() {
    console.log('🔧 CONFIGURACIÓN INDEPENDIENTE DE BASE DE DATOS');
    console.log('=' .repeat(50));
    
    const dbSetup = new DatabaseSetup();
    const success = await dbSetup.setupComplete();
    
    if (success) {
        console.log('\n✅ Configuración completada exitosamente');
        console.log('🚀 Puedes ejecutar "npm start" para iniciar el servidor');
    } else {
        console.log('\n❌ Error en la configuración');
        console.log('🔧 Revisa la conexión a MySQL y las credenciales');
    }
    
    return success;
}

// Ejecutar setup si se llama directamente
if (require.main === module) {
    runSetup().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = runSetup;
