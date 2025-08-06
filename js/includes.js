document.addEventListener("DOMContentLoaded", () => {
  includeHTML("navbar", "fragmentos/navbar.html", () => {
    initTipoCambioNavbar(() => {
      const loader = document.getElementById("loader-bg");
      if (loader) {
        loader.classList.add("hide");
        setTimeout(() => loader.remove(), 500);
      }
    });
  });
  includeHTML("footer", "fragmentos/footer.html");
});

// Hook para actualizar tipo de cambio al abrir el modal
let _originalMostrarModalConversion = typeof mostrarModalConversion === "function" ? mostrarModalConversion : null;
window.mostrarModalConversion = function() {
  if (_originalMostrarModalConversion) _originalMostrarModalConversion();
  actualizarTipoCambioModal();
};

/**
 * Obtiene y muestra el tipo de cambio CRC/USD y CRC/EUR usando open.er-api.com
 * Muestra ambos valores en el navbar con animación cíclica (fade).
 * Si hay error, muestra "No disponible".
 * Ejecuta solo cuando el navbar está cargado.
 */
function initTipoCambioNavbar(callback) {
  const tcDiv = document.getElementById("tipo-cambio-bccr");
  if (!tcDiv) {
    if (typeof callback === "function") callback();
    return;
  }

  // Asegura el span para el texto animado
  let span = tcDiv.querySelector(".tipo-cambio-text");
  if (!span) {
    span = document.createElement("span");
    span.className = "tipo-cambio-text";
    tcDiv.innerHTML = "";
    tcDiv.appendChild(span);
  }

  // Fetch tipo de cambio USD desde backend Flask
  fetch("http://localhost:5000/api/tipo-cambio-popular")
    .then(resp => {
      if (resp.ok) {
        return resp.json();
      } else {
        return Promise.reject(new Error("Respuesta no OK"));
      }
    })
    .then(data => {
      // data: { compra: float, venta: float }
      const compra = data && typeof data.compra === "number" ? data.compra : null;
      const venta = data && typeof data.venta === "number" ? data.venta : null;
      const valores = [];
      if (compra !== null) valores.push(`💵 USD Compra: ₡${compra}`);
      if (venta !== null) valores.push(`💵 USD Venta: ₡${venta}`);
      // Calcular y mostrar EUR Venta y EUR Compra siempre que exista al menos uno de los valores USD
      let eurVenta = null, eurCompra = null;
      if (venta !== null && !isNaN(venta)) {
        eurVenta = +(venta * 1.148).toFixed(2);
        valores.push(`💶 EUR Venta: ₡${eurVenta}`);
        console.log("[NAVBAR] USD Venta:", venta, "EUR Venta (calculado):", eurVenta);
      }
      if (compra !== null && !isNaN(compra)) {
        eurCompra = +(compra * 1.148).toFixed(2);
        valores.push(`💶 EUR Compra: ₡${eurCompra}`);
        console.log("[NAVBAR] USD Compra:", compra, "EUR Compra (calculado):", eurCompra);
      }
      if (eurVenta === null && eurCompra !== null) {
        valores.push(`💶 EUR Venta: --`);
        console.warn("[NAVBAR] EUR Venta no disponible, solo EUR Compra:", eurCompra);
      }
      if (eurCompra === null && eurVenta !== null) {
        valores.push(`💶 EUR Compra: --`);
        console.warn("[NAVBAR] EUR Compra no disponible, solo EUR Venta:", eurVenta);
      }
      if (valores.length === 0) throw new Error("No rates");
      let idx = 0;
      span.textContent = valores[0];
      setInterval(() => {
        span.classList.remove("fade-in");
        span.classList.add("fade-out");
        setTimeout(() => {
          idx = (idx + 1) % valores.length;
          span.textContent = valores[idx];
          span.classList.remove("fade-out");
          span.classList.add("fade-in");
        }, 500);
      }, 5000);
      if (typeof callback === "function") callback();
    })
    .catch(() => {
      tcDiv.innerHTML = "<span>No disponible</span>";
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
    // USD: usar Banco Popular (del backend)
    let ventaUSD = tcBancoPopular.venta;
    let compraUSD = tcBancoPopular.compra;

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
    tasasError.style.display = "flex";
    tasasError.innerHTML = `
      <span>
        Tipo de cambio USD y EUR no disponibles. No es posible realizar conversiones.
      </span>
    `;
  } else if (errorUSD) {
    tasasError.style.display = "flex";
    tasasError.innerHTML = `
      <span>
        Tipo de cambio USD no disponible. Puede usar la conversión solo para EUR.
      </span>
    `;
  } else if (errorEUR) {
    tasasError.style.display = "flex";
    tasasError.innerHTML = `
      <span>
        Tipo de cambio EUR no disponible. Puede usar la conversión solo para USD.
      </span>
    `;
  } else {
    tasasError.style.display = "none";
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

// El resto del código permanece igual
