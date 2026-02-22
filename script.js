document.addEventListener("DOMContentLoaded", () => {

    //AUTENTICACIÓN 
    iniciarRegistro();
    iniciarLogin();
    protegerPaginas();
    mostrarBienvenida();

   
    if (document.getElementById("citaForm")) {
        verificarSesionEnCitas();
        iniciarCitas();
        mostrarCitas();
        mostrarHorariosOcupados();
    }

});

//autenticacion

function iniciarRegistro() {

    const form = document.getElementById("registroForm");
    if (!form) return;

    form.addEventListener("submit", e => {
        e.preventDefault();

        const usuario = document.getElementById("nuevoUsuario").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const password = document.getElementById("nuevaPassword").value;

        const usuarios = obtenerUsuarios();

        if (usuarios.some(u => u.usuario === usuario)) {
            alert("Usuario ya existe");
            return;
        }

        usuarios.push({ usuario, correo, password });
        guardarUsuarios(usuarios);

        localStorage.setItem("sesionActiva", usuario);
        window.location.href = "dashboard.html";
    });
}


function iniciarLogin() {

    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", e => {
        e.preventDefault();

        const usuario = document.getElementById("usuario").value.trim();
        const password = document.getElementById("password").value;

        const usuarios = obtenerUsuarios();

        const valido = usuarios.find(u =>
            u.usuario === usuario && u.password === password
        );

        if (!valido) {
            alert("Usuario o contraseña incorrectos");
            return;
        }

        localStorage.setItem("sesionActiva", usuario);
        window.location.href = "dashboard.html";
    });
}


function protegerPaginas() {

    const protegidas = ["dashboard.html", "citas.html"];
    const actual = window.location.pathname.split("/").pop();

    if (protegidas.includes(actual) &&
        !localStorage.getItem("sesionActiva")) {

        window.location.href = "index.html";
    }
}


function mostrarBienvenida() {

    const bienvenida = document.getElementById("bienvenida");
    const usuario = localStorage.getItem("sesionActiva");

    if (bienvenida && usuario) {
        bienvenida.textContent = `Bienvenido, ${usuario}`;
    }
}


window.logout = function() {
    localStorage.removeItem("sesionActiva");
    window.location.href = "index.html";
}


//sistema de citas

function verificarSesionEnCitas() {

    const form = document.getElementById("citaForm");
    if (!form) return;

    const sesion = localStorage.getItem("sesionActiva");
    if (!sesion) {
        window.location.href = "index.html";
    }
}


function iniciarCitas() {

    const form = document.getElementById("citaForm");
    if (!form) return;

    form.addEventListener("submit", e => {
        e.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const especialidad = document.getElementById("especialidad").value;
        const fecha = document.getElementById("fecha").value;
        const hora = document.getElementById("hora").value;

        const usuarioActivo = localStorage.getItem("sesionActiva");

        if (!fecha || !hora) {
            alert("Debes seleccionar fecha y hora.");
            return;
        }

        const citas = obtenerCitas();

        const ocupada = citas.find(c =>
            c.fecha === fecha &&
            c.hora === hora
        );

        if (ocupada) {
            alert("Ese horario ya está ocupado.");
            return;
        }

        citas.push({
            id: Date.now(),
            usuario: usuarioActivo,
            nombre,
            especialidad,
            fecha,
            hora
        });

        guardarCitas(citas);

        form.reset();
        mostrarCitas();
        mostrarHorariosOcupados();
    });
}


function mostrarCitas() {

    const tabla = document.getElementById("tablaCitas");
    if (!tabla) return;

    const usuarioActivo = localStorage.getItem("sesionActiva");
    const citas = obtenerCitas().filter(c => c.usuario === usuarioActivo);

    tabla.innerHTML = "";

    citas.forEach(cita => {
        tabla.innerHTML += `
            <tr>
                <td>${cita.nombre}</td>
                <td>${cita.especialidad}</td>
                <td>${cita.fecha}</td>
                <td>${cita.hora}</td>
                <td>
                    <button class="btn-danger" style="padding: 5px 10px; font-size: 14px;" onclick="eliminarCita(${cita.id})">
                       Eliminar
                </button>
                </td>
            </tr>
        `;
    });
}


function eliminarCita(id) {

    const citas = obtenerCitas();
    citas = citas.filter(c => c.id !== id);
    guardarCitas(citas);

    mostrarCitas();
    mostrarHorariosOcupados();
}


window.eliminarCita = function(id) {
    let citas = obtenerCitas();
    citas = citas.filter(c => c.id !== id);
    guardarCitas(citas);

    mostrarCitas();
    mostrarHorariosOcupados();
}
function mostrarHorariosOcupados() {

    const contenedor = document.getElementById("horariosOcupados");
    if (!contenedor) return;

    const citas = obtenerCitas();

    if (citas.length === 0) {
        contenedor.textContent = "No hay horarios ocupados.";
        return;
    }

    contenedor.innerHTML =
        citas.map(c => `${c.fecha} - ${c.hora}`).join("<br>");
}

//funciones

function obtenerUsuarios() {
    return JSON.parse(localStorage.getItem("usuarios")) || [];
}

function guardarUsuarios(usuarios) {
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

function obtenerCitas() {
    return JSON.parse(localStorage.getItem("citas")) || [];
}

function guardarCitas(citas) {
    localStorage.setItem("citas", JSON.stringify(citas));
}