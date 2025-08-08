// === Actualizar tipo de cambio en el navbar ===
async function actualizarTipoCambioNavbar() {
  try {
    const compraEl = document.getElementById('navbar-usd-compra');
    const ventaEl = document.getElementById('navbar-usd-venta');
    const eurCompraEl = document.getElementById('navbar-eur-compra');
    const eurVentaEl = document.getElementById('navbar-eur-venta');
    if (!compraEl || !ventaEl || !eurCompraEl || !eurVentaEl) return;

    const response = await fetch('/api/tipo-cambio');
    const apiResponse = await response.json();
    if (apiResponse.data && apiResponse.data.success && apiResponse.data.data) {
      const tipoCambioData = apiResponse.data.data;
      compraEl.textContent = `₡${tipoCambioData.compra.toFixed(0)}`;
      ventaEl.textContent = `₡${tipoCambioData.venta.toFixed(0)}`;
      // EUR calculado (USD + 2%)
      eurCompraEl.textContent = `₡${Math.round(tipoCambioData.compra * 1.02)}`;
      eurVentaEl.textContent = `₡${Math.round(tipoCambioData.venta * 1.02)}`;
      // Guardar en variable global para otros módulos
      window.tcBancoPopular = {
        compra: tipoCambioData.compra,
        venta: tipoCambioData.venta
      };
      // Disparar evento para otros componentes
      window.dispatchEvent(new CustomEvent('tipoCambioActualizado', { detail: window.tcBancoPopular }));
    } else {
      compraEl.textContent = ventaEl.textContent = eurCompraEl.textContent = eurVentaEl.textContent = '--';
    }
  } catch (e) {
    const compraEl = document.getElementById('navbar-usd-compra');
    const ventaEl = document.getElementById('navbar-usd-venta');
    const eurCompraEl = document.getElementById('navbar-eur-compra');
    const eurVentaEl = document.getElementById('navbar-eur-venta');
    if (compraEl) compraEl.textContent = '--';
    if (ventaEl) ventaEl.textContent = '--';
    if (eurCompraEl) eurCompraEl.textContent = '--';
    if (eurVentaEl) eurVentaEl.textContent = '--';
  }
}

// Ejecutar al cargar el navbar y cada 5 minutos
window.forzarActualizacionNavbar = function() {
  actualizarTipoCambioNavbar();
  setInterval(actualizarTipoCambioNavbar, 5 * 60 * 1000);
};
document.addEventListener("DOMContentLoaded", () => {
  console.log('🚀 [INCLUDES] Iniciando carga de fragmentos...');
  
  includeHTML("navbar", "fragmentos/navbar.html", () => {
    console.log('✅ [INCLUDES] Navbar cargado, inicializando...');
    
    // Esperar a que los scripts se ejecuten completamente
    setTimeout(() => {
      const loader = document.getElementById("loader-bg");
      if (loader) {
        loader.classList.add("hide");
        setTimeout(() => loader.remove(), 500);
      }
      
      // Verificar múltiples veces si la función está disponible
      let intentos = 0;
      const verificarFuncion = () => {
        intentos++;
        console.log(`🔍 [INCLUDES] Intento ${intentos} - Verificando función navbar...`);
        
        if (typeof window.forzarActualizacionNavbar === 'function') {
          console.log('🎯 [INCLUDES] ✅ Función encontrada, ejecutando actualización inicial...');
          window.forzarActualizacionNavbar();
        } else if (intentos < 10) {
          console.warn(`⚠️ [INCLUDES] Función no disponible aún, reintentando en 500ms... (${intentos}/10)`);
          setTimeout(verificarFuncion, 500);
        } else {
          console.error('❌ [INCLUDES] Función de navbar no disponible después de 10 intentos');
        }
      };
      
      verificarFuncion();
    }, 2000);
  });
  
  includeHTML("footer", "fragmentos/footer.html", () => {
    console.log('✅ [INCLUDES] Footer cargado');
  });
  
  includeHTML("modal-conversion-container", "fragmentos/modal-conversion.html", () => {
    console.log('✅ [INCLUDES] Modal de conversión cargado');
  });
});

