// Valores iniciales y recuperación de localStorage
let energia = parseInt(localStorage.getItem('energia')) || 100;
let alegria = parseInt(localStorage.getItem('alegria')) || 100;
let temperatura = localStorage.getItem('temperatura') || "Normal";

// Elementos del DOM
const spanEnergia = document.getElementById("energia");
const spanAlegria = document.getElementById("alegria");
const spanTemperatura = document.getElementById("temperatura");
const imgMascota = document.getElementById("img-mascota");
const btnRecargar = document.getElementById("btn-recargar");
const btnAlimentar = document.getElementById("btn-alimentar");
const btnJugar = document.getElementById("btn-jugar");
const sonidoAlerta = document.getElementById("sonido-alerta");
const sonidoFeliz = document.getElementById("sonido-feliz");

const INTERVALO_VIDA = 10000; // cada 10 segundos

// Función que actualiza todo en pantalla y guarda en localStorage
function actualizarPantalla() {
  spanEnergia.textContent = energia;
  spanAlegria.textContent = alegria;
  spanTemperatura.textContent = temperatura;

  // Guardar estado
  localStorage.setItem('energia', energia);
  localStorage.setItem('alegria', alegria);
  localStorage.setItem('temperatura', temperatura);

  // Cambios visuales según estado
  imgMascota.classList.remove("apagado", "caliente", "triste");

  if (energia <= 0) {
    imgMascota.classList.add("apagado");
    btnRecargar.disabled = false; // Permitir recargar para reanimar
    btnAlimentar.disabled = true;
    btnJugar.disabled = true;
    spanTemperatura.textContent = "Apagado";
    return;
  }

  btnRecargar.disabled = false;
  btnAlimentar.disabled = false;
  btnJugar.disabled = false;

  if (energia <= 20) {
    temperatura = "Alta";
    imgMascota.classList.add("caliente");
    // Reproducir alerta si se acaba de poner en 'Alta'
    sonidoAlerta.play();
  } else if (energia <= 50) {
    temperatura = "Normal";
    // Si alegría baja (<30), ponerse triste
    if (alegria <= 30) {
      imgMascota.classList.add("triste");
    }
  } else {
    temperatura = "Fría";
  }

  // Si alegría al tope, tocar sonido feliz
  if (alegria === 100 && energia > 0) {
    sonidoFeliz.play();
  }
}

// Funciones de interacción manual
function recargar() {
  energia = Math.min(energia + 25, 100);
  actualizarPantalla();
}

function alimentar() {
  if (energia <= 0) return;
  alegria = Math.min(alegria + 25, 100);
  // Si queda feliz, cambio de animación
  if (alegria === 100) {
    imgMascota.classList.add("caliente"); // animación leve para celebrar
    setTimeout(() => imgMascota.classList.remove("caliente"), 1200);
  }
  actualizarPantalla();
}

function jugar() {
  if (energia <= 0) return;
  energia = Math.max(energia - 20, 0);
  alegria = Math.max(alegria - 15, 0);
  actualizarPantalla();
}

// Decaimiento automático cada INTERVALO_VIDA
function decaerEstado() {
  if (energia <= 0) return;
  energia = Math.max(energia - 5, 0);
  alegria = Math.max(alegria - 5, 0);
  actualizarPantalla();
}

// Eventos de botones
btnRecargar.addEventListener("click", recargar);
btnAlimentar.addEventListener("click", alimentar);
btnJugar.addEventListener("click", jugar);

// Iniciar ciclo automático y primera actualización
setInterval(decaerEstado, INTERVALO_VIDA);
actualizarPantalla();
