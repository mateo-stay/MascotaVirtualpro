/**
 * Arduinito Tamagotchi-Pro
 * - Hambre, Sed, Alegría, Limpieza, Salud
 * - Ciclo Automático de deterioro
 * - Botones: Alimentar, Agua, Jugar, Limpiar, Dormir
 * - Evolución según edad
 * - Día/Noche cambia background
 * - Persistencia con localStorage
 */

(() => {
  // Intervalos (en milisegundos)
  const INTERVALO_CICLO = 10000;   // cada 10 segundos
  const INTERVALO_EDAD = 1000;     // cada 1 segundo

  // Referencias al DOM
  const imgMascota    = document.getElementById("img-mascota");
  const txtEdad       = document.getElementById("texto-edad");

  const barHambre     = document.getElementById("bar-hambre");
  const barSed        = document.getElementById("bar-sed");
  const barAlegria    = document.getElementById("bar-alegria");
  const barLimpieza   = document.getElementById("bar-limpieza");
  const barSalud      = document.getElementById("bar-salud");

  const txtHambre     = document.getElementById("txt-hambre");
  const txtSed        = document.getElementById("txt-sed");
  const txtAlegria    = document.getElementById("txt-alegria");
  const txtLimpieza   = document.getElementById("txt-limpieza");
  const txtSalud      = document.getElementById("txt-salud");

  const btnAlimentar  = document.getElementById("btn-alimentar");
  const btnAgua       = document.getElementById("btn-agua");
  const btnJugar      = document.getElementById("btn-jugar");
  const btnLimpiar    = document.getElementById("btn-limpiar");
  const btnDormir     = document.getElementById("btn-dormir");

  // Estado guardado en localStorage
  let estado = {
    hambre:    100,
    sed:       100,
    alegria:   100,
    limpieza:  100,
    salud:     100,
    creacion:  null // timestamp de creación
  };

  // Cargar del localStorage (o inicializar)
  function cargarEstado() {
    const guardado = localStorage.getItem("arduinito-estado");
    if (guardado) {
      estado = JSON.parse(guardado);
    } else {
      estado.creacion = Date.now();
      localStorage.setItem("arduinito-estado", JSON.stringify(estado));
    }
  }

  // Guardar en localStorage
  function guardarEstado() {
    localStorage.setItem("arduinito-estado", JSON.stringify(estado));
  }

  // Actualizar fondo Día/Noche
  function actualizarDiaNoche() {
    const hora = new Date().getHours();
    if (hora >= 6 && hora < 18) {
      document.body.classList.add("day");
      document.body.classList.remove("night");
    } else {
      document.body.classList.add("night");
      document.body.classList.remove("day");
    }
  }

  // Calcular y mostrar edad y evolución
  function actualizarEdadYEvolucion() {
    const ahora = Date.now();
    const diff = ahora - estado.creacion; // ms transcurridos
    const segundos = Math.floor(diff / 1000);
    txtEdad.textContent = `Edad: ${segundos} seg`;

    // Quitar todas las clases de evolución
    imgMascota.classList.remove("evol-baby", "evol-child", "evol-adult", "evol-elder");

    // Determinar etapa:
    // <120 s: bebé, 120–300 s: niño, 300–600 s: adulto, >600 s: anciano
    if (diff < 120000) {
      imgMascota.classList.add("evol-baby");
    } else if (diff < 300000) {
      imgMascota.classList.add("evol-child");
    } else if (diff < 600000) {
      imgMascota.classList.add("evol-adult");
    } else {
      imgMascota.classList.add("evol-elder");
    }
  }

  // Actualizar las barras en pantalla
  function actualizarBarras() {
    barHambre.style.width   = `${estado.hambre}%`;   txtHambre.textContent   = `${estado.hambre} %`;
    barSed.style.width      = `${estado.sed}%`;      txtSed.textContent      = `${estado.sed} %`;
    barAlegria.style.width  = `${estado.alegria}%`;  txtAlegria.textContent  = `${estado.alegria} %`;
    barLimpieza.style.width = `${estado.limpieza}%`; txtLimpieza.textContent = `${estado.limpieza} %`;
    barSalud.style.width    = `${estado.salud}%`;    txtSalud.textContent    = `${estado.salud} %`;

    // Si Salud ≤ 0: mascota “muerta”
    if (estado.salud <= 0) {
      imgMascota.classList.add("muerto");
      btnAlimentar.disabled = true;
      btnAgua.disabled      = true;
      btnJugar.disabled     = true;
      btnLimpiar.disabled   = true;
      btnDormir.disabled    = false; // puede “dormir” para recuperarse
    } else {
      imgMascota.classList.remove("muerto");
      btnAlimentar.disabled = false;
      btnAgua.disabled      = false;
      btnJugar.disabled     = false;
      btnLimpiar.disabled   = false;
      btnDormir.disabled    = false;
    }
  }

  // Función de decaimiento automático
  function decaerMetrics() {
    if (estado.salud <= 0) return; // si ya murió, no decae más

    // 1) Hambre y Sed bajan
    estado.hambre   = Math.max(estado.hambre - 5, 0);
    estado.sed      = Math.max(estado.sed - 5, 0);
    // 2) Limpieza baja
    estado.limpieza = Math.max(estado.limpieza - 3, 0);

    // 3) Si Hambre ≤20 o Sed ≤20 o Limpieza ≤20 ⇒ Salud baja
    if (estado.hambre <= 20 || estado.sed <= 20 || estado.limpieza <= 20) {
      estado.salud = Math.max(estado.salud - 7, 0);
    }

    // 4) Alegría baja si no juegan
    estado.alegria  = Math.max(estado.alegria - 4, 0);

    actualizarBarras();
    guardarEstado();
  }

  // ---------- ACCIONES manuales ----------

  function alimentar() {
    if (estado.salud <= 0) return;
    estado.hambre = Math.min(estado.hambre + 20, 100);
    actualizarBarras();
    guardarEstado();
  }

  function darAgua() {
    if (estado.salud <= 0) return;
    estado.sed = Math.min(estado.sed + 20, 100);
    actualizarBarras();
    guardarEstado();
  }

  function jugar() {
    if (estado.salud <= 0) return;
    // Jugar consume algo de hambre y sed, pero eleva alegría
    estado.hambre   = Math.max(estado.hambre - 7, 0);
    estado.sed      = Math.max(estado.sed - 7, 0);
    estado.alegria  = Math.min(estado.alegria + 20, 100);
    // Si salud está baja, bajar salud extra
    if (estado.salud <= 30) {
      estado.salud = Math.max(estado.salud - 5, 0);
    }
    actualizarBarras();
    guardarEstado();
  }

  function limpiar() {
    if (estado.salud <= 0) return;
    estado.limpieza = 100;
    actualizarBarras();
    guardarEstado();
  }

  function dormir() {
    // Dormir restaura salud, pero gasta sed y algo de hambre
    estado.hambre  = Math.max(estado.hambre - 5, 0);
    estado.sed     = Math.max(estado.sed - 5, 0);
    estado.salud   = Math.min(estado.salud + 30, 100);
    actualizarBarras();
    guardarEstado();
  }

  // ---------- INICIALIZACIÓN ----------

  function iniciar() {
    cargarEstado();
    actualizarDiaNoche();
    actualizarEdadYEvolucion();
    actualizarBarras();

    // Cada seg: actualizar edad/evolución
    setInterval(actualizarEdadYEvolucion, INTERVALO_EDAD);
    // Cada 10 s: decaer métricas
    setInterval(decaerMetrics, INTERVALO_CICLO);
    // Cada minuto: verificar día/noche
    setInterval(actualizarDiaNoche, 60000);

    // Asignar eventos a botones
    btnAlimentar.addEventListener("click", alimentar);
    btnAgua.addEventListener("click", darAgua);
    btnJugar.addEventListener("click", jugar);
    btnLimpiar.addEventListener("click", limpiar);
    btnDormir.addEventListener("click", dormir);
  }

  // Arrancar todo al cargar la página
  window.addEventListener("load", iniciar);
})();
