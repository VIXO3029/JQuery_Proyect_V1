$(document).ready(function () {
    let lastDeletedTask = null;
    let timerInterval = null;
    let elapsedTime = 0;
    let isPaused = false;

    // Función para actualizar el tiempo formateado
    function formatElapsedTime(seconds) {
        const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${secs}`;
    }

    // Función para manejar el cronómetro
    function startTimer() {
        timerInterval = setInterval(() => {
            elapsedTime++;
            $('#task-timer').text(formatElapsedTime(elapsedTime));
        }, 1000);
    }

    // Iniciar el cronómetro
    $('#start-timer').on('click', function () {
        if (!timerInterval && !isPaused) {
            startTimer();
            $('#resume-timer').hide(); // Ocultar botón Reanudar
            showNotification('Cronómetro iniciado.');
        }
    });

    // Pausar el cronómetro
    $('#pause-timer').on('click', function () {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            isPaused = true;
            $('#resume-timer').show(); // Mostrar botón Reanudar
            showNotification('Cronómetro pausado.');
        }
    });

    // Reanudar el cronómetro
    $('#resume-timer').on('click', function () {
        if (!timerInterval && isPaused) {
            startTimer();
            isPaused = false;
            $(this).hide(); // Ocultar botón Reanudar
            showNotification('Cronómetro reanudado.');
        }
    });

    // Reiniciar el cronómetro
    $('#reset-timer').on('click', function () {
        clearInterval(timerInterval);
        timerInterval = null;
        elapsedTime = 0;
        isPaused = false;
        $('#task-timer').text('00:00:00');
        $('#resume-timer').hide(); // Ocultar botón Reanudar
        showNotification('Cronómetro reiniciado.');
    });

    function showNotification(message, type = 'success') {
        const notification = `<div class="notification ${type}">${message}</div>`;
        $('#notifications').append(notification);
        setTimeout(() => $('.notification').first().remove(), 3000);
    }
});
