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
                $("#respuesta").html('<div class="alert alert-success">' + respuesta + '</div>');
                $("#formRegistro")[0].reset();
            },
            error: function (xhr, status, error) {
                $("#respuesta").html('<div class="alert alert-danger">Error al procesar el registro.</div>');
                console.error("Error AJAX:", xhr.responseText);
            }
        });
    });
});