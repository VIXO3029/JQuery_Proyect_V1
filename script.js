$(document).ready(function () {
    let lastDeletedTask = null;
    let timerInterval = null;
    let elapsedTime = 0;
    let isPaused = false; // Variable para controlar el estado de pausa

    function updateStatistics() {
        const totalTasks = $('#task-list .task').length;
        const completedTasks = $('#task-list .task.completed').length;
        const pendingTasks = totalTasks - completedTasks;

        $('#total-tasks').text(totalTasks);
        $('#completed-tasks').text(completedTasks);
        $('#pending-tasks').text(pendingTasks);
    }

    function showNotification(message, type = 'success') {
        const notification = `<div class="notification ${type}">${message}</div>`;
        $('#notifications').append(notification);
        setTimeout(() => $('.notification').first().remove(), 3000);
    }

    $('#add-task').on('click', function () {
        const taskText = $('#new-task').val().trim();
        const category = $('#task-category').val();
        const deadline = $('#task-deadline').val();

        if (taskText) {
            const taskItem = `
                <li class="task" data-category="${category}">
                    <span>[${category}] ${taskText} <small>(Fecha límite: ${deadline || 'Sin fecha'})</small></span>
                    <div>
                        <button class="toggle-completed">✔</button>
                        <button class="delete-task">🗑</button>
                    </div>
                </li>
            `;
            $('#task-list').append(taskItem);
            $('#new-task').val('');
            $('#task-deadline').val('');
            updateStatistics();
            showNotification('Tarea agregada exitosamente.');
        } else {
            showNotification('Por favor, escribe una tarea antes de agregar.', 'error');
        }
    });

    $('#toggle-theme').on('click', function () {
        $('body, .container').toggleClass('dark-mode');
        const themeIcon = $('#theme-icon');

        // Cambiar el ícono según el modo
        if ($('body').hasClass('dark-mode')) {
            themeIcon.removeClass('fa-moon').addClass('fa-sun');
            $(this).attr('title', 'Cambiar a modo claro');
        } else {
            themeIcon.removeClass('fa-sun').addClass('fa-moon');
            $(this).attr('title', 'Cambiar a modo oscuro');
        }
    });

    $('#undo-delete').on('click', function () {
        if (lastDeletedTask) {
            $('#task-list').append(lastDeletedTask);
            lastDeletedTask = null;
            updateStatistics();
            showNotification('Eliminación deshecha.');
        } else {
            showNotification('No hay ninguna eliminación para deshacer.', 'error');
        }
    });

    $(document).on('click', '.toggle-completed', function () {
        $(this).closest('.task').toggleClass('completed');
        updateStatistics();
        showNotification('Estado de tarea actualizado.');
    });

    $(document).on('click', '.delete-task', function () {
        lastDeletedTask = $(this).closest('.task').detach();
        updateStatistics();
        showNotification('Tarea eliminada. Puedes deshacer la eliminación.');
    });

    $('#show-all').on('click', function () {
        $('#task-list .task').show();
    });

    $('#show-completed').on('click', function () {
        $('#task-list .task').hide();
        $('#task-list .task.completed').show();
    });

    $('#show-pending').on('click', function () {
        $('#task-list .task').hide();
        $('#task-list .task:not(.completed)').show();
    });

    $('#clear-tasks').on('click', function () {
        $('#task-list').empty();
        updateStatistics();
        showNotification('Lista de tareas reiniciada.');
    });

    $('#start-timer').on('click', function () {
        if (!timerInterval && !isPaused) {
            timerInterval = setInterval(function () {
                elapsedTime++;
                const hours = String(Math.floor(elapsedTime / 3600)).padStart(2, '0');
                const minutes = String(Math.floor((elapsedTime % 3600) / 60)).padStart(2, '0');
                const seconds = String(elapsedTime % 60).padStart(2, '0');
                $('#task-timer').text(`${hours}:${minutes}:${seconds}`);
            }, 1000);
            showNotification('Cronómetro iniciado.');
        }
    });

    $('#pause-timer').on('click', function () {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            isPaused = true; // Cambiar el estado a pausado
            showNotification('Cronómetro pausado.');
        }
    });

    $('#reset-timer').on('click', function () {
        clearInterval(timerInterval);
        timerInterval = null;
        elapsedTime = 0;
        isPaused = false; // Reiniciar el estado de pausa
        $('#task-timer').text('00:00:00'); // Reiniciar el temporizador a 00:00:00
        showNotification('Cronómetro reiniciado.');
    });
});