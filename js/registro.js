$(document).ready(function () {
    $("#enviar").click(function () {
        var nombre = $("#nombre").val();
        var usuario = $("#usuario").val();
        var password = $("#password").val();
        var rol = $("#rol").val();

        $.ajax({
            url: "php/procesar_registro.php",
            method: "POST",
            data: {
                nombre: nombre,
                usuario: usuario,
                password: password,
                rol: rol
            },
            success: function (respuesta) {
                let msg = "";
                let isSuccess = false;
                // Intentar parsear como JSON
                try {
                    let json = typeof respuesta === "string" ? JSON.parse(respuesta) : respuesta;
                    if (json.success) {
                        msg = json.message || "¡Usuario registrado exitosamente!";
                        isSuccess = true;
                    } else {
                        msg = json.error || "Error al registrar el usuario.";
                    }
                } catch (e) {
                    // Si no es JSON, mostrar como texto plano
                    msg = respuesta;
                    isSuccess = msg.toLowerCase().includes("exitosamente");
                }
                const alertClass = isSuccess ? "alert-success" : "alert-danger";
                $("#respuesta").html('<div class="alert ' + alertClass + '">' + msg + '</div>');
                if (isSuccess) $("#formRegistro")[0].reset();
            },
            error: function (xhr, status, error) {
                let msg = "Error al procesar el registro.";
                try {
                    let json = JSON.parse(xhr.responseText);
                    msg = json.error || msg;
                } catch (e) {}
                $("#respuesta").html('<div class="alert alert-danger">' + msg + '</div>');
                console.error("Error AJAX:", xhr.responseText);
            }
        });
    });
});