function includeHTML(elementId, filePath, callback) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`❌ Elemento con ID '${elementId}' no encontrado`);
    if (typeof callback === "function") callback();
    return;
  }

  console.log(`📄 Cargando ${filePath}...`);

  fetch(filePath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      element.innerHTML = html;
      
      console.log(`📄 Contenido HTML insertado para ${elementId}`);
      
      // Ejecutar scripts contenidos en el HTML después de un delay
      setTimeout(() => {
        const scripts = element.querySelectorAll('script');
        console.log(`🔧 Procesando ${scripts.length} scripts en ${elementId}`);
        
        scripts.forEach((script, index) => {
          try {
            const newScript = document.createElement('script');
            
            // Copiar atributos
            Array.from(script.attributes).forEach(attr => {
              newScript.setAttribute(attr.name, attr.value);
            });
            
            if (script.src) {
              newScript.src = script.src;
              console.log(`📤 Script externo ${index + 1} agregado: ${script.src}`);
            } else {
              newScript.textContent = script.textContent;
              console.log(`📝 Script inline ${index + 1} agregado (${script.textContent.length} chars)`);
            }
            
            // Agregar al head y ejecutar
            document.head.appendChild(newScript);
            
            // Remover el script inline después de ejecutarlo
            if (!script.src) {
              setTimeout(() => {
                try {
                  document.head.removeChild(newScript);
                } catch (e) {
                  // Ignorar errores de remoción
                }
              }, 100);
            }
            
          } catch (error) {
            console.error(`❌ Error ejecutando script ${index + 1} para ${elementId}:`, error);
          }
        });
        
        console.log(`✅ Scripts procesados para ${elementId}`);
        
        if (typeof callback === "function") {
          setTimeout(callback, 200);
        }
      }, 200);
    })
    .catch(error => {
      console.error(`❌ Error al cargar ${filePath}:`, error);
      element.innerHTML = `<p>Error al cargar contenido</p>`;
      if (typeof callback === "function") callback();
    });
}



/**
 * Incluye un fragmento HTML en el elemento con id dado.
 * Si se pasa un callback, lo ejecuta tras insertar el HTML.
 */
function includeHTML(id, file, callback) {
  const element = document.getElementById(id);
  if (element) {
    fetch(file)
      .then(response => response.text())
      .then(data => {
        element.innerHTML = data;
        if (typeof callback === "function") callback();
      })
      .catch(error => console.error('Error al incluir:', file, error));
  }
}

// === Modal Conversión de Monedas ===
function cargarModalConversion(callback) {
  fetch("fragmentos/modal-conversion.html")
    .then(resp => resp.text())
    .then(html => {
      let modalDiv = document.createElement("div");
      modalDiv.innerHTML = html;
      document.body.appendChild(modalDiv.firstElementChild);
      if (typeof callback === "function") callback();
      // Llamar setupConversionForm y actualizarTipoCambioModal después de cargar el modal
      setTimeout(() => {
        setupConversionForm();
        actualizarTipoCambioModal();
      }, 200);
    });
}

function mostrarModalConversion() {
  actualizarTipoCambioModal();
  const modal = document.getElementById('modal-conversion');
  if (!modal) return;
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  // Centrar el modal y ajustar el fondo
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  // Focus en el input al abrir
  setTimeout(() => {
    const input = document.getElementById('cantidad-origen');
    if (input) input.focus();
  }, 100);
}

function cerrarModalConversion() {
  const modal = document.getElementById("modal-conversion");
  if (!modal) return;
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// Inicialización al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  cargarModalConversion(() => {
    const tcDiv = document.getElementById("tipo-cambio-bccr");
    if (tcDiv) {
      tcDiv.style.cursor = "pointer";
      tcDiv.title = "Abrir conversor de monedas";
      tcDiv.addEventListener("click", window.mostrarModalConversion);
    }
    // Cierre por botón
    const modal = document.getElementById("modal-conversion");
    if (modal) {
      modal.addEventListener("click", e => {
        if (e.target === modal) cerrarModalConversion();
      });
      const closeBtn = modal.querySelector(".modal-conversion-close");
      if (closeBtn) closeBtn.addEventListener("click", cerrarModalConversion);
      // Cierre por ESC
      document.addEventListener("keydown", e => {
        if (e.key === "Escape" && modal.style.display === "flex") cerrarModalConversion();
      });
    }
  });
});

// === Lógica de Conversión de Monedas ===
let tipoCambioActual = { USD: null, EUR: null }; // CRC por 1 USD/EUR
let tipoCambioCompra = { USD: null, EUR: null }; // CRC por 1 USD/EUR con comisión
let comisionCompra = 2; // % por defecto

