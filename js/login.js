$(function () {
    $('#login-form').on('submit', async function (e) {
        e.preventDefault();
        const usuario = $('#login-usuario').val().trim();
        const password = $('#login-password').val();
        const $alert = $('#login-alert');

        $alert.addClass('d-none').removeClass('alert-danger alert-success').text('');

        try {
            const resp = await $.ajax({
                url: 'php/login.php',
                method: 'POST',
                data: { usuario, password },
                dataType: 'json'
            });
                    if (resp && resp.success) {
                        // Actualizar estado de sesión y navbar automáticamente
                        if (window.Auth && typeof window.Auth.cargarEstado === 'function') {
                            await window.Auth.cargarEstado();
                            window.dispatchEvent(new Event('tipoCambioActualizado'));
                        }
                        $alert.removeClass('d-none').addClass('alert alert-success').text('¡Bienvenido ' + resp.user.nombre + '!');
                        // Redirigir según el rol
                        let destino = 'index.html';
                        if (resp.user && resp.user.rol === 'admin') destino = 'administracion.html';
                        else if (resp.user && resp.user.rol === 'asociado') destino = 'panel_usuario.html';
                        setTimeout(() => { window.location.href = destino; }, 1000);
                    } else {
                        $alert.removeClass('d-none').addClass('alert alert-danger').text(resp.message || 'Credenciales inválidas');
                    }
        } catch (e) {
            $alert.removeClass('d-none').addClass('alert alert-danger').text('Error al iniciar sesión.');
        }
    });
});
