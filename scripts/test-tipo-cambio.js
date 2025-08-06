const TipoCambioAPI = require('../tipo-cambio-api');

async function testTipoCambioAPI() {
    console.log('🧪 PRUEBA DE API DE TIPO DE CAMBIO');
    console.log('=' .repeat(40));
    
    try {
        const api = new TipoCambioAPI();
        
        console.log('📡 Obteniendo tipo de cambio del BCCR...');
        const resultado = await api.obtenerTipoCambioConFallback();
        
        if (resultado.success) {
            console.log('✅ API funcionando correctamente');
            console.log('\n📊 Datos obtenidos:');
            console.log(`   💰 Compra: ₡${resultado.data.compra}`);
            console.log(`   💰 Venta: ₡${resultado.data.venta}`);
            console.log(`   🏦 Banco: ${resultado.data.banco}`);
            console.log(`   📅 Fecha: ${new Date(resultado.data.fecha).toLocaleString()}`);
            
            if (resultado.simulated) {
                console.log('⚠️ Datos simulados (conexión al BCCR falló)');
            } else {
                console.log('🌐 Datos obtenidos directamente del BCCR');
            }
        } else {
            console.log('❌ Error en la API:', resultado.error);
        }
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
    }
}

// Ejecutar prueba si se llama directamente
if (require.main === module) {
    testTipoCambioAPI().then(() => {
        process.exit(0);
    });
}

module.exports = testTipoCambioAPI;