// Solo se usan tasas obtenidas desde la API oficial, no scraping ni manual.
let tcBancoPopular = { compra: null, venta: null };



/**
 * Lógica del formulario de conversión, ahora usando tipo de cambio Banco Popular (scraping) o manual.
 */
async function setupConversionForm() {
  const modal = document.getElementById("modal-conversion");
  if (!modal) return;
  const form = modal.querySelector("#conversion-form");
  const amountInput = modal.querySelector("#conversion-amount");
  const fromSel = modal.querySelector("#conversion-from");
  const toSel = modal.querySelector("#conversion-to");
  const swapBtn = modal.querySelector("#conversion-swap");
  const resultDiv = modal.querySelector("#conversion-result");
  const errorDiv = modal.querySelector("#conversion-error");
  const tasasBox = modal.querySelector("#conversion-tasas");
  const tasaUSDVenta = modal.querySelector("#tasa-usd-venta");
  const tasaUSDCompra = modal.querySelector("#tasa-usd-compra");
  const tasaEURVenta = modal.querySelector("#tasa-eur-venta");
  const tasaEURCompra = modal.querySelector("#tasa-eur-compra");
  const tasasError = modal.querySelector("#conversion-tasas-error");



  // Función para actualizar tasas visuales y cálculo de compra
  function actualizarTasas() {
    if (!tasaUSDVenta || !tasaUSDCompra || !tasaEURVenta || !tasaEURCompra) return;
    
    // Intentar usar datos del navbar si están disponibles
    let ventaUSD, compraUSD;
    
    if (window.tcBancoPopular && window.tcBancoPopular.venta && window.tcBancoPopular.compra) {
      ventaUSD = window.tcBancoPopular.venta;
      compraUSD = window.tcBancoPopular.compra;
      console.log('📊 [MODAL] Usando datos del navbar:', { compraUSD, ventaUSD });
    } else {
      // Fallback a variables originales
      ventaUSD = (typeof tcBancoPopular !== 'undefined') ? tcBancoPopular.venta : null;
      compraUSD = (typeof tcBancoPopular !== 'undefined') ? tcBancoPopular.compra : null;
      console.log('📊 [MODAL] Usando datos locales:', { compraUSD, ventaUSD });
    }

    // Venta USD: lo que el banco vende (lo que paga el usuario por 1 USD)
    if (typeof ventaUSD === "number" && ventaUSD > 0) {
      tasaUSDVenta.textContent = `₡${ventaUSD.toLocaleString(undefined, {maximumFractionDigits:2})}`;
      tipoCambioActual.USD = ventaUSD;
    } else {
      tasaUSDVenta.textContent = "--";
      tipoCambioActual.USD = null;
    }
    // Compra USD: lo que el banco compra (lo que recibe el usuario por 1 USD)
    if (typeof compraUSD === "number" && compraUSD > 0) {
      tipoCambioCompra.USD = compraUSD;
      tasaUSDCompra.textContent = `₡${compraUSD.toLocaleString(undefined, {maximumFractionDigits:2})}`;
    } else {
      tasaUSDCompra.textContent = "--";
      tipoCambioCompra.USD = null;
    }

    // EUR: calcular venta y compra a partir de USD usando factor fijo (1.148)
    let ventaEUR = null;
    let compraEUR = null;
    if (typeof tipoCambioActual.USD === "number" && tipoCambioActual.USD > 0) {
      ventaEUR = +(tipoCambioActual.USD * 1.148).toFixed(2);
      tipoCambioActual.EUR = ventaEUR;
    } else {
      tipoCambioActual.EUR = null;
    }
    if (typeof tipoCambioCompra.USD === "number" && tipoCambioCompra.USD > 0) {
      compraEUR = +(tipoCambioCompra.USD * 1.148).toFixed(2);
      tipoCambioCompra.EUR = compraEUR;
    } else {
      tipoCambioCompra.EUR = null;
    }

    if (typeof ventaEUR === "number" && ventaEUR > 0) {
      tasaEURVenta.textContent = `₡${ventaEUR.toLocaleString(undefined, {maximumFractionDigits:2})}`;
    } else {
      tasaEURVenta.textContent = "--";
    }
    if (typeof compraEUR === "number" && compraEUR > 0) {
      tasaEURCompra.textContent = `₡${compraEUR.toLocaleString(undefined, {maximumFractionDigits:2})}`;
    } else {
      tasaEURCompra.textContent = "--";
    }
  }

 // Función para calcular y mostrar el resultado dinámicamente
 function mostrarConversionDinamica() {
   resultDiv.textContent = "";
   errorDiv.textContent = "";

   const amount = parseFloat(amountInput.value.replace(",", "."));
   const from = fromSel.value;
   const to = toSel.value;

   // Validar cantidad y monedas
   if (isNaN(amount) || amount <= 0) return;
   if (from === to) {
     errorDiv.textContent = "Seleccione monedas diferentes.";
     return;
   }

   function tasaVenta(moneda) {
     if (moneda === "USD") return tipoCambioActual.USD;
     if (moneda === "EUR") return tipoCambioActual.EUR;
     return null;
   }
   function tasaCompra(moneda) {
     if (moneda === "USD") return tipoCambioCompra.USD;
     if (moneda === "EUR") return tipoCambioCompra.EUR;
     return null;
   }

   if ((from === "USD" || to === "USD") && !tipoCambioActual.USD) {
     errorDiv.textContent = "Tipo de cambio USD no disponible.";
     return;
   }
   if ((from === "EUR" || to === "EUR") && !tipoCambioActual.EUR) {
     errorDiv.textContent = "Tipo de cambio EUR no disponible.";
     return;
   }

   let resultado = null;
   // CRC -> USD/EUR (compra, aplica comisión)
   if (from === "CRC" && to === "USD") resultado = amount / tasaCompra("USD");
   else if (from === "CRC" && to === "EUR") resultado = amount / tasaCompra("EUR");
   // USD/EUR -> CRC (venta, sin comisión)
   else if (from === "USD" && to === "CRC") resultado = amount * tasaVenta("USD");
   else if (from === "EUR" && to === "CRC") resultado = amount * tasaVenta("EUR");
   // USD <-> EUR (ambas conversiones usan venta para salida, compra para entrada)
   else if (from === "USD" && to === "EUR") resultado = (amount * tasaVenta("USD")) / tasaCompra("EUR");
   else if (from === "EUR" && to === "USD") resultado = (amount * tasaVenta("EUR")) / tasaCompra("USD");

   if (resultado !== null) {
     // Mostrar equivalencia entre las tres monedas
     let crc, usd, eur;
     if (from === "CRC") {
       crc = amount;
       usd = amount / tasaCompra("USD");
       eur = amount / tasaCompra("EUR");
     } else if (from === "USD") {
       usd = amount;
       crc = amount * tasaVenta("USD");
       eur = (amount * tasaVenta("USD")) / tasaCompra("EUR");
     } else if (from === "EUR") {
       eur = amount;
       crc = amount * tasaVenta("EUR");
       usd = (amount * tasaVenta("EUR")) / tasaCompra("USD");
     }
     resultDiv.innerHTML = `
       <div class="conversion-resultado-claro">
         <strong>${amount.toLocaleString(undefined, {maximumFractionDigits:2})} ${from}</strong> equivale a:<br>
         <span>₡${crc.toLocaleString(undefined, {maximumFractionDigits:2})} CRC</span> &nbsp; | &nbsp;
         <span>$${usd.toLocaleString(undefined, {maximumFractionDigits:2})} USD</span> &nbsp; | &nbsp;
         <span>€${eur.toLocaleString(undefined, {maximumFractionDigits:2})} EUR</span>
       </div>
     `;
   } else {
     errorDiv.textContent = "Conversión no soportada.";
   }
 }

 // Limpiar resultado y error al cambiar monedas o monto, y mostrar conversión dinámica
 [fromSel, toSel, amountInput].forEach(el => {
   if (el) {
     el.addEventListener("input", mostrarConversionDinamica);
   }
 });

  // Mostrar tasas visuales iniciales
  actualizarTasas();

  // Mostrar errores solo para la moneda faltante
  let errorUSD = !tipoCambioActual.USD;
  let errorEUR = !tipoCambioActual.EUR;

  // Si EUR fue calculado a partir de USD, no mostrar error
  if (
    typeof tipoCambioActual.USD === "number" &&
    tipoCambioActual.USD > 0 &&
    typeof tipoCambioActual.EUR === "number" &&
    tipoCambioActual.EUR > 0
  ) {
    errorEUR = false;
  } else if (
    typeof tipoCambioActual.USD === "number" &&
    tipoCambioActual.USD > 0 &&
    (typeof tipoCambioActual.EUR !== "number" || tipoCambioActual.EUR <= 0)
  ) {
    // Si no hay EUR pero sí USD, calcular EUR y no mostrar error
    tipoCambioActual.EUR = +(tipoCambioActual.USD * 1.1428).toFixed(2);
    errorEUR = false;
  }

  if (errorUSD && errorEUR) {
    if (tasasError) {
      tasasError.style.display = "flex";
      tasasError.innerHTML = `
        <span>
          Tipo de cambio USD y EUR no disponibles. No es posible realizar conversiones.
        </span>
      `;
    }
  } else if (errorUSD) {
    if (tasasError) {
      tasasError.style.display = "flex";
      tasasError.innerHTML = `
        <span>
          Tipo de cambio USD no disponible. Puede usar la conversión solo para EUR.
        </span>
      `;
    }
  } else if (errorEUR) {
    if (tasasError) {
      tasasError.style.display = "flex";
      tasasError.innerHTML = `
        <span>
          Tipo de cambio EUR no disponible. Puede usar la conversión solo para USD.
        </span>
      `;
    }
  } else {
    if (tasasError) {
      tasasError.style.display = "none";
    }
  }

  // Habilitar/deshabilitar opciones según disponibilidad
  function actualizarDisponibilidad() {
    // USD
    [...form.querySelectorAll('option[value="USD"]')].forEach(opt => {
      opt.disabled = errorUSD;
    });
    // EUR
    [...form.querySelectorAll('option[value="EUR"]')].forEach(opt => {
      opt.disabled = errorEUR;
    });
    // Si ambas faltan, deshabilitar todo
    if (errorUSD && errorEUR) {
      form.querySelectorAll("input, select, button").forEach(el => {
        el.disabled = true;
        if (el.type === "submit") el.classList.add("btn-servicio-disabled");
      });
    } else {
      form.querySelectorAll("input, select, button").forEach(el => {
        el.disabled = false;
        if (el.type === "submit") el.classList.remove("btn-servicio-disabled");
      });
    }
  }
  actualizarDisponibilidad();

  // Invertir monedas
  swapBtn.addEventListener("click", () => {
    const tmp = fromSel.value;
    fromSel.value = toSel.value;
    toSel.value = tmp;
    resultDiv.textContent = "";
    errorDiv.textContent = "";
    amountInput.focus();
  });

  // Validar y convertir
  form.addEventListener("submit", e => {
    e.preventDefault();
    resultDiv.textContent = "";
    errorDiv.textContent = "";

    const amount = parseFloat(amountInput.value.replace(",", "."));
    const from = fromSel.value;
    const to = toSel.value;

    // Validar cantidad
    if (isNaN(amount) || amount <= 0) {
      errorDiv.textContent = "Ingrese una cantidad válida.";
      return;
    }
    if (from === to) {
      errorDiv.textContent = "Seleccione monedas diferentes.";
      return;
    }

    // Validar disponibilidad de tasas para las monedas seleccionadas
    function tasaVenta(moneda) {
      if (moneda === "USD") return tipoCambioActual.USD;
      if (moneda === "EUR") return tipoCambioActual.EUR;
      return null;
    }
    function tasaCompra(moneda) {
      if (moneda === "USD") return tipoCambioCompra.USD;
      if (moneda === "EUR") return tipoCambioCompra.EUR;
      return null;
    }

    // Si alguna moneda seleccionada no tiene tasa, error solo para esa conversión
    if ((from === "USD" || to === "USD") && !tipoCambioActual.USD) {
      errorDiv.textContent = "Tipo de cambio USD no disponible.";
      return;
    }
    if ((from === "EUR" || to === "EUR") && !tipoCambioActual.EUR) {
      errorDiv.textContent = "Tipo de cambio EUR no disponible.";
      return;
    }

    let resultado = null;
    // CRC -> USD/EUR (compra, aplica comisión)
    if (from === "CRC" && to === "USD") resultado = amount / tasaCompra("USD");
    else if (from === "CRC" && to === "EUR") resultado = amount / tasaCompra("EUR");
    // USD/EUR -> CRC (venta, sin comisión)
    else if (from === "USD" && to === "CRC") resultado = amount * tasaVenta("USD");
    else if (from === "EUR" && to === "CRC") resultado = amount * tasaVenta("EUR");
    // USD <-> EUR (ambas conversiones usan venta para salida, compra para entrada)
    else if (from === "USD" && to === "EUR") resultado = (amount * tasaVenta("USD")) / tasaCompra("EUR");
    else if (from === "EUR" && to === "USD") resultado = (amount * tasaVenta("EUR")) / tasaCompra("USD");

    if (resultado !== null) {
      resultDiv.textContent = `${amount.toLocaleString(undefined, {maximumFractionDigits:2})} ${from} ≈ ${resultado.toLocaleString(undefined, {maximumFractionDigits:2})} ${to}`;
    } else {
      errorDiv.textContent = "Conversión no soportada.";
    }
  });

  // Escuchar actualizaciones del navbar
  window.addEventListener('tipoCambioActualizado', function(event) {
    console.log('🔄 [MODAL] Recibiendo actualización del navbar:', event.detail);
    actualizarTasas();
  });
}

