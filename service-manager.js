const { spawn } = require('child_process');
const path = require('path');
const TipoCambioAPI = require('./tipo-cambio-api');

class ServiceManager {
    constructor() {
        this.services = {
            python: null,
            tipoCambioAPI: null
        };
        this.tipoCambioData = null;
        this.lastUpdate = null;
    }

    // Verificar si Python está disponible
    async checkPython() {
        const pythonCommands = ['python', 'python3', 'py'];
        
        for (const cmd of pythonCommands) {
            try {
                const result = await this.runCommand(cmd, ['--version']);
                if (result.success) {
                    console.log(`✅ Python encontrado: ${cmd}`);
                    return { available: true, command: cmd, version: result.output };
                }
            } catch (error) {
                // Continuar con el siguiente comando
            }
        }
        
        console.log('❌ Python no está disponible en el sistema');
        return { available: false, command: null, version: null };
    }

    // Ejecutar comando y capturar resultado
    runCommand(command, args) {
        return new Promise((resolve, reject) => {
            const process = spawn(command, args, { 
                stdio: 'pipe',
                shell: true 
            });
            
            let output = '';
            let error = '';
            
            process.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            process.stderr.on('data', (data) => {
                error += data.toString();
            });
            
            process.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, output: output.trim(), error: error.trim() });
                } else {
                    reject({ success: false, output: output.trim(), error: error.trim(), code });
                }
            });
            
            process.on('error', (err) => {
                reject({ success: false, error: err.message });
            });
        });
    }

    // Instalar dependencias de Python
    async installPythonDependencies(pythonCmd) {
        console.log('📦 Instalando dependencias de Python...');
        const dependencies = ['flask', 'requests', 'beautifulsoup4', 'flask-cors'];
        
        try {
            for (const dep of dependencies) {
                console.log(`   Instalando ${dep}...`);
                await this.runCommand(pythonCmd, ['-m', 'pip', 'install', dep]);
            }
            console.log('✅ Dependencias de Python instaladas');
            return true;
        } catch (error) {
            console.log('❌ Error instalando dependencias de Python:', error.error);
            return false;
        }
    }

    // Iniciar API de Python
    async startPythonAPI(pythonCmd) {
        console.log('🐍 Iniciando API de Python (Flask)...');
        
        try {
            const pythonProcess = spawn(pythonCmd, ['api_tipo_cambio_popular.py'], {
                cwd: __dirname,
                stdio: 'pipe',
                shell: true
            });

            pythonProcess.stdout.on('data', (data) => {
                const output = data.toString();
                if (output.includes('Running on')) {
                    console.log('✅ API de Python iniciada en puerto 5000');
                }
            });

            pythonProcess.stderr.on('data', (data) => {
                const error = data.toString();
                if (!error.includes('WARNING') && !error.includes('Debug mode')) {
                    console.log('⚠️ Python API:', error);
                }
            });

            pythonProcess.on('close', (code) => {
                console.log(`🐍 API de Python terminada con código: ${code}`);
                this.services.python = null;
            });

            this.services.python = pythonProcess;
            
            // Esperar un poco para que el servidor se inicie
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            return true;
        } catch (error) {
            console.log('❌ Error iniciando API de Python:', error.message);
            return false;
        }
    }

    // Iniciar API de Node.js
    async startNodeAPI() {
        console.log('🟢 Iniciando API de tipo de cambio en Node.js...');
        
        try {
            this.services.tipoCambioAPI = new TipoCambioAPI();
            
            // Obtener datos iniciales
            await this.updateTipoCambio();
            
            // Programar actualizaciones cada 30 minutos
            setInterval(() => {
                this.updateTipoCambio();
            }, 30 * 60 * 1000);
            
            console.log('✅ API de Node.js iniciada correctamente');
            return true;
        } catch (error) {
            console.log('❌ Error iniciando API de Node.js:', error.message);
            return false;
        }
    }

    // Actualizar datos de tipo de cambio
    async updateTipoCambio() {
        try {
            const data = await this.services.tipoCambioAPI.obtenerTipoCambioConFallback();
            this.tipoCambioData = data;
            this.lastUpdate = new Date();
            
            if (data.simulated) {
                console.log('📊 Tipo de cambio actualizado (simulado)');
            } else {
                console.log('📊 Tipo de cambio actualizado desde BCCR');
            }
        } catch (error) {
            console.log('❌ Error actualizando tipo de cambio:', error.message);
        }
    }

    // Obtener datos de tipo de cambio
    getTipoCambio() {
        return {
            data: this.tipoCambioData,
            lastUpdate: this.lastUpdate,
            services: {
                python: this.services.python ? 'running' : 'stopped',
                nodejs: this.services.tipoCambioAPI ? 'running' : 'stopped'
            }
        };
    }

    // Inicializar todos los servicios
    async initializeServices() {
        console.log('\n💼 INICIANDO SERVICIOS DE TIPO DE CAMBIO');
        console.log('=' .repeat(45));

        // 1. Verificar Python
        const pythonCheck = await this.checkPython();
        
        if (pythonCheck.available) {
            console.log(`🐍 Python disponible: ${pythonCheck.version}`);
            
            // Intentar instalar dependencias e iniciar API de Python
            const depsInstalled = await this.installPythonDependencies(pythonCheck.command);
            
            if (depsInstalled) {
                await this.startPythonAPI(pythonCheck.command);
            }
        } else {
            console.log('⚠️ Python no disponible, usando API de Node.js únicamente');
        }

        // 2. Siempre iniciar API de Node.js como respaldo
        await this.startNodeAPI();

        console.log('\n✅ Servicios de tipo de cambio iniciados');
        console.log('=' .repeat(45));
    }

    // Limpiar recursos al cerrar
    cleanup() {
        if (this.services.python) {
            this.services.python.kill();
            console.log('🐍 API de Python detenida');
        }
    }
}

module.exports = ServiceManager;
