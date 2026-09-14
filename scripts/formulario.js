"use strict";

/* ==================================================
   CONFIGURACIÓN
================================================== */

const URL_APPS_SCRIPT =
    "https://script.google.com/macros/s/AKfycbzSAETAMqBK_LjAKbmU6SOR8NeC4lOHXwz-Oh_Gf3xyhDI12YF3obgNG07nqZg7GyuI/exec";

const EXPRESION_NOMBRE =
    /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)+$/;

const EXPRESION_TELEFONO =
    /^[0-9]{4}-[0-9]{4}$/;


/* ==================================================
   ELEMENTOS DEL FORMULARIO
================================================== */

const formularioContacto = document.querySelector(
    "#formularioContacto"
);

const botonEnviar = document.querySelector(
    "#botonEnviar"
);

const estadoFormulario = document.querySelector(
    "#estadoFormulario"
);

const camposFormulario = {
    nombre: {
        input: document.querySelector("#nombre"),
        error: document.querySelector("#errorNombre")
    },

    edad: {
        input: document.querySelector("#edad"),
        error: document.querySelector("#errorEdad")
    },

    telefono: {
        input: document.querySelector("#telefono"),
        error: document.querySelector("#errorTelefono")
    }
};


/* ==================================================
   LIMPIAR VALORES MIENTRAS SE ESCRIBEN
================================================== */

function limpiarNombre(valor) {
    return valor
        .replace(
            /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g,
            ""
        )
        .replace(/\s{2,}/g, " ")
        .slice(0, 80);
}


function limpiarEdad(valor) {
    return valor
        .replace(/\D/g, "")
        .slice(0, 3);
}


function formatearTelefono(valor) {
    const digitos = valor
        .replace(/\D/g, "")
        .slice(0, 8);

    if (digitos.length <= 4) {
        return digitos;
    }

    return (
        digitos.slice(0, 4) +
        "-" +
        digitos.slice(4)
    );
}


/* ==================================================
   VALIDACIONES
================================================== */

function validarNombre() {
    const campo = camposFormulario.nombre;

    const valor = campo.input.value
        .trim()
        .replace(/\s+/g, " ");

    campo.input.value = valor;

    if (valor.length === 0) {
        mostrarError(
            campo,
            "Escribe tu nombre completo."
        );

        return false;
    }

    if (!EXPRESION_NOMBRE.test(valor)) {
        mostrarError(
            campo,
            "Escribe al menos un nombre y un apellido, usando solamente letras."
        );

        return false;
    }

    const palabras = valor.split(" ");

    const palabrasValidas = palabras.every(
        (palabra) => palabra.length >= 2
    );

    if (!palabrasValidas) {
        mostrarError(
            campo,
            "No utilices iniciales ni abreviaturas."
        );

        return false;
    }

    mostrarValido(campo);
    return true;
}


function validarEdad() {
    const campo = camposFormulario.edad;
    const valor = campo.input.value.trim();
    const edad = Number(valor);

    if (valor.length === 0) {
        mostrarError(
            campo,
            "Escribe tu edad."
        );

        return false;
    }

    if (!/^\d{1,3}$/.test(valor)) {
        mostrarError(
            campo,
            "La edad solo puede contener números."
        );

        return false;
    }

    if (
        !Number.isInteger(edad) ||
        edad < 5 ||
        edad > 120
    ) {
        mostrarError(
            campo,
            "Escribe una edad válida."
        );

        return false;
    }

    mostrarValido(campo);
    return true;
}


function validarTelefono() {
    const campo = camposFormulario.telefono;
    const valor = campo.input.value.trim();

    if (valor.length === 0) {
        mostrarError(
            campo,
            "Escribe tu número de teléfono."
        );

        return false;
    }

    if (!EXPRESION_TELEFONO.test(valor)) {
        mostrarError(
            campo,
            "Escribe ocho dígitos con formato 5555-5555."
        );

        return false;
    }

    mostrarValido(campo);
    return true;
}


function validarFormulario() {
    const nombreValido = validarNombre();
    const edadValida = validarEdad();
    const telefonoValido = validarTelefono();

    return (
        nombreValido &&
        edadValida &&
        telefonoValido
    );
}


/* ==================================================
   ESTADOS VISUALES
================================================== */

function obtenerGrupoCampo(campo) {
    return campo.input.closest(".grupo-campo");
}


function mostrarError(campo, mensaje) {
    const grupo = obtenerGrupoCampo(campo);

    grupo.classList.add("es-invalido");
    grupo.classList.remove("es-valido");

    campo.input.setAttribute(
        "aria-invalid",
        "true"
    );

    campo.error.textContent = mensaje;
}


function mostrarValido(campo) {
    const grupo = obtenerGrupoCampo(campo);

    grupo.classList.remove("es-invalido");
    grupo.classList.add("es-valido");

    campo.input.setAttribute(
        "aria-invalid",
        "false"
    );

    campo.error.textContent = "";
}