function actualizarConversionesRapidas() {
  const quickUSD = document.getElementById('quick-100usd');
  const quickEUR = document.getElementById('quick-100eur');
  const quickCRC = document.getElementById('quick-100000crc');
  const usdVenta = parseFloat(document.getElementById('modal-usd-venta')?.textContent.replace(/[^\d.]/g, ''));
  const eurVenta = parseFloat(document.getElementById('modal-eur-venta')?.textContent.replace(/[^\d.]/g, ''));
  const usdCompra = parseFloat(document.getElementById('modal-usd-compra')?.textContent.replace(/[^\d.]/g, ''));

  if (quickUSD && usdVenta > 0) {
    quickUSD.textContent = `₡${(100 * usdVenta).toLocaleString()}`;
  } else if (quickUSD) {
    quickUSD.textContent = '--';
  }
  if (quickEUR && eurVenta > 0) {
    quickEUR.textContent = `₡${(100 * eurVenta).toLocaleString()}`;
  } else if (quickEUR) {
    quickEUR.textContent = '--';
  }
  if (quickCRC && usdCompra > 0) {
    quickCRC.textContent = `$${(100000 / usdCompra).toFixed(2)}`;
  } else if (quickCRC) {
    quickCRC.textContent = '--';
  }
}

// Llamar a actualizarConversionesRapidas cada vez que se actualiza el tipo de cambio en el modal
async function actualizarTipoCambioModal() {
  try {
    const compraEl = document.getElementById('modal-usd-compra');
    const ventaEl = document.getElementById('modal-usd-venta');
    const eurCompraEl = document.getElementById('modal-eur-compra');
    const eurVentaEl = document.getElementById('modal-eur-venta');
    const ultimaEl = document.getElementById('ultima-actualizacion');
    if (!compraEl || !ventaEl || !eurCompraEl || !eurVentaEl || !ultimaEl) return;

    const response = await fetch('/api/tipo-cambio');
    const apiResponse = await response.json();
    if (apiResponse.data && apiResponse.data.success && apiResponse.data.data) {
      const tipoCambioData = apiResponse.data.data;
      compraEl.textContent = `₡${tipoCambioData.compra.toLocaleString()}`;
      ventaEl.textContent = `₡${tipoCambioData.venta.toLocaleString()}`;
      eurCompraEl.textContent = `₡${Math.round(tipoCambioData.compra * 1.02).toLocaleString()}`;
      eurVentaEl.textContent = `₡${Math.round(tipoCambioData.venta * 1.02).toLocaleString()}`;
      ultimaEl.textContent = new Date().toLocaleString();
      actualizarConversionesRapidas();
    } else {
      compraEl.textContent = ventaEl.textContent = eurCompraEl.textContent = eurVentaEl.textContent = '--';
      ultimaEl.textContent = '--';
      actualizarConversionesRapidas();
    }
  } catch (e) {
    const compraEl = document.getElementById('modal-usd-compra');
    const ventaEl = document.getElementById('modal-usd-venta');
    const eurCompraEl = document.getElementById('modal-eur-compra');
    const eurVentaEl = document.getElementById('modal-eur-venta');
    const ultimaEl = document.getElementById('ultima-actualizacion');
    if (compraEl) compraEl.textContent = '--';
    if (ventaEl) ventaEl.textContent = '--';
    if (eurCompraEl) eurCompraEl.textContent = '--';
    if (eurVentaEl) eurVentaEl.textContent = '--';
    if (ultimaEl) ultimaEl.textContent = '--';
    actualizarConversionesRapidas();
  }
}

