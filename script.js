
document.addEventListener("DOMContentLoaded", () => {
    const saludo = document.getElementById("bienvenida");
    const usuarioActivo = localStorage.getItem("sesionActiva");
    if (saludo && usuarioActivo) {
        saludo.textContent = "Bienvenido(a), " + usuarioActivo;
    }

    if (document.getElementById("loginForm")) {
        iniciarLogin();
    }
    
    if (document.getElementById("registroForm")) {
        iniciarRegistro();
    }

    if (document.getElementById("citaForm")) {
        emailjs.init("F9mM3APkBfNq-vEpV"); 
        iniciarCitas();
        mostrarCitas();
        mostrarHorariosOcupados();
    }
});

//login
function iniciarRegistro() {
    const form = document.getElementById("registroForm");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const usuario = document.getElementById("nuevoUsuario").value.trim();
        const password = document.getElementById("nuevaPassword").value;

        let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        
        if (usuarios.find(u => u.usuario === usuario)) {
            return alert("Este nombre de usuario ya existe.");
        }

        
        usuarios.push({ usuario, password });
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
       
        localStorage.setItem("sesionActiva", usuario);
        
        alert("¡Cuenta creada con éxito! Bienvenido(a) a la Clínica.");
        window.location.href = "dashboard.html"; 
    });
}

//Gestion de citas
function iniciarLogin() {
    const form = document.getElementById("loginForm");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const usuarioInput = document.getElementById("usuario").value.trim();
        const passwordInput = document.getElementById("password").value;

        const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        const usuarioValido = usuarios.find(u => u.usuario === usuarioInput && u.password === passwordInput);

        if (usuarioValido) {
            localStorage.setItem("sesionActiva", usuarioInput);
            window.location.href = "dashboard.html"; 
        } else {
            alert("Usuario o contraseña incorrectos.");
        }
    });
}


function iniciarCitas() {
    const form = document.getElementById("citaForm");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const parametrosCorreo = {
            nombre: document.getElementById("nombre").value.trim(),
            correo_destino: document.getElementById("correoPaciente").value.trim(),
            especialidad: document.getElementById("especialidad").value,
            fecha: document.getElementById("fecha").value,
            hora: document.getElementById("hora").value
        };

        try {
            await emailjs.send("service_6ef4gos", "template_7vso0bu", parametrosCorreo);
            alert(`¡Éxito! Confirmación enviada a: ${parametrosCorreo.correo_destino}`);

            guardarCitaLocal(parametrosCorreo);
            form.reset();
            mostrarCitas();
            mostrarHorariosOcupados();
        } catch (error) {
            console.error("Error EmailJS:", error);
            alert("Error al enviar el correo. Revisa la consola y usa modo Incógnito.");
        }
    });
}

function guardarCitaLocal(cita) {
    const citas = JSON.parse(localStorage.getItem("citas")) || [];
    cita.id = Date.now();
    citas.push(cita);
    localStorage.setItem("citas", JSON.stringify(citas));
}

function mostrarCitas() {
    const tabla = document.getElementById("tablaCitas");
    if (!tabla) return;
    const citas = JSON.parse(localStorage.getItem("citas")) || [];
    tabla.innerHTML = citas.map(c => `
        <tr>
            <td>${c.nombre}</td>
            <td>${c.especialidad}</td>
            <td>${c.fecha}</td>
            <td>${c.hora}</td>
            <td><button class="btn-danger" onclick="eliminarCita(${c.id})">Eliminar</button></td>
        </tr>`).join("");
}

function mostrarHorariosOcupados() {
    const lista = document.getElementById("horariosOcupados");
    if (!lista) return;
    const citas = JSON.parse(localStorage.getItem("citas")) || [];
    lista.innerHTML = citas.length === 0 
        ? "<li>No hay citas programadas.</li>" 
        : citas.map(c => `<li>${c.fecha} - ${c.hora} (${c.especialidad})</li>`).join("");
}
window.cerrarSesion = function() {
    localStorage.removeItem("sesionActiva");
    alert("Has cerrado sesión correctamente.");
    window.location.replace("index.html");
};

window.logout = window.cerrarSesion;

window.eliminarCita = function(id) {
    let citas = JSON.parse(localStorage.getItem("citas")) || [];
    citas = citas.filter(c => c.id !== id);
    localStorage.setItem("citas", JSON.stringify(citas));
    mostrarCitas();
    mostrarHorariosOcupados();
};