function limpiarEstadoCampo(campo) {
    const grupo = obtenerGrupoCampo(campo);

    grupo.classList.remove(
        "es-invalido",
        "es-valido"
    );

    campo.input.removeAttribute("aria-invalid");
    campo.error.textContent = "";
}


function mostrarEstado(mensaje, tipo = "") {
    estadoFormulario.textContent = mensaje;

    estadoFormulario.classList.remove(
        "es-exito",
        "es-error"
    );

    if (tipo) {
        estadoFormulario.classList.add(
            `es-${tipo}`
        );
    }
}


/* ==================================================
   ESTADO DE ENVÍO
================================================== */

function establecerEnviando(estaEnviando) {
    botonEnviar.disabled = estaEnviando;

    botonEnviar.classList.toggle(
        "esta-enviando",
        estaEnviando
    );

    Object.values(camposFormulario).forEach(
        (campo) => {
            campo.input.disabled = estaEnviando;
        }
    );
}


/* ==================================================
   CREAR DATOS
================================================== */

function crearDatosFormulario() {
    return {
        nombre:
            camposFormulario.nombre.input.value
                .trim()
                .replace(/\s+/g, " "),

        edad:
            Number(
                camposFormulario.edad.input.value
            ),

        telefono:
            camposFormulario.telefono.input.value,

        origen:
            window.location.href,

        sitioWeb: ""
    };
}


/* ==================================================
   ENVIAR A GOOGLE SHEETS
================================================== */

async function enviarFormulario(evento) {
    evento.preventDefault();

    mostrarEstado("");

    if (!validarFormulario()) {
        mostrarEstado(
            "Revisa los campos señalados.",
            "error"
        );

        const primerCampoInvalido =
            formularioContacto.querySelector(
                '[aria-invalid="true"]'
            );

        primerCampoInvalido?.focus();
        return;
    }

    const datos = crearDatosFormulario();

    establecerEnviando(true);

    mostrarEstado(
        "Estamos enviando tus datos…"
    );

    try {
        await fetch(URL_APPS_SCRIPT, {
            method: "POST",
            mode: "no-cors",

            headers: {
                "Content-Type":
                    "text/plain;charset=utf-8"
            },

            body: JSON.stringify(datos)
        });

        formularioContacto.reset();

        Object
            .values(camposFormulario)
            .forEach(limpiarEstadoCampo);

        mostrarEstado(
            "¡Gracias! Recibimos tus datos y pronto nos comunicaremos contigo.",
            "exito"
        );

    } catch (error) {
        console.error(
            "Error al enviar el formulario:",
            error
        );

        mostrarEstado(
            "No pudimos enviar tus datos. Revisa tu conexión e inténtalo nuevamente.",
            "error"
        );

    } finally {
        establecerEnviando(false);
    }
}


/* ==================================================
   EVENTOS DE LOS CAMPOS
================================================== */

function activarValidacionCampos() {
    camposFormulario.nombre.input.addEventListener(
        "input",
        () => {
            const campo = camposFormulario.nombre;

            campo.input.value = limpiarNombre(
                campo.input.value
            );

            if (
                obtenerGrupoCampo(campo)
                    .classList
                    .contains("es-invalido")
            ) {
                validarNombre();
            }
        }
    );

    camposFormulario.edad.input.addEventListener(
        "input",
        () => {
            const campo = camposFormulario.edad;

            campo.input.value = limpiarEdad(
                campo.input.value
            );

            if (
                obtenerGrupoCampo(campo)
                    .classList
                    .contains("es-invalido")
            ) {
                validarEdad();
            }
        }
    );

    camposFormulario.telefono.input.addEventListener(
        "input",
        () => {
            const campo = camposFormulario.telefono;

            campo.input.value = formatearTelefono(
                campo.input.value
            );

            if (
                obtenerGrupoCampo(campo)
                    .classList
                    .contains("es-invalido")
            ) {
                validarTelefono();
            }
        }
    );

    camposFormulario.nombre.input.addEventListener(
        "blur",
        validarNombre
    );

    camposFormulario.edad.input.addEventListener(
        "blur",
        validarEdad
    );

    camposFormulario.telefono.input.addEventListener(
        "blur",
        validarTelefono
    );
}


/* ==================================================
   INICIALIZACIÓN
================================================== */

function iniciarFormulario() {
    if (
        !formularioContacto ||
        !botonEnviar ||
        !estadoFormulario
    ) {
        console.error(
            "No se encontraron los elementos del formulario."
        );

        return;
    }

    activarValidacionCampos();

    formularioContacto.addEventListener(
        "submit",
        enviarFormulario
    );
}


if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        iniciarFormulario
    );
} else {
    iniciarFormulario();
}