// Utilidades de sesión/auth
window.Auth = {
  estado: { loggedIn: false, user: null },
  async cargarEstado() {
    try {
      const res = await fetch('php/session.php', { credentials: 'include' });
      const data = await res.json();
      this.estado = data;
      return data;
    } catch (e) { return { loggedIn: false }; }
  },
  async logout() {
    try {
      const res = await fetch('php/logout.php', { method: 'POST', credentials: 'include' });
      return await res.json();
    } catch (e) { return { success: false }; }
  }
};

// Enriquecer navbar con estado de sesión una vez cargado
(function enhanceNavbarWithAuth(){
  const render = (user) => {
    const menu = document.querySelector('#menu .navbar-nav');
    if (!menu) return;
    // Remover previos
    const prev = menu.querySelectorAll('[data-auth-item]');
    prev.forEach(n => n.remove());

    if (user) {
      const liUser = document.createElement('li');
      liUser.className = 'nav-item dropdown';
      liUser.setAttribute('data-auth-item','');
      liUser.innerHTML = `
        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">👋 ${user.nombre} (${user.rol})</a>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="ver_perfil.html">Perfil</a></li>
          <li><a class="dropdown-item" href="movimientos.html">Mis movimientos</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a id="btn-logout" class="dropdown-item" href="#">Cerrar sesión</a></li>
        </ul>`;
      menu.appendChild(liUser);

      const btnLogout = liUser.querySelector('#btn-logout');
      btnLogout?.addEventListener('click', async (e) => {
        e.preventDefault();
        const resp = await Auth.logout();
        if (resp.success) {
          location.href = 'index.html';
        }
      });
    } else {
      const liLogin = document.createElement('li');
      liLogin.className = 'nav-item';
      liLogin.setAttribute('data-auth-item','');
      liLogin.innerHTML = '<a class="nav-link" href="login.html">Iniciar sesión</a>';
      menu.appendChild(liLogin);
    }
  };

  // Esperar a que el navbar se cargue
  const tryInit = async () => {
    const menu = document.querySelector('#menu .navbar-nav');
    if (!menu) { setTimeout(tryInit, 300); return; }
    const estado = await Auth.cargarEstado();
    render(estado.loggedIn ? estado.user : null);
  };
  tryInit();
})();

