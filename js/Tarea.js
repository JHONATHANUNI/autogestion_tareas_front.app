document.addEventListener('DOMContentLoaded', () => {
    const loadEmployees = () => {
        fetch('/api/empleados')
            .then(response => response.json())
            .then(data => {
                const employeeSelect = document.getElementById('employee');
                const filterEmployeeSelect = document.getElementById('filter-employee');
                employeeSelect.innerHTML = '<option value="">Seleccione Responsable</option>';
                filterEmployeeSelect.innerHTML = '<option value="">Filtrar por Responsable</option>';
                data.forEach(employee => {
                    const option = document.createElement('option');
                    option.value = employee.id;
                    option.textContent = employee.nombre;
                    employeeSelect.appendChild(option);
                    filterEmployeeSelect.appendChild(option.cloneNode(true));
                });
            })
            .catch(error => console.error('Error al cargar empleados:', error));
    };

    const loadTasks = () => {
        fetch('/api/tareas')
            .then(response => response.json())
            .then(data => {
                const tasksTableBody = document.getElementById('tasks-table-body');
                tasksTableBody.innerHTML = '';
                data.forEach(task => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${task.título}</td>
                        <td>${task.descripción}</td>
                        <td>${task.fechaEstimadaFinalizacion}</td>
                        <td>${task.prioridad.nombre}</td>
                        <td>${task.estado.nombre}</td>
                        <td>${task.empleado.nombre}</td>
                        <td>
                            <button class="edit-button" data-id="${task.id}">Editar</button>
                            <button class="delete-button" data-id="${task.id}">Eliminar</button>
                        </td>
                    `;
                    tasksTableBody.appendChild(row);
                });
                addTaskEventListeners();
            })
            .catch(error => console.error('Error al cargar tareas:', error));
    };

    const addTaskEventListeners = () => {
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', handleEditTask);
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', handleDeleteTask);
        });
    };

    const handleCreateTask = event => {
        event.preventDefault();
        const taskData = {
            título: document.getElementById('title').value,
            descripción: document.getElementById('description').value,
            fechaEstimadaFinalizacion: document.getElementById('estimated-end-date').value,
            creadorTarea: document.getElementById('creator').value,
            IdEmpleado: document.getElementById('employee').value,
            IdEstado: document.getElementById('status').value,
            IdPrioridad: document.getElementById('priority').value,
            observaciones: document.getElementById('observations').value
        };
        fetch('/api/tareas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        .then(response => response.json())
        .then(() => {
            loadTasks();
            document.getElementById('create-task-form').reset();
        })
        .catch(error => console.error('Error al crear tarea:', error));
    };

    const handleEditTask = event => {
        const taskId = event.target.dataset.id;
        // Implementa la lógica para editar la tarea
        console.log('Editar tarea:', taskId);
    };

    const handleDeleteTask = event => {
        const taskId = event.target.dataset.id;
        fetch(`/api/tareas/${taskId}`, {
            method: 'DELETE'
        })
        .then(() => {
            loadTasks();
        })
        .catch(error => console.error('Error al eliminar tarea:', error));
    };

    const handleFilterTasks = () => {
        const title = document.getElementById('search-title').value;
        const startDate = document.getElementById('filter-start-date').value;
        const endDate = document.getElementById('filter-end-date').value;
        const priority = document.getElementById('filter-priority').value;
        const status = document.getElementById('filter-status').value;
        const employee = document.getElementById('filter-employee').value;

        let url = '/api/tareas?';
        if (title) url += `título=${title}&`;
        if (startDate) url += `startDate=${startDate}&`;
        if (endDate) url += `endDate=${endDate}&`;
        if (priority) url += `IdPrioridad=${priority}&`;
        if (status) url += `IdEstado=${status}&`;
        if (employee) url += `IdEmpleado=${employee}&`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const tasksTableBody = document.getElementById('tasks-table-body');
                tasksTableBody.innerHTML = '';
                data.forEach(task => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${task.título}</td>
                        <td>${task.descripción}</td>
                        <td>${task.fechaEstimadaFinalizacion}</td>
                        <td>${task.prioridad.nombre}</td>
                        <td>${task.estado.nombre}</td>
                        <td>${task.empleado.nombre}</td>
                        <td>
                            <button class="edit-button" data-id="${task.id}">Editar</button>
                            <button class="delete-button" data-id="${task.id}">Eliminar</button>
                        </td>
                    `;
                    tasksTableBody.appendChild(row);
                });
                addTaskEventListeners();
            })
            .catch(error => console.error('Error al filtrar tareas:', error));
    };

    document.getElementById('create-task-form').addEventListener('submit', handleCreateTask);
    document.getElementById('filter-button').addEventListener('click', handleFilterTasks);

    loadEmployees();
    loadTasks();
});
