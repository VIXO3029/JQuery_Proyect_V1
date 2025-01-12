$(document).ready(function () {
    const deletedTasks = [];
    let timerInterval = null;
    let elapsedTime = 0;
    let activeTask = null; // Tarea activa para el cronómetro

    // Persistencia del tema
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        toggleTheme(true);
    }

    // Función para alternar el tema
    function toggleTheme(init = false) {
        const isDark = $('body').toggleClass('dark-mode').hasClass('dark-mode');
        $('.container').toggleClass('dark-mode');
        $('#theme-icon').toggleClass('fa-moon fa-sun');
        $('#toggle-theme').attr('title', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
        if (!init) localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    // Mostrar notificaciones
    function showNotification(message, type = 'success') {
        const notification = `<div class="notification ${type}">${message}</div>`;
        $('#notifications').append(notification);
        setTimeout(() => $('.notification').first().remove(), 3000);
    }

    // Actualizar contadores de tareas
    function updateTaskCounters() {
        const totalTasks = $('.task').length;
        const completedTasks = $('.task.completed').length;
        const pendingTasks = totalTasks - completedTasks;

        $('#total-tasks').text(totalTasks);
        $('#completed-tasks').text(completedTasks);
        $('#pending-tasks').text(pendingTasks);
    }

    // Validar entrada de tareas
    function validateTaskInput(taskName, taskDeadline) {
        if (!taskName.trim()) {
            showNotification('El nombre de la tarea no puede estar vacío.', 'error');
            return false;
        }
        if (taskDeadline && new Date(taskDeadline) < new Date()) {
            showNotification('La fecha límite no puede ser anterior a hoy.', 'error');
            return false;
        }
        return true;
    }

    // Añadir una tarea
    function addTask() {
        const taskName = $('#new-task').val().trim();
        const taskCategory = $('#task-category').val();
        const taskDeadline = $('#task-deadline').val();

        if (!validateTaskInput(taskName, taskDeadline)) return;

        const taskHTML = `
            <li class="task" data-name="${taskName.toLowerCase()}">
                <div class="task-content">
                    <span class="task-name">${taskName}</span>
                    <span class="task-category">${taskCategory}</span>
                    <span class="task-deadline">${taskDeadline || 'Sin fecha límite'}</span>
                </div>
                <div class="task-actions">
                    <button class="start-timer">⏱ Iniciar Cronómetro</button>
                    <button class="complete-task">✔</button>
                    <button class="delete-task">❌</button>
                </div>
            </li>
        `;

        $('#task-list').append(taskHTML);
        $('#new-task, #task-deadline').val('');
        showNotification('Tarea añadida correctamente.');
        updateTaskCounters();
    }

    // Mostrar tareas por estado
    function filterTasks(filter) {
        $('.task').show();
        if (filter === 'completed') {
            $('.task:not(.completed)').hide();
        } else if (filter === 'pending') {
            $('.task.completed').hide();
        }
    }

    // Buscar tareas
    function searchTasks(query) {
        $('.task').each(function () {
            const taskName = $(this).data('name');
            $(this).toggle(taskName.includes(query.toLowerCase()));
        });
    }

    // Ordenar tareas
    function sortTasks(sortBy) {
        const tasks = $('.task').toArray();
        if (sortBy === 'name') {
            tasks.sort((a, b) => $(a).data('name').localeCompare($(b).data('name')));
        } else if (sortBy === 'status') {
            tasks.sort((a, b) => $(a).hasClass('completed') - $(b).hasClass('completed'));
        }
        $('#task-list').html(tasks);
    }

    // Eventos generales
    $('#add-task').on('click', addTask);
    $('#toggle-theme').on('click', () => toggleTheme());
    $('#show-all').on('click', () => filterTasks('all'));
    $('#show-completed').on('click', () => filterTasks('completed'));
    $('#show-pending').on('click', () => filterTasks('pending'));
    $('#clear-tasks').on('click', () => {
        $('#task-list').empty();
        showNotification('Lista de tareas reiniciada.');
        updateTaskCounters();
    });
    $('#search-task').on('input', (e) => searchTasks(e.target.value));
    $('#sort-tasks').on('change', (e) => sortTasks(e.target.value));

    // Delegación de eventos
    $('#task-list')
        .on('click', '.complete-task', function () {
            $(this).closest('.task').toggleClass('completed');
            showNotification('Estado de la tarea actualizado.');
            updateTaskCounters();
        })
        .on('click', '.delete-task', function () {
            const taskElement = $(this).closest('.task');
            deletedTasks.push(taskElement.clone());
            taskElement.remove();
            showNotification('Tarea eliminada.');
            updateTaskCounters();
        })
        .on('click', '.start-timer', function () {
            const taskElement = $(this).closest('.task');
            startTaskTimer(taskElement);
        });

    // Restaurar última tarea eliminada
    $('#undo-delete').on('click', function () {
        if (deletedTasks.length > 0) {
            const taskToRestore = deletedTasks.pop();
            $('#task-list').append(taskToRestore);
            showNotification('Tarea restaurada.');
            updateTaskCounters();
        } else {
            showNotification('No hay tareas para restaurar.', 'error');
        }
    });

    // Control del cronómetro
    function formatElapsedTime(seconds) {
        const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${secs}`;
    }

    function startTaskTimer(taskElement) {
        if (activeTask) {
            showNotification('Ya hay un cronómetro en ejecución. Deténlo primero.', 'error');
            return;
        }

        activeTask = taskElement;
        elapsedTime = 0; // Reiniciar el tiempo
        timerInterval = setInterval(() => {
            elapsedTime++;
            $('#task-timer').text(formatElapsedTime(elapsedTime));
            // Actualizar el tiempo en el elemento de la tarea
            activeTask.data('timer', elapsedTime);
        }, 1000);
        showNotification(`Cronómetro iniciado para la tarea: ${activeTask.find('.task-name').text()}`);
    }

    $('#start-timer').on('click', function () {
        if (!timerInterval) {
            timerInterval = setInterval(() => {
                elapsedTime++;
                $('#task-timer').text(formatElapsedTime(elapsedTime));
            }, 1000);
            showNotification('Cronómetro iniciado.');
        }
    });

    $('#pause-timer').on('click', function () {
        clearInterval(timerInterval);
        timerInterval = null;
        showNotification('Cronómetro pausado.');
    });

    $('#reset-timer').on('click', function () {
        clearInterval(timerInterval);
        timerInterval = null;
        elapsedTime = 0;
        $('#task-timer').text('00:00:00');
        showNotification('Cronómetro reiniciado.');
    });

    // Inicializar estadísticas
    updateTaskCounters();
});