function abrirConversor() {
  // Siempre intentar cargar el modal antes de mostrarlo
  if (typeof cargarModalConversion === 'function') {
    cargarModalConversion(() => {
      if (typeof mostrarModalConversion === 'function') {
        mostrarModalConversion();
      } else {
        window.location.href = 'tipo-cambio.html';
      }
    });
  } else {
    window.location.href = 'tipo-cambio.html';
  }
}

// Función para realizar la conversión de monedas en el modal
function realizarConversion() {
  const cantidadOrigen = parseFloat(document.getElementById('cantidad-origen').value);
  const monedaOrigen = document.getElementById('moneda-origen').value;
  const monedaDestino = document.getElementById('moneda-destino').value;
  const cantidadDestinoEl = document.getElementById('cantidad-destino');
  const resultadoDiv = document.getElementById('resultado-conversion');
  const detalleDiv = document.getElementById('detalle-conversion');

  if (!cantidadOrigen || cantidadOrigen <= 0) {
    cantidadDestinoEl.value = '';
    resultadoDiv.style.display = 'none';
    return;
  }
  if (monedaOrigen === monedaDestino) {
    cantidadDestinoEl.value = cantidadOrigen.toFixed(2);
    mostrarDetalleConversion(cantidadOrigen, monedaOrigen, cantidadOrigen, monedaDestino, 1, 'Sin conversión');
    return;
  }

  // Obtener tasas
  const usdCompra = parseFloat(document.getElementById('modal-usd-compra').textContent.replace(/[^\d.]/g, ''));
  const usdVenta = parseFloat(document.getElementById('modal-usd-venta').textContent.replace(/[^\d.]/g, ''));
  const eurCompra = parseFloat(document.getElementById('modal-eur-compra').textContent.replace(/[^\d.]/g, ''));
  const eurVenta = parseFloat(document.getElementById('modal-eur-venta').textContent.replace(/[^\d.]/g, ''));

  let resultado = 0;
  let tasa = 0;
  let tipoOperacion = '';

  // CRC a USD/EUR (se usa venta)
  if (monedaOrigen === 'CRC') {
    if (monedaDestino === 'USD') {
      tasa = usdVenta;
      resultado = cantidadOrigen / tasa;
      tipoOperacion = 'CRC→USD (Venta)';
    } else if (monedaDestino === 'EUR') {
      tasa = eurVenta;
      resultado = cantidadOrigen / tasa;
      tipoOperacion = 'CRC→EUR (Venta)';
    }
  }
  // USD/EUR a CRC (se usa compra)
  else if (monedaDestino === 'CRC') {
    if (monedaOrigen === 'USD') {
      tasa = usdCompra;
      resultado = cantidadOrigen * tasa;
      tipoOperacion = 'USD→CRC (Compra)';
    } else if (monedaOrigen === 'EUR') {
      tasa = eurCompra;
      resultado = cantidadOrigen * tasa;
      tipoOperacion = 'EUR→CRC (Compra)';
    }
  }
  // USD a EUR y viceversa (vía CRC)
  else if (monedaOrigen === 'USD' && monedaDestino === 'EUR') {
    // USD→CRC (compra), CRC→EUR (venta)
    const colones = cantidadOrigen * usdCompra;
    tasa = eurVenta;
    resultado = colones / tasa;
    tipoOperacion = 'USD→CRC (Compra)→EUR (Venta)';
  } else if (monedaOrigen === 'EUR' && monedaDestino === 'USD') {
    // EUR→CRC (compra), CRC→USD (venta)
    const colones = cantidadOrigen * eurCompra;
    tasa = usdVenta;
    resultado = colones / tasa;
    tipoOperacion = 'EUR→CRC (Compra)→USD (Venta)';
  }

  cantidadDestinoEl.value = resultado.toFixed(2);
  mostrarDetalleConversion(cantidadOrigen, monedaOrigen, resultado, monedaDestino, tasa, tipoOperacion);
}

