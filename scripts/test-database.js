const DatabaseSetup = require('../database-setup');

async function testDatabase() {
    console.log('🧪 PRUEBA DE BASE DE DATOS - COOP-INNOVA');
    console.log('=' .repeat(45));
    
    const dbSetup = new DatabaseSetup();
    
    try {
        // Verificar conexión
        const result = await dbSetup.getConnection(true);
        
        if (!result) {
            console.log('❌ No se pudo conectar a la base de datos');
            console.log('\n🔧 Posibles soluciones:');
            console.log('   - Verificar que MySQL esté ejecutándose');
            console.log('   - Verificar credenciales (root/root o root/kev123)');
            console.log('   - Ejecutar: npm run setup-db');
            return false;
        }
        
        const { connection, credentials } = result;
        console.log(`✅ Conexión exitosa con usuario: ${credentials.user}`);
        
        // Verificar estado de las tablas
        await dbSetup.verifyDatabase();
        
        await connection.end();
        
        console.log('\n🎉 Base de datos funcionando correctamente');
        return true;
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

// Ejecutar prueba si se llama directamente
if (require.main === module) {
    testDatabase().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = testDatabase;
