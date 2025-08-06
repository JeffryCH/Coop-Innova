const mysql = require('mysql2/promise');

class DatabaseSetup {
    constructor() {
        this.host = 'localhost';
        this.database = 'coop_innova';
        this.credentials = [
            { user: 'root', password: 'root' },      // Primera opción
            { user: 'root', password: 'kev123' }     // Segunda opción (compañero)
        ];
    }

    async getConnection(includeDatabase = true) {
        for (const cred of this.credentials) {
            try {
                const connection = await mysql.createConnection({
                    host: this.host,
                    user: cred.user,
                    password: cred.password,
                    database: includeDatabase ? this.database : undefined
                });
                console.log(`✅ Conexión exitosa con usuario: ${cred.user}`);
                return { connection, credentials: cred };
            } catch (error) {
                console.log(`❌ Intento fallido con usuario '${cred.user}': ${error.message}`);
            }
        }
        return null;
    }

    async createDatabase() {
        console.log('🔧 Creando base de datos si no existe...');
        const result = await this.getConnection(false);
        
        if (!result) {
            throw new Error('No se pudo conectar al servidor MySQL');
        }

        const { connection } = result;
        
        try {
            await connection.execute(`CREATE DATABASE IF NOT EXISTS ${this.database}`);
            console.log(`✅ Base de datos '${this.database}' creada/verificada`);
        } finally {
            await connection.end();
        }
    }

    async createTables() {
        console.log('📋 Creando tablas si no existen...');
        const result = await this.getConnection(true);
        
        if (!result) {
            throw new Error('No se pudo conectar a la base de datos');
        }

        const { connection } = result;

        const tables = {
            usuarios: `
                CREATE TABLE IF NOT EXISTS usuarios (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nombre VARCHAR(100),
                    usuario VARCHAR(50) UNIQUE,
                    password VARCHAR(255),
                    rol ENUM('asociado','admin') NOT NULL
                )
            `,
            movimientos: `
                CREATE TABLE IF NOT EXISTS movimientos (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    usuario_id INT,
                    tipo ENUM('deposito','retiro','credito','pago'),
                    monto DECIMAL(10,2),
                    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                )
            `,
            creditos: `
                CREATE TABLE IF NOT EXISTS creditos (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    usuario_id INT,
                    monto DECIMAL(10,2),
                    estado ENUM('pendiente','aprobado','rechazado'),
                    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                )
            `,
            ahorros: `
                CREATE TABLE IF NOT EXISTS ahorros (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    usuario_id INT,
                    monto DECIMAL(10,2),
                    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
                )
            `
        };

        try {
            for (const [tableName, sql] of Object.entries(tables)) {
                await connection.execute(sql);
                console.log(`✅ Tabla '${tableName}' creada/verificada`);
            }
        } finally {
            await connection.end();
        }
    }

    async insertSampleData() {
        console.log('📝 Verificando datos de ejemplo...');
        const result = await this.getConnection(true);
        
        if (!result) {
            throw new Error('No se pudo conectar a la base de datos');
        }

        const { connection } = result;

        try {
            // Verificar si ya hay usuarios
            const [rows] = await connection.execute('SELECT COUNT(*) as total FROM usuarios');
            const userCount = rows[0].total;

            if (userCount === 0) {
                console.log('📝 Insertando datos de ejemplo...');
                
                // Insertar usuarios de ejemplo
                const usuarios = [
                    ['Admin General', 'admin1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'],  // admin123
                    ['Leidy Salgado', 'leidys', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'asociado'], // lady123
                    ['Fabian Gonzalez', 'fabiangonzalez', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'asociado'] // fabian123
                ];

                for (const usuario of usuarios) {
                    await connection.execute(
                        'INSERT INTO usuarios (nombre, usuario, password, rol) VALUES (?, ?, ?, ?)',
                        usuario
                    );
                }

                // Insertar datos de ejemplo en otras tablas
                await connection.execute(
                    'INSERT INTO ahorros (usuario_id, monto) VALUES (2, 150000.00), (3, 275000.00)'
                );

                await connection.execute(
                    'INSERT INTO creditos (usuario_id, monto, estado) VALUES (2, 5000.00, "pendiente"), (3, 3000.00, "aprobado")'
                );

                await connection.execute(`
                    INSERT INTO movimientos (usuario_id, tipo, monto) VALUES 
                    (2, 'deposito', 1000.00), (2, 'retiro', 200.00), (2, 'credito', 5000.00), (2, 'pago', 250.00),
                    (3, 'deposito', 1500.00), (3, 'retiro', 250.00), (3, 'credito', 3000.00), (3, 'pago', 1000.00)
                `);

                console.log('✅ Datos de ejemplo insertados correctamente');
            } else {
                console.log(`ℹ️ Ya existen usuarios en la base de datos (${userCount} usuarios)`);
            }
        } finally {
            await connection.end();
        }
    }

    async verifyDatabase() {
        console.log('🔍 Verificando estado de la base de datos...');
        const result = await this.getConnection(true);
        
        if (!result) {
            throw new Error('No se pudo conectar a la base de datos');
        }

        const { connection } = result;

        try {
            const tables = ['usuarios', 'movimientos', 'creditos', 'ahorros'];
            const tableStatus = {};
            
            for (const table of tables) {
                const [rows] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
                if (rows.length > 0) {
                    const [countRows] = await connection.execute(`SELECT COUNT(*) as total FROM ${table}`);
                    tableStatus[table] = {
                        exists: true,
                        count: countRows[0].total
                    };
                    console.log(`✅ Tabla '${table}': ${countRows[0].total} registros`);
                } else {
                    tableStatus[table] = {
                        exists: false,
                        count: 0
                    };
                    console.log(`❌ Tabla '${table}': NO existe`);
                }
            }
            
            return tableStatus;
        } finally {
            await connection.end();
        }
    }

    async setupComplete() {
        try {
            console.log('\n🚀 INICIANDO CONFIGURACIÓN DE BASE DE DATOS - COOP-INNOVA');
            console.log('=' .repeat(60));

            // 1. Crear base de datos
            await this.createDatabase();

            // 2. Crear tablas
            await this.createTables();

            // 3. Insertar datos de ejemplo
            await this.insertSampleData();

            // 4. Verificar estado final
            console.log('\n📊 Estado final de la base de datos:');
            const status = await this.verifyDatabase();

            console.log('\n🎉 CONFIGURACIÓN COMPLETADA EXITOSAMENTE');
            console.log('=' .repeat(60));
            
            return true;
        } catch (error) {
            console.error('\n❌ ERROR EN LA CONFIGURACIÓN:', error.message);
            console.log('\n🔧 Verifica que MySQL esté ejecutándose y las credenciales sean correctas');
            return false;
        }
    }
}

module.exports = DatabaseSetup;
