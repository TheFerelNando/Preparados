"use strict";

/* ==================================================
   ELEMENTOS PRINCIPALES
================================================== */

const pantallas = Array.from(
    document.querySelectorAll("[data-pantalla]")
);

const botonesNavegacion = Array.from(
    document.querySelectorAll("[data-destino]")
);

const DURACION_TRANSICION = 650;

let pantallaActual = 0;
let transicionActiva = false;


/* ==================================================
   PREPARAR LAS PANTALLAS
================================================== */

function prepararPantallas() {
    if (pantallas.length === 0) {
        return;
    }

    document.body.classList.add("navegacion-activa");

    pantallas.forEach((pantalla, indice) => {
        const esPrimeraPantalla = indice === 0;

        pantalla.classList.toggle(
            "pantalla-activa",
            esPrimeraPantalla
        );

        pantalla.setAttribute(
            "aria-hidden",
            String(!esPrimeraPantalla)
        );

        pantalla.inert = !esPrimeraPantalla;

        if (esPrimeraPantalla) {
            pantalla.scrollTop = 0;
        }
    });

    pantallaActual = 0;
}


/* ==================================================
   ENCONTRAR UNA PANTALLA
================================================== */

function obtenerIndicePantalla(idPantalla) {
    return pantallas.findIndex(
        (pantalla) => pantalla.id === idPantalla
    );
}


/* ==================================================
   CAMBIAR DE PANTALLA
================================================== */

function mostrarPantalla(idPantalla) {
    if (transicionActiva) {
        return;
    }

    const nuevoIndice = obtenerIndicePantalla(idPantalla);

    if (
        nuevoIndice === -1 ||
        nuevoIndice === pantallaActual
    ) {
        return;
    }

    transicionActiva = true;
    document.body.classList.add("esta-cambiando");

    const pantallaAnterior = pantallas[pantallaActual];
    const pantallaNueva = pantallas[nuevoIndice];

    const estaAvanzando = nuevoIndice > pantallaActual;

    pantallaAnterior.classList.remove("pantalla-activa");

    pantallaAnterior.classList.add(
        estaAvanzando
            ? "pantalla-saliendo-arriba"
            : "pantalla-saliendo-abajo"
    );

    pantallaAnterior.setAttribute("aria-hidden", "true");
    pantallaAnterior.inert = true;

    pantallaNueva.scrollTop = 0;
    pantallaNueva.setAttribute("aria-hidden", "false");
    pantallaNueva.inert = false;
    pantallaNueva.classList.add("pantalla-activa");

    pantallaActual = nuevoIndice;

    window.setTimeout(() => {
        pantallaAnterior.classList.remove(
            "pantalla-saliendo-arriba",
            "pantalla-saliendo-abajo"
        );

        document.body.classList.remove("esta-cambiando");
        transicionActiva = false;

        enfocarTitulo(pantallaNueva);
    }, DURACION_TRANSICION);
}


/* ==================================================
   ACCESIBILIDAD
================================================== */

function enfocarTitulo(pantalla) {
    const titulo = pantalla.querySelector("h1, h2");

    if (!titulo) {
        return;
    }

    titulo.setAttribute("tabindex", "-1");

    titulo.focus({
        preventScroll: true
    });

    titulo.addEventListener(
        "blur",
        () => {
            titulo.removeAttribute("tabindex");
        },
        {
            once: true
        }
    );
}


/* ==================================================
   EVENTOS DE LOS BOTONES
================================================== */

function activarBotones() {
    botonesNavegacion.forEach((boton) => {
        boton.addEventListener("click", () => {
            const destino = boton.dataset.destino;

            if (!destino) {
                return;
            }

            mostrarPantalla(destino);
        });
    });
}


/* ==================================================
   NAVEGACIÓN CON TECLADO
================================================== */

function activarTeclado() {
    document.addEventListener("keydown", (evento) => {
        const elementoActivo = document.activeElement;

        const estaEscribiendo =
            elementoActivo instanceof HTMLInputElement ||
            elementoActivo instanceof HTMLTextAreaElement ||
            elementoActivo instanceof HTMLSelectElement;

        if (estaEscribiendo || transicionActiva) {
            return;
        }

        const teclasSiguiente = [
            "ArrowRight",
            "PageDown"
        ];

        const teclasAnterior = [
            "ArrowLeft",
            "PageUp"
        ];

        if (
            teclasSiguiente.includes(evento.key) &&
            pantallaActual < pantallas.length - 1
        ) {
            evento.preventDefault();

            const siguiente = pantallas[pantallaActual + 1];

            mostrarPantalla(siguiente.id);
        }

        if (
            teclasAnterior.includes(evento.key) &&
            pantallaActual > 0
        ) {
            evento.preventDefault();

            const anterior = pantallas[pantallaActual - 1];

            mostrarPantalla(anterior.id);
        }
    });
}


/* ==================================================
   EVITAR ENVÍO ACCIDENTAL DEL FORMULARIO
================================================== */

/*
   Esta protección es temporal.
   formulario.js reemplazará este comportamiento
   cuando conectemos Google Sheets.
*/

function protegerFormularioTemporalmente() {
    const formulario = document.querySelector(
        "#formularioContacto"
    );

    const estado = document.querySelector(
        "#estadoFormulario"
    );

    if (!formulario) {
        return;
    }

    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();

        if (estado) {
            estado.textContent =
                "El envío se habilitará al conectar la hoja de cálculo.";
        }
    });
}


/* ==================================================
   INICIALIZACIÓN
================================================== */

function iniciarNavegacion() {
    prepararPantallas();
    activarBotones();
    activarTeclado();
    protegerFormularioTemporalmente();
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        iniciarNavegacion
    );
} else {
    iniciarNavegacion();
}