const DatabaseSetup = require('../database-setup');
const mysql = require('mysql2/promise');

class DatabaseReset extends DatabaseSetup {
    async dropDatabase() {
        console.log('🗑️ Eliminando base de datos existente...');
        const result = await this.getConnection(false);
        
        if (!result) {
            throw new Error('No se pudo conectar al servidor MySQL');
        }

        const { connection } = result;
        
        try {
            await connection.execute(`DROP DATABASE IF EXISTS ${this.database}`);
            console.log(`✅ Base de datos '${this.database}' eliminada`);
        } finally {
            await connection.end();
        }
    }

    async resetComplete() {
        try {
            console.log('\n🔄 REINICIO COMPLETO DE BASE DE DATOS - COOP-INNOVA');
            console.log('=' .repeat(60));
            console.log('⚠️ ADVERTENCIA: Esto eliminará TODOS los datos existentes');
            
            // 1. Eliminar base de datos
            await this.dropDatabase();

            // 2. Recrear todo
            await this.createDatabase();
            await this.createTables();
            await this.insertSampleData();

            // 3. Verificar estado final
            console.log('\n📊 Estado final de la base de datos:');
            await this.verifyDatabase();

            console.log('\n🎉 REINICIO COMPLETADO EXITOSAMENTE');
            console.log('✅ Base de datos recreada con datos de ejemplo');
            console.log('=' .repeat(60));
            
            return true;
        } catch (error) {
            console.error('\n❌ ERROR EN EL REINICIO:', error.message);
            return false;
        }
    }
}

async function resetDatabase() {
    const dbReset = new DatabaseReset();
    const success = await dbReset.resetComplete();
    return success;
}

// Ejecutar reinicio si se llama directamente
if (require.main === module) {
    resetDatabase().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = resetDatabase;
