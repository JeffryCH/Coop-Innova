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
  const modal = document.getElementById("modal-conversion");
  if (!modal) return;
  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");
  // Focus en el input al abrir
  setTimeout(() => {
    const input = modal.querySelector("#conversion-amount");
    if (input) input.focus();
  }, 100);
  // Bloquear scroll fondo
  document.body.style.overflow = "hidden";
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

/**
 * Actualiza los elementos de tipo de cambio en el modal de conversión.
 * Llama al endpoint y muestra los valores o error.
 */

function actualizarTipoCambioModal() {
  const ventaEl = document.getElementById("tasa-usd-venta");
  const compraEl = document.getElementById("tasa-usd-compra");
  const ventaEUREl = document.getElementById("tasa-eur-venta");
  const compraEUREl = document.getElementById("tasa-eur-compra");
  if (!ventaEl || !compraEl || !ventaEUREl || !compraEUREl) return;

  ventaEl.textContent = "Cargando...";
  compraEl.textContent = "Cargando...";
  ventaEUREl.textContent = "Cargando...";
  compraEUREl.textContent = "Cargando...";

  fetch("http://localhost:5000/api/tipo-cambio-popular")
    .then(resp => resp.ok ? resp.json() : Promise.reject())
    .then(data => {
      // Guardar en tcBancoPopular para que actualizarTasas() use los valores correctos
      tcBancoPopular.compra = (data && typeof data.compra === "number") ? data.compra : null;
      tcBancoPopular.venta = (data && typeof data.venta === "number") ? data.venta : null;

      // Llamar a setupConversionForm solo si no se ha llamado antes
      if (typeof setupConversionForm === "function") {
        setupConversionForm();
      }
      // Llamar a actualizarTasas para refrescar los valores visuales
      if (typeof actualizarTasas === "function") {
        actualizarTasas();
      }
    })
    .catch(() => {
      ventaEl.textContent = "Error";
      compraEl.textContent = "Error";
      ventaEUREl.textContent = "Error";
      compraEUREl.textContent = "Error";
      tcBancoPopular.compra = null;
      tcBancoPopular.venta = null;
    });
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