// Función para mostrar el detalle de la conversión
function mostrarDetalleConversion(origen, monedaOrigen, destino, monedaDestino, tasa, operacion) {
  const simbolos = { CRC: '₡', USD: '$', EUR: '€' };
  let detalle = `<strong>${simbolos[monedaOrigen]}${origen.toLocaleString()} ${monedaOrigen}</strong> = <strong class="text-primary">${simbolos[monedaDestino]}${destino.toLocaleString()} ${monedaDestino}</strong>`;
  if (operacion && tasa) {
    detalle += `<br><small class="text-muted">Operación: ${operacion} | Tasa: ₡${tasa.toLocaleString()}</small>`;
  }
  document.getElementById('detalle-conversion').innerHTML = detalle;
  document.getElementById('resultado-conversion').style.display = 'block';
}

// Función para intercambiar monedas en el modal
function intercambiarMonedas() {
  const origenSelect = document.getElementById('moneda-origen');
  const destinoSelect = document.getElementById('moneda-destino');
  const temp = origenSelect.value;
  origenSelect.value = destinoSelect.value;
  destinoSelect.value = temp;
  // Intercambiar cantidades si hay valores
  const cantidadOrigen = document.getElementById('cantidad-origen').value;
  const cantidadDestino = document.getElementById('cantidad-destino').value;
  if (cantidadDestino) {
    document.getElementById('cantidad-origen').value = cantidadDestino;
    document.getElementById('cantidad-destino').value = '';
    realizarConversion();
  } else {
    realizarConversion();
  }
}

// Función para limpiar los campos del modal
function limpiarConversion() {
  document.getElementById('cantidad-origen').value = '';
  document.getElementById('cantidad-destino').value = '';
  document.getElementById('resultado-conversion').style.display = 'none';
}

// Listeners para conversión automática
if (document.getElementById('cantidad-origen')) {
  document.getElementById('cantidad-origen').addEventListener('input', realizarConversion);
}
if (document.getElementById('moneda-origen')) {
  document.getElementById('moneda-origen').addEventListener('change', realizarConversion);
}
if (document.getElementById('moneda-destino')) {
  document.getElementById('moneda-destino').addEventListener('change', realizarConversion);
}
