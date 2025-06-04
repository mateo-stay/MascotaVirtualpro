// ---------------------------------------
// Valores iniciales y recuperación de localStorage
// ---------------------------------------
let energia    = parseInt(localStorage.getItem('energia'))    || 100;
let alegria    = parseInt(localStorage.getItem('alegria'))    || 100;
let temperatura = localStorage.getItem('temperatura') || "Normal";

// Elementos del DOM
const spanEnergia    = document.getElementById("energia");
const spanAlegria    = document.getElementById("alegria");
const spanTemperatura = document.getElementById("temperatura");
const imgMascota     = document.getElementById("img-mascota");
const btnRecargar    = document.getElementById("btn-recargar");
const btnAlimentar   = document.getElementById("btn-alimentar");
const btnJugar       = document.getElementById("btn-jugar");
const sonidoAlerta   = document.getElementById("sonido-alerta");
const sonidoFeliz    = document.getElementById("sonido-feliz");
const sonidoJuego    = document.getElementById("sonido-juego");
const sonidoReaccion = document.getElementById("sonido-reaccion");

const divReaccion    = document.getElementById("reaccion");
const contenedor     = document.querySelector(".container");

const INTERVALO_VIDA = 10000; // cada 10 segundos el decaimiento

// ---------------------------------------
// Función que actualiza pantalla y guarda estado
// ---------------------------------------
function actualizarPantalla() {
  spanEnergia.textContent = energia;
  spanAlegria.textContent = alegria;
  spanTemperatura.textContent = temperatura;

  // Guardar en localStorage
  localStorage.setItem('energia', energia);
  localStorage.setItem('alegria', alegria);
  localStorage.setItem('temperatura', temperatura);

  // Limpiar clases de estado
  imgMascota.classList.remove("apagado", "caliente", "triste");

  if (energia <= 0) {
    // Mascota “apagada”
    imgMascota.classList.add("apagado");
    btnRecargar.disabled  = false; // solo recarga puede funcionar para reanimar
    btnAlimentar.disabled = true;
    btnJugar.disabled     = true;
    spanTemperatura.textContent = "Apagado";
    return;
  }

  // Si tiene energía > 0, todos los botones funcionan
  btnRecargar.disabled  = false;
  btnAlimentar.disabled = false;
  btnJugar.disabled     = false;

  // Ajuste de temperatura según nivel de energía
  if (energia <= 20) {
    temperatura = "Alta";
    imgMascota.classList.add("caliente");
    sonidoAlerta.currentTime = 0;
    sonidoAlerta.play();
  } else if (energia <= 50) {
    temperatura = "Normal";
    if (alegria <= 30) {
      imgMascota.classList.add("triste");
    }
  } else {
    temperatura = "Fría";
  }

  // Si la alegría alcanzó 100, reproducir sonido feliz
  if (alegria === 100 && energia > 0) {
    sonidoFeliz.currentTime = 0;
    sonidoFeliz.play();
  }
}

// ---------------------------------------
// Decaimiento automático cada INTERVALO_VIDA
// ---------------------------------------
function decaerEstado() {
  if (energia <= 0) return;
  energia = Math.max(energia - 5, 0);
  alegria = Math.max(alegria - 5, 0);
  actualizarPantalla();
}

// ---------------------------------------
// Funciones de interacción manual: recargar, alimentar, jugar
// ---------------------------------------
function recargar() {
  // Permitir recarga aun si energía = 0 (reanimación)
  energia = Math.min(energia + 25, 100);
  actualizarPantalla();
}

function alimentar() {
  if (energia <= 0) return;
  alegria = Math.min(alegria + 25, 100);

  // Si alegría llega a 100, efecto de celebración breve
  if (alegria === 100) {
    imgMascota.classList.add("feliz");
    setTimeout(() => imgMascota.classList.remove("feliz"), 800);
  }

  actualizarPantalla();
}

function jugar() {
  if (energia <= 0) return;

  // 1) Actualizar energía y alegría
  energia = Math.max(energia - 20, 0);
  alegria = Math.max(alegria - 15, 0);

  // 2) Animación “bailar” y sonido de juego
  imgMascota.classList.add("bailar");
  sonidoJuego.currentTime = 0;
  sonidoJuego.play();

  imgMascota.addEventListener("animationend", () => {
    imgMascota.classList.remove("bailar");
  }, { once: true });

  // 3) Si alegría = 100 tras jugar, efecto “feliz”
  if (alegria === 100 && energia > 0) {
    imgMascota.classList.add("feliz");
    setTimeout(() => imgMascota.classList.remove("feliz"), 800);
  }

  // 4) Iniciar minijuego de reacción
  startReaccion();

  // 5) Refrescar pantalla con nuevos valores
  actualizarPantalla();
}

// ---------------------------------------
// Mini-juego de reacción
// ---------------------------------------
function startReaccion() {
  // Mostrar el círculo en posición aleatoria dentro de .container
  const tamañoCírculo = divReaccion.offsetWidth; // 60px o 50px en móviles
  const { width, height } = contenedor.getBoundingClientRect();
  // Margen para que no se salga del borde:
  const maxX = width  - tamañoCírculo;
  const maxY = height - tamañoCírculo;
  const randX = Math.floor(Math.random() * maxX);
  const randY = Math.floor(Math.random() * maxY);

  // Posicionar y mostrar
  divReaccion.style.left = randX + "px";
  divReaccion.style.top  = randY + "px";
  divReaccion.style.display = "block";

  // Tiempo máximo para clic (1.5 seg)
  let reaccionActiva = true;
  const timeoutID = setTimeout(() => {
    reaccionActiva = false;
    divReaccion.style.display = "none";
  }, 1500);

  // Listener de clic en el círculo
  function alClickReaccion() {
    if (!reaccionActiva) return;
    reaccionActiva = false;
    clearTimeout(timeoutID);
    divReaccion.style.display = "none";

    // Dar bonus de alegría
    alegria = Math.min(alegria + 30, 100);
    sonidoReaccion.currentTime = 0;
    sonidoReaccion.play();

    // Mini efecto “feliz” breve
    imgMascota.classList.add("feliz");
    setTimeout(() => imgMascota.classList.remove("feliz"), 800);

    actualizarPantalla();
  }

  divReaccion.addEventListener("click", alClickReaccion, { once: true });
}

// ---------------------------------------
// Eventos de botones
// ---------------------------------------
btnRecargar.addEventListener("click", recargar);
btnAlimentar.addEventListener("click", alimentar);
btnJugar.addEventListener("click", jugar);

// ---------------------------------------
// Iniciar ciclo automático y primera actualización
// ---------------------------------------
setInterval(decaerEstado, INTERVALO_VIDA);
actualizarPantalla();
