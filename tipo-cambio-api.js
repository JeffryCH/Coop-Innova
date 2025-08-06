const axios = require('axios');
const cheerio = require('cheerio');

class TipoCambioAPI {
    constructor() {
        this.URL = "https://gee.bccr.fi.cr/IndicadoresEconomicos/Cuadros/frmConsultaTCVentanilla.aspx";
        this.BANCO_POPULAR = "Banco Popular y de Desarrollo Comunal";
    }

    async obtenerTipoCambio() {
        try {
            console.log('🏦 Obteniendo tipo de cambio del Banco Popular...');
            
            const response = await axios.get(this.URL, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const $ = cheerio.load(response.data);
            const tabla = $('#DG');
            
            if (!tabla.length) {
                throw new Error('No se encontró la tabla de datos en la página fuente');
            }

            let resultado = null;
            
            tabla.find('tr').each((index, fila) => {
                const celdas = $(fila).find('td');
                if (celdas.length >= 4) {
                    const bancoNombre = $(celdas[1]).text().trim().toLowerCase();
                    
                    if (bancoNombre.includes(this.BANCO_POPULAR.toLowerCase())) {
                        const compraTexto = $(celdas[2]).text().trim().replace(',', '');
                        const ventaTexto = $(celdas[3]).text().trim().replace(',', '');
                        
                        try {
                            // Corrige el formato dividiendo por 100 y redondeando a 2 decimales
                            const compra = Math.round(parseFloat(compraTexto) / 100 * 100) / 100;
                            const venta = Math.round(parseFloat(ventaTexto) / 100 * 100) / 100;
                            
                            resultado = {
                                success: true,
                                data: {
                                    compra: compra,
                                    venta: venta,
                                    banco: this.BANCO_POPULAR,
                                    fecha: new Date().toISOString(),
                                    timestamp: Date.now()
                                }
                            };
                            
                            console.log(`✅ Tipo de cambio obtenido - Compra: ₡${compra}, Venta: ₡${venta}`);
                            return false; // Salir del each
                        } catch (error) {
                            console.error('❌ Error al convertir valores numéricos:', error.message);
                        }
                    }
                }
            });

            if (!resultado) {
                throw new Error('No se encontró el Banco Popular en la tabla de tipos de cambio');
            }

            return resultado;
            
        } catch (error) {
            console.error('❌ Error al obtener tipo de cambio:', error.message);
            return {
                success: false,
                error: error.message,
                timestamp: Date.now()
            };
        }
    }

    // Método para obtener datos simulados si falla la conexión
    obtenerDatosSimulados() {
        const base = 520;
        const variacion = Math.random() * 10 - 5; // Variación de -5 a +5
        
        return {
            success: true,
            simulated: true,
            data: {
                compra: Math.round((base + variacion) * 100) / 100,
                venta: Math.round((base + variacion + 10) * 100) / 100,
                banco: this.BANCO_POPULAR,
                fecha: new Date().toISOString(),
                timestamp: Date.now()
            }
        };
    }

    // Método principal con fallback
    async obtenerTipoCambioConFallback() {
        try {
            const resultado = await this.obtenerTipoCambio();
            if (resultado.success) {
                return resultado;
            }
            
            console.log('⚠️ Usando datos simulados como respaldo...');
            return this.obtenerDatosSimulados();
            
        } catch (error) {
            console.log('⚠️ Error en conexión, usando datos simulados...');
            return this.obtenerDatosSimulados();
        }
    }
}

module.exports = TipoCambioAPI;
